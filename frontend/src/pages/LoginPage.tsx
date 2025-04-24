import React from 'react';
import Login from '../components/Auth/Login';
import { Logo } from '../components/ui/Logo';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-6 sm:px-12">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left section: Welcome message and logo */}
        <div className="text-center md:text-left">
          <Logo labelVisibility="always" size="xl"/>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-6">
            Welcome Back!
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Please log in to your account to continue.
          </p>
        </div>

        {/* Right section: Login form */}
        <div>
          <Login />
        </div>
        
      </div>
    </div>
  );
};

export default LoginPage;
