import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue/30 via-white to-green-cta/20 flex items-center justify-center p-4 pt-24">
      <Card className="w-full max-w-md shadow-2xl border-0 text-center">
        <CardHeader className="pb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl text-gray-900">404</CardTitle>
          <CardDescription className="text-lg">
            الصفحة غير موجودة
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-gray-600 leading-relaxed">
            عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد تكون الصفحة قد تم حذفها أو نقلها.
          </p>
          
          <Link href="/">
            <Button variant="cta" size="lg" className="w-full">
              <Home className="ml-2 h-5 w-5 rtl:rotate-180" />
              العودة إلى الصفحة الرئيسية
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}