from flask import Blueprint, jsonify
from ..utils.db_utils import db_client

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    try:
        result = db_client.execute_one("SELECT 1 as status")
        db_status = 'connected' if result else 'disconnected'
    except Exception as e:
        db_status = f'error: {str(e)}'

    return jsonify({
        'status': 'healthy',
        'service': 'IpruBudgetX API',
        'database': db_status,
        'version': '1.0.0'
    }), 200
