import React from 'react';
import { Link } from 'wouter';

export function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            يالطقي
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            منصة المؤتمرات المرئية باللغة العربية
          </p>
        </div>

        <div className="space-y-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            إنشاء غرفة جديدة
          </button>
          
          <Link href="/join">
            <button className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors">
              الانضمام إلى غرفة
            </button>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            منصة آمنة وسهلة الاستخدام للاجتماعات الافتراضية
          </p>
        </div>
      </div>
    </div>
  );
}