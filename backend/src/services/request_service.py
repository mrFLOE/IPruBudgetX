from ..utils.db_utils import db_client
from ..services.audit_service import audit_service
from typing import List, Dict, Optional
import uuid

class RequestService:
    @staticmethod
    def create_request(requester_id: str, request_type: str, amount: float, category: str,
                      justification: str, department_id: str) -> Optional[Dict]:
        request_id = str(uuid.uuid4())

        query = """
        INSERT INTO budget_requests (id, type, amount, category, justification, department_id, requester_id, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'DRAFT', NOW(), NOW())
        RETURNING id, type, amount, category, justification, department_id, requester_id, status, created_at
        """

        result = db_client.execute_one(query, (request_id, request_type, amount, category, justification, department_id, requester_id))

        if result:
            audit_service.log_action(requester_id, 'REQUEST_CREATED', {
                'request_id': request_id,
                'type': request_type,
                'amount': amount
            })

        return result

    @staticmethod
    def get_request_by_id(request_id: str) -> Optional[Dict]:
        query = """
        SELECT br.*, u.name as requester_name, u.email as requester_email,
               d.name as department_name
        FROM budget_requests br
        JOIN users u ON br.requester_id = u.id
        JOIN departments d ON br.department_id = d.id
        WHERE br.id = %s
        """
        return db_client.execute_one(query, (request_id,))

    @staticmethod
    def get_requests_by_requester(requester_id: str) -> List[Dict]:
        query = """
        SELECT br.*, d.name as department_name
        FROM budget_requests br
        JOIN departments d ON br.department_id = d.id
        WHERE br.requester_id = %s
        ORDER BY br.created_at DESC
        """
        return db_client.execute_query(query, (requester_id,)) or []

    @staticmethod
    def get_all_requests() -> List[Dict]:
        query = """
        SELECT br.*, u.name as requester_name, u.email as requester_email,
               d.name as department_name
        FROM budget_requests br
        JOIN users u ON br.requester_id = u.id
        JOIN departments d ON br.department_id = d.id
        ORDER BY br.created_at DESC
        """
        return db_client.execute_query(query) or []

    @staticmethod
    def get_pending_requests_for_role(role: str) -> List[Dict]:
        query = """
        SELECT br.*, u.name as requester_name, u.email as requester_email,
               d.name as department_name
        FROM budget_requests br
        JOIN users u ON br.requester_id = u.id
        JOIN departments d ON br.department_id = d.id
        WHERE br.status = 'PENDING'
        ORDER BY br.created_at ASC
        """
        return db_client.execute_query(query) or []

    @staticmethod
    def update_request(request_id: str, data: Dict, user_id: str) -> Optional[Dict]:
        updates = []
        params = []

        if 'type' in data:
            updates.append("type = %s")
            params.append(data['type'])
        if 'amount' in data:
            updates.append("amount = %s")
            params.append(data['amount'])
        if 'category' in data:
            updates.append("category = %s")
            params.append(data['category'])
        if 'justification' in data:
            updates.append("justification = %s")
            params.append(data['justification'])
        if 'status' in data:
            updates.append("status = %s")
            params.append(data['status'])

        if not updates:
            return None

        updates.append("updated_at = NOW()")
        params.append(request_id)

        query = f"UPDATE budget_requests SET {', '.join(updates)} WHERE id = %s RETURNING *"
        result = db_client.execute_one(query, tuple(params))

        if result:
            audit_service.log_action(user_id, 'REQUEST_UPDATED', {
                'request_id': request_id,
                'changes': data
            })

        return result

    @staticmethod
    def submit_request(request_id: str, user_id: str) -> Optional[Dict]:
        query = "UPDATE budget_requests SET status = 'PENDING', updated_at = NOW() WHERE id = %s AND status = 'DRAFT' RETURNING *"
        result = db_client.execute_one(query, (request_id,))

        if result:
            audit_service.log_action(user_id, 'REQUEST_SUBMITTED', {
                'request_id': request_id
            })

        return result

    @staticmethod
    def delete_request(request_id: str, user_id: str) -> bool:
        query = "DELETE FROM budget_requests WHERE id = %s AND status = 'DRAFT'"
        db_client.execute_query(query, (request_id,), fetch=False)

        audit_service.log_action(user_id, 'REQUEST_DELETED', {
            'request_id': request_id
        })

        return True

request_service = RequestService()
