"""
IPruBudEx Backend API
Production Flask Application

Complete backend API for CAPEX/OPEX budget request and approval management system.
Supports multi-database switching via environment configuration.
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables from the .env file in the project root
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path=dotenv_path)

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from flask_cors import CORS
from src.config.settings import config
from src.routes.health import health_bp
from src.routes.auth import auth_bp
from src.routes.users import users_bp
from src.routes.requests import requests_bp
from src.routes.approvals import approvals_bp
from src.routes.admin import admin_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = config.SECRET_KEY

CORS(app, resources={
    r"/*": {
        "origins": config.CORS_ORIGINS,
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.register_blueprint(health_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(requests_bp)
app.register_blueprint(approvals_bp)
app.register_blueprint(admin_bp)

@app.route('/')
def index():
    return {
        'service': 'IPruBudEx API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'health': '/health',
            'auth': '/auth/*',
            'users': '/admin/users/*',
            'requests': '/requests/*',
            'approvals': '/approvals/*',
            'admin': '/admin/*'
        }
    }

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=config.PORT,
        debug=config.FLASK_DEBUG
    )