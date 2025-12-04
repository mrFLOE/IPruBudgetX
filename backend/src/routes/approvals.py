from flask import Blueprint, request, jsonify
from ..services.approval_service import approval_service
from ..services.request_service import request_service
from ..utils.auth_utils import token_required, role_required

approvals_bp = Blueprint('approvals', __name__)

APPROVER_ROLES = ['TECH_LEAD', 'DEPT_HEAD', 'FINANCE_ADMIN', 'FPNA', 'PRINCIPAL_FINANCE', 'CFO', 'SUPER_ADMIN']

@approvals_bp.route('/approvals/pending', methods=['GET'])
@token_required
@role_required(*APPROVER_ROLES)
def get_pending_approvals():
    pending = approval_service.get_pending_approvals_for_user(request.user_id, request.user_role)
    return jsonify(pending), 200

@approvals_bp.route('/timeline/<request_id>', methods=['GET'])
@token_required
def get_timeline(request_id):
    budget_request = request_service.get_request_by_id(request_id)

    if not budget_request:
        return jsonify({'error': 'Request not found'}), 404

    timeline = approval_service.get_request_timeline(request_id)

    return jsonify({
        'request': budget_request,
        'timeline': timeline
    }), 200

@approvals_bp.route('/requests/<request_id>/approve', methods=['POST'])
@token_required
@role_required(*APPROVER_ROLES)
def approve_request(request_id):
    data = request.get_json()

    budget_request = request_service.get_request_by_id(request_id)

    if not budget_request:
        return jsonify({'error': 'Request not found'}), 404

    if budget_request['status'] != 'PENDING':
        return jsonify({'error': 'Request is not in pending status'}), 400

    result = approval_service.approve_request(
        request_id,
        request.user_id,
        request.user_role,
        data.get('comments')
    )

    return jsonify(result), 200

@approvals_bp.route('/requests/<request_id>/reject', methods=['POST'])
@token_required
@role_required(*APPROVER_ROLES)
def reject_request(request_id):
    data = request.get_json()

    if not data.get('comments'):
        return jsonify({'error': 'Comments are required for rejection'}), 400

    budget_request = request_service.get_request_by_id(request_id)

    if not budget_request:
        return jsonify({'error': 'Request not found'}), 404

    if budget_request['status'] != 'PENDING':
        return jsonify({'error': 'Request is not in pending status'}), 400

    result = approval_service.reject_request(
        request_id,
        request.user_id,
        request.user_role,
        data['comments']
    )

    return jsonify(result), 200

@approvals_bp.route('/requests/<request_id>/rework', methods=['POST'])
@token_required
@role_required(*APPROVER_ROLES)
def rework_request(request_id):
    data = request.get_json()

    if not data.get('comments'):
        return jsonify({'error': 'Comments are required for rework'}), 400

    budget_request = request_service.get_request_by_id(request_id)

    if not budget_request:
        return jsonify({'error': 'Request not found'}), 404

    if budget_request['status'] != 'PENDING':
        return jsonify({'error': 'Request is not in pending status'}), 400

    result = approval_service.rework_request(
        request_id,
        request.user_id,
        request.user_role,
        data['comments']
    )

    return jsonify(result), 200
