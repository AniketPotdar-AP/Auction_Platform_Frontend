import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card } from 'primereact/card';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import CustomInput from '../../components/CustomInput';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { register, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | any) => {
    const { name, value } = e.target || e;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the store
    } finally {
      setIsLoading(false);
    }
  };

  const header = (
    <div className="text-center mt-4">
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#4f46e5' }}>Join <span style={{ color: '#14b8a6' }}>Aucto</span></h1>
      <p>Start your bidding adventure today</p>
    </div>
  );


  return (
    <div className="min-h-screen flex align-items-center justify-center px-4 pt-6 pb-6" style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #FFB300 100%)' }}>
      <Card header={header} className="w-full max-w-lg shadow-2xl border-0 px-4 rounded-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">Create Account</h2>
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <CustomInput
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <CustomInput
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <Password
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              toggleMask
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <Password
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              toggleMask
            />
          </div>
          {error && (
            <Message severity="error" text={error} className="mb-4" />
          )}
          <Button
            type="submit"
            label={isLoading ? 'Creating Account...' : 'Create Account'}
            loading={isLoading}
            className="w-full"
            style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #1557B0 100%)', border: 'none' }}
          />
        </form>
        <div className="mt-6 text-center">
          <p>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: 500 }}>
              Sign in here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;