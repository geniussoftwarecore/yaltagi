import React from 'react';
import { Router, Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { HomePage } from '@/pages/HomePage';
import { RoomPage } from '@/pages/RoomPage';
import { JoinPage } from '@/pages/JoinPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/room/:id" component={RoomPage} />
          <Route path="/join" component={JoinPage} />
          <Route component={NotFoundPage} />
        </Switch>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;