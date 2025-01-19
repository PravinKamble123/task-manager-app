import logging
from flask import Blueprint, request, jsonify, g
from models import db, User, Task
from utils import hash_password, check_password, create_jwt_token, jwt_required

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)
task_bp = Blueprint('tasks', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user with a username and password"""
    
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if User.query.filter_by(username=username).first():
        logger.warning(f"Username '{username}' already exists")
        return jsonify({"message": "Username already exists"}), 400

    # Hash the password and create a new user
    hashed_password = hash_password(password)
    user = User(username=username, password=hashed_password)
    db.session.add(user)
    db.session.commit()

    logger.info(f"User '{username}' registered successfully")
    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """ Login a user by validating their credentials and returning a JWT token """
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    
    user = User.query.filter_by(username=username).first()
    if not user:
        logger.warning(f"Login failed: User '{username}' not found")
        return jsonify({'message': "User not found"}), 400
    if user and check_password(user.password, password):
        access_token = create_jwt_token(user.id)
        logger.info(f"User '{username}' logged in successfully")
        return jsonify(access_token=access_token, username=username), 200

    logger.warning(f"Invalid credentials for user '{username}'")
    return jsonify({"message": "Invalid credentials"}), 401

@task_bp.route('/add', methods=['POST'])
@jwt_required
def create_task():
    """ Create a new task for the logged-in user"""
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')

    task = Task(title=title, description=description, user_id=g.user_id)
    db.session.add(task)
    db.session.commit()

    logger.info(f"Task '{title}' created successfully by user ID {g.user_id}")
    return jsonify({"message": "Task created successfully", "task_id": task.id}), 201


@task_bp.route('/', methods=['GET'])
@jwt_required
def get_tasks():
    """Get all tasks for the logged-in user """
    tasks = Task.query.filter_by(user_id=g.user_id).all()
    tasks_list = [{"id": task.id, "title": task.title, "description": task.description, "created_at": task.created_at} for task in tasks]
    
    logger.info(f"Retrieved {len(tasks)} tasks for user ID {g.user_id}")
    return jsonify(tasks=tasks_list), 200

@task_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required
def update_task(task_id):
    """ Update a task's title and description"""

    task = Task.query.filter_by(id=task_id, user_id=g.user_id).first()
    
    if not task:
        logger.warning(f"Task with ID {task_id} not found for user ID {g.user_id}")
        return jsonify({"message": "Task not found"}), 404

    data = request.get_json()
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    db.session.commit()

    logger.info(f"Task with ID {task_id} updated successfully by user ID {g.user_id}")
    return jsonify({"message": "Task updated successfully"}), 200

@task_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required
def delete_task(task_id):
    """Delete a task for the logged-in user """

    task = Task.query.filter_by(id=task_id, user_id=g.user_id).first()

    if not task:
        logger.warning(f"Task with ID {task_id} not found for user ID {g.user_id}")
        return jsonify({"message": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()

    logger.info(f"Task with ID {task_id} deleted successfully by user ID {g.user_id}")
    return jsonify({"message": "Task deleted successfully"}), 200
