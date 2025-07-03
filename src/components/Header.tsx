import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
export const Header = () => {
  const {
    user,
    signOut
  } = useAuth();
  return <header className="relative z-50 bg-transparent backdrop-blur-md border-b border-orange-500/30 px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-light text-white drop-shadow-lg">
          Crypto<span className="text-orange-400">Brain</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-white/80 text-sm drop-shadow-sm">
            Welcome, {user?.email}
          </span>
          <Button onClick={signOut} variant="outline" className="text-white border-orange-400/40 bg-orange-500/20 hover:bg-orange-500/30 backdrop-blur-sm">
            Sign Out
          </Button>
        </div>
      </div>
    </header>;
};