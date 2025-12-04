import os
import sys
from dotenv import load_dotenv

# Load environment variables from the .env file in the project root
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path=dotenv_path)

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.src.services.user_service import user_service
from backend.src.config.settings import config

def seed_tech_lead():
    """
    Creates or updates the tech lead user with a demo password.
    """
    email = "nithesh_m@ext.icicipruamc.com"
    password = "password"
    name = "Nithesh M"
    role = "REQUESTOR"
    department_id = None  # Or a valid department ID if you have one

    # Check if a department exists, and create one if it doesn't
    # For simplicity, we'll assume a department might not be necessary
    # or that one with a known ID exists.
    # In a real scenario, you might want to query for a department or create one.

    print(f"Attempting to create or update user: {email}")

    # Check if the user already exists
    existing_user = user_service.get_user_by_email(email)

    if existing_user:
        print(f"User with email {email} already exists. Unlocking account and updating password.")
        user_service.unlock_user(existing_user['id'])
        user_service.update_user(existing_user['id'], {'password': password})
        print("Account unlocked and password updated successfully.")
    else:
        print(f"User with email {email} does not exist. Creating new user.")
        new_user = user_service.create_user(
            name=name,
            email=email,
            password=password,
            role=role,
            department_id=department_id
        )
        if new_user:
            print("User created successfully:")
            print(new_user)
        else:
            print("Failed to create user.")

if __name__ == "__main__":
    seed_tech_lead()
