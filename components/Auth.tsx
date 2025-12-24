
import React, { useState } from 'react';
import type { User } from '../types';
import { storageService } from '../services/storageService';
import { LoginIcon, UserAddIcon } from './icons';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password cannot be empty.');
      return;
    }

    if (isLogin) {
      const user = storageService.getUser(username);
      if (user && user.password === password) {
        onLogin(user);
      } else {
        setError('Invalid username or password.');
      }
    } else {
      const existingUser = storageService.getUser(username);
      if (existingUser) {
        setError('Username already exists.');
      } else {
        const newUser: User = { username, password, expenses: [], balance: 0 };
        storageService.saveUser(newUser);
        onLogin(newUser);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Expense Tracker</h1>
          <p className="text-slate-400">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-400 text-sm text-center bg-red-900/50 p-2 rounded">{error}</p>}
          <div>
            <label htmlFor="username" className="text-sm font-bold text-slate-300 block mb-2">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-bold text-slate-300 block mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-800 transition-colors">
            {isLogin ? <><LoginIcon /> Sign In</> : <><UserAddIcon /> Register</>}
          </button>
        </form>
        <p className="text-sm text-center text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-medium text-indigo-400 hover:underline ml-1">
            {isLogin ? 'Register here' : 'Sign in here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
