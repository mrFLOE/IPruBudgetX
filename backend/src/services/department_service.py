from ..utils.db_utils import db_client
from typing import List, Dict, Optional
import uuid

class DepartmentService:
    @staticmethod
    def create_department(name: str) -> Optional[Dict]:
        dept_id = str(uuid.uuid4())

        query = """
        INSERT INTO departments (id, name, created_at)
        VALUES (%s, %s, NOW())
        RETURNING id, name, created_at
        """

        return db_client.execute_one(query, (dept_id, name))

    @staticmethod
    def get_department_by_id(dept_id: str) -> Optional[Dict]:
        query = "SELECT * FROM departments WHERE id = %s"
        return db_client.execute_one(query, (dept_id,))

    @staticmethod
    def get_all_departments() -> List[Dict]:
        query = "SELECT * FROM departments ORDER BY name ASC"
        return db_client.execute_query(query) or []

    @staticmethod
    def update_department(dept_id: str, name: str) -> Optional[Dict]:
        query = "UPDATE departments SET name = %s WHERE id = %s RETURNING id, name, created_at"
        return db_client.execute_one(query, (name, dept_id))

    @staticmethod
    def delete_department(dept_id: str) -> bool:
        query = "DELETE FROM departments WHERE id = %s"
        db_client.execute_query(query, (dept_id,), fetch=False)
        return True

department_service = DepartmentService()
