'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FormContainer, Input } from '@/components/form';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
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

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9\-+()]*$/.test(formData.phone)) {
      newErrors.phone = 'Phone number format is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      
      // Redirect ke home setelah register sukses
      router.push('/');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Registration failed. Please try again.';
      setGeneralError(errorMessage);
    }
  };

  return (
    <FormContainer
      title="Register"
      subtitle="Create your Seblak Prasmanan account"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={generalError}
    >
      <Input
        label="Full Name"
        type="text"
        name="fullName"
        placeholder="John Doe"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        required
      />

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
        label="Phone Number"
        type="tel"
        name="phone"
        placeholder="+62812345678 or 0812345678"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
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
        helperText="At least 6 characters"
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        required
      />

      {/* Login Link */}
      <div className="text-center mt-6">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-red-600 hover:text-red-700 font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </FormContainer>
  );
}