import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '@/lib/auth';
import { useAuth } from '@/types/auth';

// ✅ DEV MODE: fake login без бекенду
const DEV_MODE = false; // Використовуємо реальний API

export default function AdminLogin() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ✅ DEV MODE: перевірка фейкових credentials
      if (DEV_MODE) {
        if (username.trim() === 'admin' && password === 'admin') {
          // Зберігаємо фейкові дані в localStorage
          // Зберігаємо обидва ключі для сумісності
          const fakeToken = 'fake-admin-token';
          localStorage.setItem('access_token', fakeToken);
          localStorage.setItem('cubic_token', fakeToken);
          localStorage.setItem('cubic_role', 'admin');
          localStorage.setItem('cubic_user', JSON.stringify({
            id: 'admin-1',
            email: 'admin@cubic.ua',
            name: 'Admin User',
            role: 'admin'
          }));
          localStorage.setItem('user', JSON.stringify({
            id: 'admin-1',
            email: 'admin@cubic.ua',
            name: 'Admin User',
            role: 'admin'
          }));
          
          // Синхронізуємо контекст (якщо refreshMe підтримує localStorage)
          try {
            await refreshMe();
          } catch {
            // Ігноруємо помилку refreshMe у dev mode
          }
          
          navigate('/admin/dashboard', { replace: true });
        } else {
          throw new Error('Invalid credentials. Use admin/admin');
        }
      } else {
        // ✅ PRODUCTION MODE: справжній API запит
        await adminLogin(username.trim(), password);
        await refreshMe();
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 glass glass-card p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="mb-1 text-2xl font-semibold">Admin Login</h1>
        <p className="mb-6 text-sm text-gray-500">Sign in with admin credentials</p>

        {/* ✅ DEV MODE indicator */}
        {DEV_MODE && (
          <div className="mb-4 rounded-md border border-blue-300 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            🔧 <strong>Dev Mode:</strong> Use <code>admin/admin</code> to login
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">Username</label>
            <input
              id="username"
              type="text"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-900"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-xs text-gray-500">
            This login is only for administrators
          </p>
        </form>
      </div>
    </div>
  );
}
