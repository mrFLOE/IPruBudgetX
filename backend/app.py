"""
IPruBudEx Backend API
Flask Application - Phase 1: Placeholder

This file is a placeholder for the Flask backend API.
No routes, business logic, or controllers are implemented yet.
"""

from flask import Flask

app = Flask(__name__)

@app.route('/health')
def health_check():
    return {'status': 'healthy', 'message': 'IPruBudEx API - Phase 1 Placeholder'}

if __name__ == '__main__':
    app.run(debug=True)
