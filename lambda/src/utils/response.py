"""
Response utilities for Lambda functions
"""

import json
from typing import Dict, Any, Optional


def create_response(
    status_code: int,
    body: Any,
    headers: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Create a standardized API Gateway response

    Args:
        status_code: HTTP status code
        body: Response body (will be JSON encoded)
        headers: Additional headers

    Returns:
        API Gateway response dict
    """
    default_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*'
    }

    if headers:
        default_headers.update(headers)

    return {
        'statusCode': status_code,
        'headers': default_headers,
        'body': json.dumps(body)
    }


def success_response(data: Any, message: Optional[str] = None) -> Dict[str, Any]:
    """Create a 200 success response"""
    body = {'success': True, 'data': data}
    if message:
        body['message'] = message
    return create_response(200, body)


def created_response(data: Any, message: Optional[str] = None) -> Dict[str, Any]:
    """Create a 201 created response"""
    body = {'success': True, 'data': data}
    if message:
        body['message'] = message
    return create_response(201, body)


def error_response(
    status_code: int,
    error: str,
    details: Optional[Any] = None
) -> Dict[str, Any]:
    """Create an error response"""
    body = {'success': False, 'error': error}
    if details:
        body['details'] = details
    return create_response(status_code, body)


def bad_request(error: str, details: Optional[Any] = None) -> Dict[str, Any]:
    """Create a 400 bad request response"""
    return error_response(400, error, details)


def unauthorized(error: str = 'Unauthorized') -> Dict[str, Any]:
    """Create a 401 unauthorized response"""
    return error_response(401, error)


def forbidden(error: str = 'Forbidden') -> Dict[str, Any]:
    """Create a 403 forbidden response"""
    return error_response(403, error)


def not_found(error: str = 'Resource not found') -> Dict[str, Any]:
    """Create a 404 not found response"""
    return error_response(404, error)


def server_error(error: str = 'Internal server error') -> Dict[str, Any]:
    """Create a 500 server error response"""
    return error_response(500, error)
