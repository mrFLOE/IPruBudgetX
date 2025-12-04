from ..utils.db_utils import db_client
from ..utils.auth_utils import hash_password
from typing import List, Dict, Optional
import uuid

class UserService:
    @staticmethod
    def create_user(name: str, email: str, password: str, role: str, department_id: str = None) -> Optional[Dict]:
        user_id = str(uuid.uuid4())
        password_hash = hash_password(password)

        query = """
        INSERT INTO users (id, name, email, password_hash, role, department_id, is_locked, failed_attempts, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, false, 0, NOW(), NOW())
        RETURNING id, name, email, role, department_id, is_locked, created_at
        """

        return db_client.execute_one(query, (user_id, name, email, password_hash, role, department_id))

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict]:
        query = "SELECT id, name, email, role, department_id, is_locked, failed_attempts, created_at FROM users WHERE id = %s"
        return db_client.execute_one(query, (user_id,))

    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict]:
        query = "SELECT * FROM users WHERE email = %s"
        return db_client.execute_one(query, (email,))

    @staticmethod
    def get_all_users() -> List[Dict]:
        query = "SELECT id, name, email, role, department_id, is_locked, failed_attempts, created_at FROM users ORDER BY created_at DESC"
        return db_client.execute_query(query) or []

    @staticmethod
    def update_user(user_id: str, data: Dict) -> Optional[Dict]:
        updates = []
        params = []

        if 'name' in data:
            updates.append("name = %s")
            params.append(data['name'])
        if 'email' in data:
            updates.append("email = %s")
            params.append(data['email'])
        if 'role' in data:
            updates.append("role = %s")
            params.append(data['role'])
        if 'department_id' in data:
            updates.append("department_id = %s")
            params.append(data['department_id'])
        if 'password' in data:
            updates.append("password_hash = %s")
            params.append(hash_password(data['password']))

        if not updates:
            return None

        updates.append("updated_at = NOW()")
        params.append(user_id)

        query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s RETURNING id, name, email, role, department_id, is_locked"
        return db_client.execute_one(query, tuple(params))

    @staticmethod
    def lock_user(user_id: str) -> bool:
        query = "UPDATE users SET is_locked = true, updated_at = NOW() WHERE id = %s"
        db_client.execute_query(query, (user_id,), fetch=False)
        return True

    @staticmethod
    def unlock_user(user_id: str) -> bool:
        query = "UPDATE users SET is_locked = false, failed_attempts = 0, updated_at = NOW() WHERE id = %s"
        db_client.execute_query(query, (user_id,), fetch=False)
        return True

    @staticmethod
    def increment_failed_attempts(user_id: str) -> int:
        query = "UPDATE users SET failed_attempts = failed_attempts + 1, updated_at = NOW() WHERE id = %s RETURNING failed_attempts"
        result = db_client.execute_one(query, (user_id,))
        return result['failed_attempts'] if result else 0

    @staticmethod
    def reset_failed_attempts(user_id: str) -> bool:
        query = "UPDATE users SET failed_attempts = 0, updated_at = NOW() WHERE id = %s"
        db_client.execute_query(query, (user_id,), fetch=False)
        return True

    @staticmethod
    def delete_user(user_id: str) -> bool:
        query = "DELETE FROM users WHERE id = %s"
        db_client.execute_query(query, (user_id,), fetch=False)
        return True

user_service = UserService()
