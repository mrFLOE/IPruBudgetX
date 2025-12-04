from flask import Blueprint, request, jsonify
from ..services.user_service import user_service
from ..services.audit_service import audit_service
from ..utils.auth_utils import token_required, role_required

users_bp = Blueprint('users', __name__)

@users_bp.route('/admin/users', methods=['GET'])
@token_required
@role_required('SUPER_ADMIN')
def get_all_users():
    users = user_service.get_all_users()
    return jsonify(users), 200

@users_bp.route('/admin/users', methods=['POST'])
@token_required
@role_required('SUPER_ADMIN')
def create_user():
    data = request.get_json()

    required_fields = ['name', 'email', 'password', 'role']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    user = user_service.create_user(
        name=data['name'],
        email=data['email'],
        password=data['password'],
        role=data['role'],
        department_id=data.get('department_id')
    )

    if not user:
        return jsonify({'error': 'Failed to create user'}), 500

    audit_service.log_action(request.user_id, 'USER_CREATED', {
        'created_user_id': user['id'],
        'role': data['role']
    })

    return jsonify(user), 201

@users_bp.route('/admin/users/<user_id>', methods=['GET'])
@token_required
@role_required('SUPER_ADMIN')
def get_user(user_id):
    user = user_service.get_user_by_id(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user), 200

@users_bp.route('/admin/users/<user_id>', methods=['PATCH'])
@token_required
@role_required('SUPER_ADMIN')
def update_user(user_id):
    data = request.get_json()

    user = user_service.update_user(user_id, data)

    if not user:
        return jsonify({'error': 'Failed to update user'}), 500

    audit_service.log_action(request.user_id, 'USER_UPDATED', {
        'updated_user_id': user_id,
        'changes': data
    })

    return jsonify(user), 200

@users_bp.route('/admin/users/<user_id>/lock', methods=['PATCH'])
@token_required
@role_required('SUPER_ADMIN')
def lock_user(user_id):
    user_service.lock_user(user_id)

    audit_service.log_action(request.user_id, 'USER_LOCKED_BY_ADMIN', {
        'locked_user_id': user_id
    })

    return jsonify({'message': 'User locked successfully'}), 200

@users_bp.route('/admin/users/<user_id>/unlock', methods=['PATCH'])
@token_required
@role_required('SUPER_ADMIN')
def unlock_user(user_id):
    user_service.unlock_user(user_id)

    audit_service.log_action(request.user_id, 'USER_UNLOCKED', {
        'unlocked_user_id': user_id
    })

    return jsonify({'message': 'User unlocked successfully'}), 200

@users_bp.route('/admin/users/<user_id>', methods=['DELETE'])
@token_required
@role_required('SUPER_ADMIN')
def delete_user(user_id):
    user_service.delete_user(user_id)

    audit_service.log_action(request.user_id, 'USER_DELETED', {
        'deleted_user_id': user_id
    })

    return jsonify({'message': 'User deleted successfully'}), 200
