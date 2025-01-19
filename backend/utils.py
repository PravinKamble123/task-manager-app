import jwt
import logging
from functools import wraps
from flask import request, jsonify, g, current_app
from datetime import datetime, timedelta
from werkzeug.exceptions import Unauthorized
from werkzeug.security import generate_password_hash, check_password_hash


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_access_token(user_id, expiration_minutes=30):
    """
    Creates a JWT token with iat (issued at) and exp (expiration).
    
    :param user_id: The user ID to include in the token
    :param expiration_minutes: The expiration time in minutes (default is 30)
    :return: JWT token as a string
    """
    expiration_time = datetime.utcnow() + timedelta(minutes=expiration_minutes)
    secret_key = current_app.config['JWT_SECRET_KEY']
    issued_at_time = datetime.utcnow()

    payload = {
        'user_id': user_id,
        'iat': issued_at_time,
        'exp': expiration_time
    }

    try:
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        logger.info(f"Created JWT for user {user_id} with expiration time {expiration_time}")
    except Exception as e:
        logger.error(f"Error creating JWT for user {user_id}: {str(e)}")
        raise e
    
    return token


def get_jwt_identity():
    """
    Extracts the user identity (user_id) from the JWT token.
    
    :return: user_id if the JWT token is valid, otherwise raises Unauthorized error
    """
    token = request.headers.get('Authorization')
    secret_key = current_app.config['JWT_SECRET_KEY']

    if not token:
        logger.warning("No token provided in request")
        raise Unauthorized("Token is missing")

    token = token.split('Bearer ')[-1]

    try:
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        logger.info(f"Decoded JWT token for user {payload['user_id']}")
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        logger.error("JWT token has expired")
        raise Unauthorized("Token has expired")
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid JWT token: {str(e)}")
        raise Unauthorized("Invalid token")


def jwt_required(f):
    """
    Decorator to protect a route and ensure that a valid JWT is provided.
    If the JWT is invalid or expired, an Unauthorized error will be raised.
    
    :param f: The function to be decorated.
    :return: The wrapped function with authentication check.
    """
    @wraps(f)
    def decorator(*args, **kwargs):
        try:
            g.user_id = get_jwt_identity()
        except Unauthorized as e:
            logger.error(f"Unauthorized access attempt: {str(e)}")
            return jsonify({"message": str(e)}), 401
        return f(*args, **kwargs)

    return decorator

def hash_password(password: str) -> str:
    """
    Hash the provided password using a secure hash algorithm.
    :param password: The password to be hashed
    :return: Hashed password
    """
    hashed_password = generate_password_hash(password)
    logger.debug("Password hashed successfully")
    return hashed_password

def check_password(stored_hash: str, password: str) -> bool:
    """
    Check if the provided password matches the stored hash.
    :param stored_hash: The hashed password stored in the database
    :param password: The plaintext password to be checked
    :return: True if the password matches, False otherwise
    """
    match = check_password_hash(stored_hash, password)
    if match:
        logger.debug("Password match successful")
    else:
        logger.warning("Password match failed")
    return match

def create_jwt_token(user_id: int) -> str:
    """Generate access token."""
    logger.debug("Creating JWT token for user {user_id}")
    return create_access_token(user_id)
