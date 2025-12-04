from ..utils.db_utils import db_client
from ..services.audit_service import audit_service
from typing import List, Dict, Optional
import uuid
import json

APPROVAL_HIERARCHY = [
    'TECH_LEAD',
    'DEPT_HEAD',
    'FINANCE_ADMIN',
    'FPNA',
    'PRINCIPAL_FINANCE',
    'CFO'
]

class ApprovalService:
    @staticmethod
    def get_next_approver_role(current_role: str) -> Optional[str]:
        try:
            current_index = APPROVAL_HIERARCHY.index(current_role)
            if current_index < len(APPROVAL_HIERARCHY) - 1:
                return APPROVAL_HIERARCHY[current_index + 1]
            return None
        except ValueError:
            return APPROVAL_HIERARCHY[0] if APPROVAL_HIERARCHY else None

    @staticmethod
    def get_request_timeline(request_id: str) -> List[Dict]:
        query = """
        SELECT ar.*, u.name as approver_name, u.email as approver_email
        FROM approval_records ar
        JOIN users u ON ar.approver_id = u.id
        WHERE ar.request_id = %s
        ORDER BY ar.timestamp ASC
        """
        return db_client.execute_query(query, (request_id,)) or []

    @staticmethod
    def create_approval_record(request_id: str, approver_id: str, role: str,
                              decision: str, comments: str = None) -> Optional[Dict]:
        record_id = str(uuid.uuid4())

        query = """
        INSERT INTO approval_records (id, request_id, approver_id, role, decision, comments, timestamp)
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
        RETURNING id, request_id, approver_id, role, decision, comments, timestamp
        """

        result = db_client.execute_one(query, (record_id, request_id, approver_id, role, decision, comments))

        if result:
            audit_service.log_action(approver_id, 'APPROVAL_ACTION', {
                'request_id': request_id,
                'decision': decision,
                'role': role
            })

        return result

    @staticmethod
    def approve_request(request_id: str, approver_id: str, role: str, comments: str = None) -> Dict:
        approval_record = ApprovalService.create_approval_record(
            request_id, approver_id, role, 'APPROVED', comments
        )

        if not approval_record:
            return {'error': 'Failed to create approval record'}

        next_role = ApprovalService.get_next_approver_role(role)

        if next_role:
            query = "UPDATE budget_requests SET status = 'PENDING', updated_at = NOW() WHERE id = %s"
            db_client.execute_query(query, (request_id,), fetch=False)
            return {
                'message': 'Request approved and forwarded to next approver',
                'next_role': next_role,
                'status': 'PENDING'
            }
        else:
            query = "UPDATE budget_requests SET status = 'FINAL_APPROVED', updated_at = NOW() WHERE id = %s"
            db_client.execute_query(query, (request_id,), fetch=False)
            return {
                'message': 'Request has been fully approved',
                'status': 'FINAL_APPROVED'
            }

    @staticmethod
    def reject_request(request_id: str, approver_id: str, role: str, comments: str) -> Dict:
        approval_record = ApprovalService.create_approval_record(
            request_id, approver_id, role, 'REJECTED', comments
        )

        if not approval_record:
            return {'error': 'Failed to create approval record'}

        query = "UPDATE budget_requests SET status = 'REJECTED', updated_at = NOW() WHERE id = %s"
        db_client.execute_query(query, (request_id,), fetch=False)

        return {'message': 'Request has been rejected', 'status': 'REJECTED'}

    @staticmethod
    def rework_request(request_id: str, approver_id: str, role: str, comments: str) -> Dict:
        approval_record = ApprovalService.create_approval_record(
            request_id, approver_id, role, 'REWORK', comments
        )

        if not approval_record:
            return {'error': 'Failed to create approval record'}

        query = "UPDATE budget_requests SET status = 'REWORK', updated_at = NOW() WHERE id = %s"
        db_client.execute_query(query, (request_id,), fetch=False)

        return {'message': 'Request sent back for rework', 'status': 'REWORK'}

    @staticmethod
    def get_pending_approvals_for_user(user_id: str, role: str) -> List[Dict]:
        timeline_query = """
        SELECT DISTINCT ar.request_id, ar.role
        FROM approval_records ar
        WHERE ar.request_id IN (
            SELECT id FROM budget_requests WHERE status = 'PENDING'
        )
        ORDER BY ar.timestamp DESC
        """

        approved_requests_by_role = {}
        timeline = db_client.execute_query(timeline_query) or []

        for record in timeline:
            request_id = record['request_id']
            if request_id not in approved_requests_by_role:
                approved_requests_by_role[request_id] = record['role']

        pending_requests = []
        requests_query = """
        SELECT br.*, u.name as requester_name, d.name as department_name
        FROM budget_requests br
        JOIN users u ON br.requester_id = u.id
        JOIN departments d ON br.department_id = d.id
        WHERE br.status = 'PENDING'
        ORDER BY br.created_at ASC
        """

        all_pending = db_client.execute_query(requests_query) or []

        for request in all_pending:
            request_id = request['id']
            last_approved_role = approved_requests_by_role.get(request_id)

            if last_approved_role:
                next_role = ApprovalService.get_next_approver_role(last_approved_role)
                if next_role == role:
                    pending_requests.append(request)
            elif role == APPROVAL_HIERARCHY[0]:
                pending_requests.append(request)

        return pending_requests

approval_service = ApprovalService()
