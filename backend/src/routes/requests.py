from flask import Blueprint, request, jsonify
from ..services.request_service import request_service
from ..services.audit_service import audit_service
from ..utils.auth_utils import token_required, role_required
from ..utils.gemini_utils import extract_budget_from_excel, generate_rationalization_suggestions
import openpyxl
import pandas as pd
import io

requests_bp = Blueprint('requests', __name__)

@requests_bp.route('/requests', methods=['POST'])
@token_required
@role_required('REQUESTOR', 'SUPER_ADMIN')
def create_request():
    data = request.get_json()

    required_fields = ['type', 'amount', 'category', 'justification', 'department_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    budget_request = request_service.create_request(
        requester_id=request.user_id,
        request_type=data['type'],
        amount=float(data['amount']),
        category=data['category'],
        justification=data['justification'],
        department_id=data['department_id']
    )

    if not budget_request:
        return jsonify({'error': 'Failed to create request'}), 500

    return jsonify(budget_request), 201

@requests_bp.route('/requests', methods=['GET'])
@token_required
def get_requests():
    if request.user_role == 'SUPER_ADMIN':
        requests = request_service.get_all_requests()
    elif request.user_role == 'REQUESTOR':
        requests = request_service.get_requests_by_requester(request.user_id)
    else:
        requests = request_service.get_all_requests()

    return jsonify(requests), 200

@requests_bp.route('/requests/<request_id>', methods=['GET'])
@token_required
def get_request(request_id):
    budget_request = request_service.get_request_by_id(request_id)

    if not budget_request:
        return jsonify({'error': 'Request not found'}), 404

    return jsonify(budget_request), 200

@requests_bp.route('/requests/<request_id>', methods=['PATCH'])
@token_required
@role_required('REQUESTOR', 'SUPER_ADMIN')
def update_request(request_id):
    data = request.get_json()

    budget_request = request_service.get_request_by_id(request_id)

    if not budget_request:
        return jsonify({'error': 'Request not found'}), 404

    if budget_request['requester_id'] != request.user_id and request.user_role != 'SUPER_ADMIN':
        return jsonify({'error': 'Unauthorized'}), 403

    if budget_request['status'] not in ['DRAFT', 'REWORK']:
        return jsonify({'error': 'Can only edit requests in DRAFT or REWORK status'}), 400

    updated_request = request_service.update_request(request_id, data, request.user_id)

    if not updated_request:
        return jsonify({'error': 'Failed to update request'}), 500

    return jsonify(updated_request), 200

@requests_bp.route('/requests/<request_id>/submit', methods=['POST'])
@token_required
@role_required('REQUESTOR', 'SUPER_ADMIN')
def submit_request(request_id):
    budget_request = request_service.get_request_by_id(request_id)

    if not budget_request:
        return jsonify({'error': 'Request not found'}), 404

    if budget_request['requester_id'] != request.user_id and request.user_role != 'SUPER_ADMIN':
        return jsonify({'error': 'Unauthorized'}), 403

    result = request_service.submit_request(request_id, request.user_id)

    if not result:
        return jsonify({'error': 'Failed to submit request'}), 500

    return jsonify(result), 200

@requests_bp.route('/requests/<request_id>', methods=['DELETE'])
@token_required
@role_required('REQUESTOR', 'SUPER_ADMIN')
def delete_request(request_id):
    budget_request = request_service.get_request_by_id(request_id)

    if not budget_request:
        return jsonify({'error': 'Request not found'}), 404

    if budget_request['requester_id'] != request.user_id and request.user_role != 'SUPER_ADMIN':
        return jsonify({'error': 'Unauthorized'}), 403

    request_service.delete_request(request_id, request.user_id)

    return jsonify({'message': 'Request deleted successfully'}), 200

@requests_bp.route('/requests/import/excel', methods=['POST'])
@token_required
@role_required('REQUESTOR', 'SUPER_ADMIN')
def import_excel():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if not file.filename.endswith(('.xlsx', '.xls')):
        return jsonify({'error': 'Invalid file format. Only Excel files are supported'}), 400

    try:
        file_content = file.read()
        df = pd.read_excel(io.BytesIO(file_content))
        file_data = df.to_dict(orient='records')

        extracted_data = extract_budget_from_excel(file.filename, file_data)

        if 'error' in extracted_data:
            return jsonify(extracted_data), 500

        return jsonify(extracted_data), 200

    except Exception as e:
        return jsonify({'error': f'Failed to process Excel file: {str(e)}'}), 500

@requests_bp.route('/requests/<request_id>/suggestions', methods=['GET'])
@token_required
def get_rationalization_suggestions(request_id):
    budget_request = request_service.get_request_by_id(request_id)

    if not budget_request:
        return jsonify({'error': 'Request not found'}), 404

    suggestions = generate_rationalization_suggestions(
        budget_request['justification'],
        float(budget_request['amount']),
        budget_request['category']
    )

    return jsonify({'suggestions': suggestions}), 200
