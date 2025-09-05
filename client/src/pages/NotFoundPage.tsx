import React from 'react';
import { Link } from 'wouter';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          الصفحة غير موجودة
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها
        </p>
        
        <Link href="/">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            العودة إلى الصفحة الرئيسية
          </button>
        </Link>
      </div>
    </div>
  );
}