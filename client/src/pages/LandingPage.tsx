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
      title: t('features.hdVideo.title'),
      description: t('features.hdVideo.description'),
      color: 'text-blue-600'
    },
    {
      icon: Monitor,
      title: t('features.screenShare.title'),
      description: t('features.screenShare.description'),
      color: 'text-green-600'
    },
    {
      icon: MessageCircle,
      title: t('features.chat.title'),
      description: t('features.chat.description'),
      color: 'text-purple-600'
    },
    {
      icon: Users,
      title: t('features.breakout.title'),
      description: t('features.breakout.description'),
      color: 'text-orange-600'
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-blue/30 via-white to-green-cta/20 pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-primary-blue mb-6 leading-tight">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/create">
                <Button 
                  variant="cta" 
                  size="xl" 
                  className="text-lg px-8 py-4 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                >
                  {t('landing.hero.cta')}
                  <ArrowRight className="ml-2 h-6 w-6 rtl:rotate-180" />
                </Button>
              </Link>
              
              <Link href="/join">
                <Button 
                  variant="outline" 
                  size="xl" 
                  className="text-lg px-8 py-4 hover:shadow-xl transition-all duration-300"
                >
                  {t('landing.hero.joinMeeting')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary-blue/10 to-transparent rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-cta/10 to-transparent rounded-full translate-x-48 translate-y-48"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-blue mb-4">
              {t('features.title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-blue mb-4">
              {t('howItWorks.title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="text-center relative">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  
                  <Card className="pt-8 hover:shadow-xl transition-all duration-300">
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4`}>
                        <IconComponent className={`w-8 h-8 ${step.color}`} />
                      </div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center text-gray-600 leading-relaxed">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                  
                  {/* Arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-300">
                      <ArrowRight className="w-8 h-8 rtl:rotate-180" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-blue to-green-cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('landing.hero.cta')}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button 
                variant="secondary" 
                size="xl" 
                className="text-lg px-8 py-4 bg-white text-primary-blue hover:bg-gray-100 shadow-xl hover:shadow-2xl"
              >
                {t('landing.hero.cta')}
                <CheckCircle className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}