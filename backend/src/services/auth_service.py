from ..utils.db_utils import db_client
from ..utils.auth_utils import verify_password, generate_token
from ..services.user_service import user_service
from ..services.audit_service import audit_service
from ..config.settings import config
from typing import Optional, Dict

class AuthService:
    @staticmethod
    def login(email: str, password: str) -> Optional[Dict]:
        user = user_service.get_user_by_email(email)

        if not user:
            return {'error': 'Invalid credentials'}

        if user['is_locked']:
            return {'error': 'Account is locked. Please contact administrator.'}

        if not verify_password(password, user['password_hash']):
            failed_attempts = user_service.increment_failed_attempts(user['id'])

            if failed_attempts >= config.MAX_LOGIN_ATTEMPTS:
                user_service.lock_user(user['id'])
                audit_service.log_action(
                    user['id'],
                    'USER_LOCKED',
                    {'reason': 'Max failed login attempts exceeded'}
                )
                return {'error': f'Account locked after {config.MAX_LOGIN_ATTEMPTS} failed attempts'}

            return {'error': f'Invalid credentials. {config.MAX_LOGIN_ATTEMPTS - failed_attempts} attempts remaining.'}

        user_service.reset_failed_attempts(user['id'])

        token = generate_token(user['id'], user['role'])

        audit_service.log_action(user['id'], 'LOGIN', {'email': email})

        return {
            'token': token,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'department_id': user['department_id']
            }
        }

    @staticmethod
    def unlock_account(admin_user_id: str, target_user_id: str) -> Dict:
        user_service.unlock_user(target_user_id)

        audit_service.log_action(
            admin_user_id,
            'USER_UNLOCKED',
            {'target_user_id': target_user_id}
        )

        return {'message': 'User account unlocked successfully'}

auth_service = AuthService()
