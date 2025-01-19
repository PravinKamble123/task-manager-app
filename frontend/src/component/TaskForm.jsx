import { useState, useEffect } from 'react';

export default function TaskForm({ showModal, setShowModal, handleCreateTask, task, isUpdate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isUpdate && task) {
      setTitle(task.title);
      setDescription(task.description);
    }
  }, [isUpdate, task]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const taskData = { title, description };
    await handleCreateTask(taskData);
    setTitle('');
    setDescription('');
    setShowModal(false);
  };

  return (
    showModal && (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-md w-96">
          <h2 className="text-xl font-semibold mb-4">{isUpdate ? 'Update Task' : 'Create New Task'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium">Title</label>
              <input
                id="title"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium">Description</label>
              <textarea
                id="description"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2 rounded-md"
            >
              {isUpdate ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full bg-red-500 text-white p-2 rounded-md mt-4"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    )
  );
}
