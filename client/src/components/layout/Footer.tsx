import React from 'react';
import { useTranslation } from 'react-i18next';
import { Video } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-blue to-green-cta rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-blue">يلتقي</span>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-600">
            © {currentYear} Yaltaqi. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}