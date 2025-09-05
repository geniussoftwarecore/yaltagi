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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-8">
      {/* Main Card Container */}
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Y</span>
            </div>
            <span className="font-semibold text-gray-800">Yaltaqi</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <span className="text-sm">الرئيسية</span>
            <span className="text-sm">الاعدادات</span>
            <span className="text-sm">دعم</span>
            <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">ابدأ اجتماع</h1>
          <div className="flex justify-center mb-6">
            <ArrowRight className="w-6 h-6 text-teal-500 rotate-45" />
          </div>
        </div>

        {/* Main CTA Button */}
        <div className="mb-8">
          <Link href="/create">
            <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105">
              انضم الآن
            </Button>
          </Link>
        </div>

        {/* Or Divider */}
        <div className="text-center text-gray-400 mb-8 relative">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200"></div>
          <span className="px-4 bg-white relative">Or</span>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="group">
                <Card className="p-4 hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-2xl">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                      <IconComponent className="w-6 h-6 text-teal-500" />
                    </div>
                    <CardTitle className="text-sm font-medium text-gray-700">{feature.title}</CardTitle>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Bottom Link */}
        <div className="text-center mt-8">
          <Link href="/join">
            <button className="text-teal-500 hover:text-teal-600 text-sm font-medium underline">
              Send invite
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}