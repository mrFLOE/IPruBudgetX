from ..utils.db_utils import db_client
from typing import Dict, List, Optional
import uuid
import json

class AuditService:
    @staticmethod
    def log_action(user_id: str, action: str, metadata: Dict = None) -> Optional[Dict]:
        audit_id = str(uuid.uuid4())

        query = """
        INSERT INTO audit_logs (id, user_id, action, metadata, timestamp)
        VALUES (%s, %s, %s, %s, NOW())
        RETURNING id, user_id, action, metadata, timestamp
        """

        metadata_json = json.dumps(metadata) if metadata else None
        return db_client.execute_one(query, (audit_id, user_id, action, metadata_json))

    @staticmethod
    def get_user_logs(user_id: str, limit: int = 100) -> List[Dict]:
        query = """
        SELECT al.*, u.name as user_name, u.email as user_email
        FROM audit_logs al
        JOIN users u ON al.user_id = u.id
        WHERE al.user_id = %s
        ORDER BY al.timestamp DESC
        LIMIT %s
        """
        return db_client.execute_query(query, (user_id, limit)) or []

    @staticmethod
    def get_all_logs(limit: int = 100) -> List[Dict]:
        query = """
        SELECT al.*, u.name as user_name, u.email as user_email
        FROM audit_logs al
        JOIN users u ON al.user_id = u.id
        ORDER BY al.timestamp DESC
        LIMIT %s
        """
        return db_client.execute_query(query, (limit,)) or []

    @staticmethod
    def get_logs_by_action(action: str, limit: int = 100) -> List[Dict]:
        query = """
        SELECT al.*, u.name as user_name, u.email as user_email
        FROM audit_logs al
        JOIN users u ON al.user_id = u.id
        WHERE al.action = %s
        ORDER BY al.timestamp DESC
        LIMIT %s
        """
        return db_client.execute_query(query, (action, limit)) or []

audit_service = AuditService()
