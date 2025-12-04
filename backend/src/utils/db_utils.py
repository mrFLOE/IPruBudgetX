import psycopg2
import psycopg2.extras
import os
from typing import Dict, List, Any, Optional
from contextlib import contextmanager

class DatabaseClient:
    def __init__(self):
        self.connection_string = os.getenv('DATABASE_URL')

    @contextmanager
    def get_connection(self):
        conn = psycopg2.connect(self.connection_string)
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def execute_query(self, query: str, params: tuple = None, fetch: bool = True) -> Optional[List[Dict[str, Any]]]:
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                    cursor.execute(query, params or ())
                    if fetch:
                        return [dict(row) for row in cursor.fetchall()]
                    return None
        except Exception as e:
            print(f"Database query error: {e}")
            return None

    def execute_one(self, query: str, params: tuple = None) -> Optional[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                    cursor.execute(query, params or ())
                    result = cursor.fetchone()
                    return dict(result) if result else None
        except Exception as e:
            print(f"Database query error: {e}")
            return None

    def set_rls_context(self, user_id: str, user_role: str) -> None:
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(f"SET app.current_user_id = '{user_id}'")
                    cursor.execute(f"SET app.current_user_role = '{user_role}'")
        except Exception as e:
            print(f"Failed to set RLS context: {e}")

db_client = DatabaseClient()
