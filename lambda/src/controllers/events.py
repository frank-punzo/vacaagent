"""Event controller - handles vacation events"""

from typing import Dict, Any
from utils.response import success_response, created_response, not_found, server_error
from utils.database import execute_query, execute_insert
from utils.auth import get_user_id


def list_events(event: Dict[str, Any]) -> Dict[str, Any]:
    """List all events for a vacation"""
    try:
        vacation_id = event.get('path_parameters', {}).get('vacation_id')
        user_id = get_user_id(event)

        # Verify access
        if not _has_access(vacation_id, user_id):
            return not_found()

        events = execute_query(
            "SELECT * FROM events WHERE vacation_id = %s ORDER BY event_date, event_time",
            (vacation_id,)
        )

        return success_response(events or [])
    except Exception as e:
        print(f"Error: {str(e)}")
        return server_error()


def create_event(event: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new event"""
    try:
        vacation_id = event.get('path_parameters', {}).get('vacation_id')
        user_id = get_user_id(event)
        body = event.get('body_json', {})

        if not _has_access(vacation_id, user_id):
            return not_found()

        event_id = execute_insert(
            """INSERT INTO events (vacation_id, title, description, event_date, event_time, dress_code, created_by)
               VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
            (vacation_id, body['title'], body.get('description'), body['event_date'],
             body.get('event_time'), body.get('dress_code'), user_id)
        )

        new_event = execute_query("SELECT * FROM events WHERE id = %s", (event_id,), fetch_one=True)
        return created_response(new_event)
    except Exception as e:
        print(f"Error: {str(e)}")
        return server_error()


def update_event(event: Dict[str, Any]) -> Dict[str, Any]:
    """Update an event"""
    try:
        vacation_id = event.get('path_parameters', {}).get('vacation_id')
        event_id = event.get('path_parameters', {}).get('event_id')
        user_id = get_user_id(event)
        body = event.get('body_json', {})

        if not _has_access(vacation_id, user_id):
            return not_found()

        fields = ['title', 'description', 'event_date', 'event_time', 'dress_code']
        updates = [f"{f} = %s" for f in fields if f in body]
        params = [body[f] for f in fields if f in body] + [event_id, vacation_id]

        if updates:
            execute_query(
                f"UPDATE events SET {', '.join(updates)} WHERE id = %s AND vacation_id = %s",
                tuple(params)
            )

        updated = execute_query("SELECT * FROM events WHERE id = %s", (event_id,), fetch_one=True)
        return success_response(updated)
    except Exception as e:
        print(f"Error: {str(e)}")
        return server_error()


def delete_event(event: Dict[str, Any]) -> Dict[str, Any]:
    """Delete an event"""
    try:
        vacation_id = event.get('path_parameters', {}).get('vacation_id')
        event_id = event.get('path_parameters', {}).get('event_id')
        user_id = get_user_id(event)

        if not _has_access(vacation_id, user_id):
            return not_found()

        execute_query("DELETE FROM events WHERE id = %s AND vacation_id = %s", (event_id, vacation_id))
        return success_response({}, 'Event deleted')
    except Exception as e:
        print(f"Error: {str(e)}")
        return server_error()


def _has_access(vacation_id: str, user_id: str) -> bool:
    """Check if user has access to vacation"""
    result = execute_query(
        "SELECT 1 FROM vacation_members WHERE vacation_id = %s AND user_id = %s",
        (vacation_id, user_id), fetch_one=True
    )
    return result is not None
