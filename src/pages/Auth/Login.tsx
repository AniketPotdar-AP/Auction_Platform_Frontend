import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card } from 'primereact/card';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import CustomInput from '../../components/CustomInput';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      // store handles error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)' }}>
      <Card
        className="w-full max-w-md shadow-2xl rounded-2xl py-6 px-4 bg-white border-0"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#4f46e5' }}>Welcome to <span style={{ color: '#14b8a6' }}>Aucto</span></h1>
          <p className="text-gray-500">Your Premier Online Auction Platform</p>
        </div>

        <h2 className="text-xl font-semibold mb-5 text-center text-gray-700">Sign In</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <CustomInput
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Password</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              toggleMask
              className="w-full"
            />
          </div>

          {/* Error message */}
          {error && <Message severity="error" text={error} className="w-full" />}

          {/* Button */}
          <Button
            type="submit"
            label={isLoading ? 'Signing In...' : 'Sign In'}
            loading={isLoading}
            className="w-full"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none' }}
          />
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#6366f1', fontWeight: 500 }}>
              Register here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
