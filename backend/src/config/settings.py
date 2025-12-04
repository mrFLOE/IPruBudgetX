import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret')
    DATABASE_URL = os.getenv('DATABASE_URL')
    DB_PROVIDER = os.getenv('DB_PROVIDER', 'postgresql')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    MAX_LOGIN_ATTEMPTS = int(os.getenv('MAX_LOGIN_ATTEMPTS', 3))
    JWT_EXPIRATION_MINUTES = int(os.getenv('JWT_EXPIRATION_MINUTES', 480))
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    PORT = int(os.getenv('PORT', 5000))
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'

config = Config()
