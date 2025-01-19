import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, setAuthToken } from '../api';

const userState = {
  user_id: null,
  username: "",
  access_token: null,
  refresh_token: null,
  is_authenticated: false,
};

export default function AuthForm({ isLogin: initialLoginState }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(initialLoginState);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.is_authenticated) {
      navigate('/tasks');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const credentials = { username, password };

    try {
      const data = isLogin
        ? await loginUser(credentials)
        : await registerUser(credentials);
      setAuthToken(data.access_token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          user_id: data.user_id,
          username: data.username,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          is_authenticated: true ? data.access_token : false,
        })
      );
      navigate('/tasks');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Authentication failed');
    }
  };

  const toggleForm = () => {
    setIsLogin((prevState) => !prevState);
    setErrorMessage('');
    setPassword("");
    setUsername('');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-4">
        {isLogin ? 'Login' : 'Register'}
      </h2>
      {errorMessage && (
        <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md"
        >
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm">
          {isLogin
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            onClick={toggleForm}
            className="text-blue-500 underline hover:text-blue-700"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
