"""
Database connection utilities
"""

import os
import json
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, Dict
from contextlib import contextmanager


# Cache database credentials
_db_credentials = None


def get_db_credentials() -> Dict:
    """
    Retrieve database credentials from AWS Secrets Manager

    Returns:
        Dict with database connection info
    """
    global _db_credentials

    if _db_credentials:
        return _db_credentials

    secret_arn = os.environ.get('DB_SECRET_ARN')
    if not secret_arn:
        raise ValueError('DB_SECRET_ARN environment variable not set')

    # Get secret from Secrets Manager
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId=secret_arn)

    secret_string = response['SecretString']
    _db_credentials = json.loads(secret_string)

    return _db_credentials


@contextmanager
def get_db_connection():
    """
    Context manager for database connections

    Usage:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM vacations")
                results = cursor.fetchall()
    """
    credentials = get_db_credentials()

    conn = psycopg2.connect(
        host=credentials['host'],
        port=credentials['port'],
        database=credentials['dbname'],
        user=credentials['username'],
        password=credentials['password'],
        cursor_factory=RealDictCursor
    )

    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def execute_query(query: str, params: Optional[tuple] = None, fetch_one: bool = False):
    """
    Execute a database query

    Args:
        query: SQL query string
        params: Query parameters
        fetch_one: If True, fetch only one result

    Returns:
        Query results
    """
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params)

            if cursor.description:  # Query returns data
                if fetch_one:
                    return cursor.fetchone()
                return cursor.fetchall()

            return None


def execute_insert(query: str, params: Optional[tuple] = None):
    """
    Execute an INSERT query and return the inserted ID

    Args:
        query: SQL INSERT query with RETURNING id
        params: Query parameters

    Returns:
        Inserted record ID
    """
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            result = cursor.fetchone()
            return result['id'] if result else None
