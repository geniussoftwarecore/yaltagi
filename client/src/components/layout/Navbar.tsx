import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Globe, Video } from 'lucide-react';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-blue to-green-cta rounded-2xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-primary-blue">يلتقي</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <Link href="/">
              <Button variant="ghost" className="text-gray-700 hover:text-primary-blue">
                {t('nav.home')}
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="ghost" className="text-gray-700 hover:text-primary-blue">
                {t('nav.features')}
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" className="text-gray-700 hover:text-primary-blue">
                {t('nav.pricing')}
              </Button>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="relative"
              title={t('nav.language')}
            >
              <Globe className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary-blue text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {language.toUpperCase()}
              </span>
            </Button>

            {/* Start Meeting Button */}
            <Link href="/create">
              <Button variant="cta" className="shadow-lg hover:shadow-xl transition-all">
                {t('nav.startMeeting')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}