'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FormContainer, Input } from '@/components/form';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  
  const [generalError, setGeneralError] = useState('');

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error saat user mulai ketik
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      // Redirect ke home setelah login sukses
      router.push('/');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Login failed. Please check your credentials.';
      setGeneralError(errorMessage);
    }
  };

  return (
    <FormContainer
      title="Login"
      subtitle="Welcome back to Seblak Prasmanan"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={generalError}
    >
      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
      />

      {/* Register Link */}
      <div className="text-center mt-6">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-red-600 hover:text-red-700 font-semibold">
            Register here
          </Link>
        </p>
      </div>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
        <p className="font-semibold mb-2">Demo Credentials:</p>
        <p>📧 Email: customer@example.com</p>
        <p>🔑 Password: password123</p>
      </div>
    </FormContainer>
  );
}