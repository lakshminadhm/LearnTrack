import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCredentials } from '../../../../shared/src/types';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<UserCredentials>({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await login(credentials);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <div className="py-8 px-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 dark:text-gray-100">Login to Your Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={credentials.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={credentials.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-700 dark:hover:bg-indigo-800"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-900"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.746,1.363-2.193,2.291-3.864,2.291c-2.432,0-4.4-1.968-4.4-4.4s1.968-4.4,4.4-4.4c1.259,0,2.389,0.53,3.182,1.379l1.526-1.526C17.715,6.294,16.208,5.6,14.545,5.6c-3.491,0-6.327,2.836-6.327,6.327s2.836,6.327,6.327,6.327c5.327,0,6.4-4.909,5.818-7.491H14.455C13.401,10.764,12.545,11.618,12.545,12.151z"
                  fill="#4285F4"
                />
                <path
                  d="M23.745,12.151L23.745,12.151v-1.385h-1.385v-1.385h-1.385v1.385h-1.385v1.385h1.385v1.385h1.385v-1.385H23.745z"
                  fill="#4285F4"
                />
                <path
                  d="M5.745,12.151L5.745,12.151c0-0.763,0.617-1.385,1.38-1.385H8.19V9.382H7.125c-1.526,0-2.762,1.236-2.762,2.762 s1.236,2.762,2.762,2.762H8.19v-1.385H7.125C6.365,13.521,5.745,12.909,5.745,12.151z"
                  fill="#34A853"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Register now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;