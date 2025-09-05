import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Video, 
  Monitor, 
  MessageCircle, 
  Users, 
  PlayCircle, 
  UserPlus, 
  Settings,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export function LandingPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Video,
      title: 'HD Video',
      description: 'High quality video calls',
      color: 'text-teal-600'
    },
    {
      icon: Monitor,
      title: 'Screen Sharing',
      description: 'Share your screen',
      color: 'text-teal-600'
    },
    {
      icon: MessageCircle,
      title: 'Chat',
      description: 'Real-time messaging',
      color: 'text-teal-600'
    }
  ];

  const steps = [
    {
      icon: UserPlus,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      color: 'text-blue-600'
    },
    {
      icon: Settings,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      color: 'text-green-600'
    },
    {
      icon: PlayCircle,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full animate-ping"></div>
      </div>

      {/* Main Card Container */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md w-full mx-auto border border-white/20 animate-[fadeInUp_0.8s_ease-out] relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-[slideInDown_0.6s_ease-out]">
          <div className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
              <span className="text-white font-bold text-sm">Y</span>
            </div>
            <span className="font-semibold text-gray-800 transition-colors duration-300 group-hover:text-teal-600">Yaltaqi</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <span className="text-sm hover:text-teal-500 cursor-pointer transition-colors duration-200 transform hover:scale-105">الرئيسية</span>
            <span className="text-sm hover:text-teal-500 cursor-pointer transition-colors duration-200 transform hover:scale-105">الاعدادات</span>
            <span className="text-sm hover:text-teal-500 cursor-pointer transition-colors duration-200 transform hover:scale-105">دعم</span>
            <div className="w-6 h-1 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8 animate-[slideInUp_0.7s_ease-out_0.2s_both]">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-teal-600 bg-clip-text text-transparent mb-4 animate-pulse">ابدأ اجتماع</h1>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ArrowRight className="w-6 h-6 text-teal-500 rotate-45 animate-bounce" />
              <div className="absolute inset-0 w-6 h-6 text-teal-300 rotate-45 animate-ping opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Main CTA Button */}
        <div className="mb-8 animate-[slideInUp_0.8s_ease-out_0.3s_both]">
          <Link href="/create">
            <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-4 rounded-2xl text-lg transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/25 relative overflow-hidden group">
              <span className="relative z-10">انضم الآن</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-white/20 animate-ping rounded-2xl"></div>
              </div>
            </Button>
          </Link>
        </div>

        {/* Or Divider */}
        <div className="text-center text-gray-400 mb-8 relative animate-[fadeIn_1s_ease-out_0.4s_both]">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          <span className="px-4 bg-white relative text-xs tracking-wider">Or</span>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-4 animate-[slideInUp_0.9s_ease-out_0.5s_both]">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="group animate-[fadeInUp_0.6s_ease-out] hover:animate-none" style={{animationDelay: `${0.6 + index * 0.1}s`}}>
                <Card className="p-4 hover:shadow-xl transition-all duration-500 border border-gray-100/50 rounded-2xl backdrop-blur-sm hover:backdrop-blur-md transform hover:scale-110 hover:-translate-y-2 cursor-pointer group-hover:bg-gradient-to-br group-hover:from-teal-50 group-hover:to-cyan-50">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-teal-100 group-hover:to-cyan-100 transition-all duration-300 transform group-hover:rotate-6 group-hover:scale-110 shadow-sm group-hover:shadow-md">
                      <IconComponent className="w-6 h-6 text-teal-500 group-hover:text-cyan-500 transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition-colors duration-300">{feature.title}</CardTitle>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Bottom Link */}
        <div className="text-center mt-8 animate-[fadeIn_1s_ease-out_0.7s_both]">
          <Link href="/join">
            <button className="text-teal-500 hover:text-cyan-500 text-sm font-medium relative group transition-colors duration-300">
              <span className="relative z-10">Send invite</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></div>
            </button>
          </Link>
        </div>

        {/* Floating Action Indicator */}
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full animate-pulse shadow-lg"></div>
      </div>
    </div>
  );
}