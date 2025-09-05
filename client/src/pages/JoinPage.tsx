import React, { useState } from 'react';
import { useLocation } from 'wouter';

export function JoinPage() {
  const [, setLocation] = useLocation();
  const [accessCode, setAccessCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.trim()) {
      setLocation(`/room/${accessCode}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            الانضمام إلى غرفة
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            أدخل رمز الوصول للانضمام إلى الاجتماع
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              رمز الوصول
            </label>
            <input
              type="text"
              id="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="أدخل رمز الوصول"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            انضمام
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
          >
            ← العودة إلى الصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}