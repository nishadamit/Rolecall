import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import Stamp from '../components/Stamp';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    login(email, password)
      .then((res) => {
        setUser(res.data.data);
        navigate('/dashboard');
      })
      .catch((err) => {
        message.error(err.response?.data?.error || 'Login failed');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-badge-wrap">
          <Stamp size="lg" label="RC" role="manager" />
        </div>
        <div className="auth-eyebrow">Access Portal</div>
        <div className="auth-title">Rolecall</div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@organization.com"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Logging In…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
