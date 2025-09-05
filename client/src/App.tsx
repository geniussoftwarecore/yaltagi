import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { LandingPage } from '@/pages/LandingPage';
import { CreateMeetingPage } from '@/pages/CreateMeetingPage';
import { JoinMeetingPage } from '@/pages/JoinMeetingPage';
import { MeetingRoomPage } from '@/pages/MeetingRoomPage';
import { Whiteboard } from '@/components/meeting/Whiteboard';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  const { i18n } = useTranslation();
  const { language, direction, setLanguage } = useAppStore();

  useEffect(() => {
    // Initialize language and direction
    i18n.changeLanguage(language);
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction, i18n]);

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Switch>
          {/* Meeting Room - Full Screen */}
          <Route path="/room/:id">
            <MeetingRoomPage />
          </Route>
          
          {/* Whiteboard - Full Screen */}
          <Route path="/whiteboard/:id">
            <Whiteboard roomId="" />
          </Route>
          
          {/* Other Pages with Layout */}
          <Route path="/create">
            <Navbar />
            <CreateMeetingPage />
          </Route>
          
          <Route path="/join">
            <Navbar />
            <JoinMeetingPage />
          </Route>
          
          <Route path="/">
            <Navbar />
            <LandingPage />
            <Footer />
          </Route>
          
          {/* 404 Page */}
          <Route>
            <Navbar />
            <NotFoundPage />
          </Route>
        </Switch>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;