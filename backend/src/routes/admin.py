from flask import Blueprint, request, jsonify
from ..services.department_service import department_service
from ..services.audit_service import audit_service
from ..utils.db_utils import db_client
from ..utils.auth_utils import token_required, role_required
import json

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/departments', methods=['GET'])
@token_required
def get_departments():
    departments = department_service.get_all_departments()
    return jsonify(departments), 200

@admin_bp.route('/admin/departments', methods=['POST'])
@token_required
@role_required('SUPER_ADMIN')
def create_department():
    data = request.get_json()

    if not data.get('name'):
        return jsonify({'error': 'Department name is required'}), 400

    department = department_service.create_department(data['name'])

    if not department:
        return jsonify({'error': 'Failed to create department'}), 500

    audit_service.log_action(request.user_id, 'DEPARTMENT_CREATED', {
        'department_id': department['id'],
        'name': department['name']
    })

    return jsonify(department), 201

@admin_bp.route('/admin/departments/<dept_id>', methods=['PATCH'])
@token_required
@role_required('SUPER_ADMIN')
def update_department(dept_id):
    data = request.get_json()

    if not data.get('name'):
        return jsonify({'error': 'Department name is required'}), 400

    department = department_service.update_department(dept_id, data['name'])

    if not department:
        return jsonify({'error': 'Failed to update department'}), 500

    audit_service.log_action(request.user_id, 'DEPARTMENT_UPDATED', {
        'department_id': dept_id,
        'name': data['name']
    })

    return jsonify(department), 200

@admin_bp.route('/admin/departments/<dept_id>', methods=['DELETE'])
@token_required
@role_required('SUPER_ADMIN')
def delete_department(dept_id):
    department_service.delete_department(dept_id)

    audit_service.log_action(request.user_id, 'DEPARTMENT_DELETED', {
        'department_id': dept_id
    })

    return jsonify({'message': 'Department deleted successfully'}), 200

@admin_bp.route('/admin/hierarchy', methods=['GET'])
@token_required
@role_required('SUPER_ADMIN')
def get_hierarchy():
    config = db_client.execute_one("SELECT value FROM system_config WHERE key = 'approval_hierarchy'")

    if not config:
        return jsonify({'error': 'Hierarchy not found'}), 404

    hierarchy = json.loads(config['value'])
    return jsonify({'hierarchy': hierarchy}), 200

@admin_bp.route('/admin/hierarchy', methods=['PATCH'])
@token_required
@role_required('SUPER_ADMIN')
def update_hierarchy():
    data = request.get_json()

    if not data.get('hierarchy') or not isinstance(data['hierarchy'], list):
        return jsonify({'error': 'Valid hierarchy array is required'}), 400

    hierarchy_json = json.dumps(data['hierarchy'])

    query = "UPDATE system_config SET value = %s, updated_at = NOW() WHERE key = 'approval_hierarchy'"
    db_client.execute_query(query, (hierarchy_json,), fetch=False)

    audit_service.log_action(request.user_id, 'HIERARCHY_UPDATED', {
        'hierarchy': data['hierarchy']
    })

    return jsonify({'message': 'Hierarchy updated successfully', 'hierarchy': data['hierarchy']}), 200

@admin_bp.route('/admin/audit-logs', methods=['GET'])
@token_required
@role_required('SUPER_ADMIN')
def get_audit_logs():
    limit = request.args.get('limit', 100, type=int)
    logs = audit_service.get_all_logs(limit)
    return jsonify(logs), 200

@admin_bp.route('/admin/audit-logs/<user_id>', methods=['GET'])
@token_required
@role_required('SUPER_ADMIN')
def get_user_audit_logs(user_id):
    limit = request.args.get('limit', 100, type=int)
    logs = audit_service.get_user_logs(user_id, limit)
    return jsonify(logs), 200

@admin_bp.route('/admin/stats', methods=['GET'])
@token_required
@role_required('SUPER_ADMIN')
def get_stats():
    stats = {}

    stats['total_users'] = db_client.execute_one("SELECT COUNT(*) as count FROM users")['count']
    stats['total_departments'] = db_client.execute_one("SELECT COUNT(*) as count FROM departments")['count']
    stats['total_requests'] = db_client.execute_one("SELECT COUNT(*) as count FROM budget_requests")['count']
    stats['pending_requests'] = db_client.execute_one("SELECT COUNT(*) as count FROM budget_requests WHERE status = 'PENDING'")['count']
    stats['approved_requests'] = db_client.execute_one("SELECT COUNT(*) as count FROM budget_requests WHERE status = 'FINAL_APPROVED'")['count']
    stats['rejected_requests'] = db_client.execute_one("SELECT COUNT(*) as count FROM budget_requests WHERE status = 'REJECTED'")['count']

    return jsonify(stats), 200
