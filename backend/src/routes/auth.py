from flask import Blueprint, request, jsonify
from ..services.auth_service import auth_service
from ..utils.auth_utils import token_required, role_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    result = auth_service.login(data['email'], data['password'])

    if 'error' in result:
        return jsonify(result), 401

    return jsonify(result), 200

@auth_bp.route('/auth/unlock', methods=['POST'])
@token_required
@role_required('SUPER_ADMIN')
def unlock_user():
    data = request.get_json()

    if not data or not data.get('user_id'):
        return jsonify({'error': 'User ID is required'}), 400

    result = auth_service.unlock_account(request.user_id, data['user_id'])
    return jsonify(result), 200

@auth_bp.route('/auth/me', methods=['GET'])
@token_required
def get_current_user():
    from ..services.user_service import user_service

    user = user_service.get_user_by_id(request.user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'role': user['role'],
        'department_id': user['department_id'],
        'is_locked': user['is_locked']
    }), 200
