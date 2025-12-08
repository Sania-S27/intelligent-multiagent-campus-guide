import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // VVV THIS IS THE CHANGE VVV
    const role = await login(email, password); // This now returns 'admin', 'user', or null

    if (role === 'admin') {
      navigate('/admin/dashboard'); // 1. New Admin route
    } else if (role === 'user') {
      navigate('/dashboard'); // 2. Regular user route
    } else {
      setError('Invalid email or password. Please try again.');
    }
    // ^^^ END OF CHANGE ^^^
  };

  return (
    // ... (your existing login form JSX is perfect)
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
      <p>
        Or <Link to="/">return to Homepage</Link>
      </p>
    </div>
  );
};

export default Login;