import { useEffect, useState } from 'react';
import { getTasks, deleteTask, createTask, updateTask } from '../api';
import TaskForm from './TaskForm';
import { useNavigate } from 'react-router-dom';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || !userData.is_authenticated) {
      navigate('/login');
    } else {
      setUser(userData);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTasks = async () => {
      const data = await getTasks();
      setTasks(data);
    };
    fetchTasks();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
  };

  const handleCreateTask = async (taskData) => {
    await createTask(taskData);
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
  };

  const handleUpdateTask = async (taskData) => {
    await updateTask(selectedTask.id, taskData);
    const updatedTasks = await getTasks(); 
    setTasks(updatedTasks);
    setShowUpdateModal(false);
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setShowUpdateModal(true);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Welcome, {user?.username || 'User'}!</h2> {/* Display the logged-in username */}
      <h3 className="text-lg mb-4">My Tasks</h3>
      <div className="mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white p-2 rounded-md"
        >
          Create New Task
        </button>
      </div>
      <div className="mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white p-2 rounded-md"
        >
          Logout
        </button>
      </div>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className="flex justify-between p-2 border-b">
            <div>
              <h3 className="font-semibold">{task.title}</h3>
              <p>{task.description}</p>
            </div>
            <div>
              <button
                onClick={() => handleEditClick(task)}
                className="text-blue-500 mr-2"
              >
                Update
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <TaskForm
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        handleCreateTask={handleCreateTask}
      />

      <TaskForm
        showModal={showUpdateModal}
        setShowModal={setShowUpdateModal}
        task={selectedTask}
        handleCreateTask={handleUpdateTask}
        isUpdate={true}
      />
    </div>
  );
}
