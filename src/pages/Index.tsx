
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Hero from '@/components/ui/hero';
import { Dashboard } from '@/components/Dashboard';
import { Header } from '@/components/Header';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0613] via-[#271a0d] to-[#0a0613] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (user) {
    // User is authenticated, show the dashboard
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0613] via-[#271a0d] to-[#0a0613]">
        <Header />
        <Dashboard />
      </div>
    );
  }

  // User is not authenticated, show the landing page
  return <Hero />;
};

export default Index;
