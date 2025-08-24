
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const {
    user,
    signOut
  } = useAuth();

  return (
    <header className="relative z-50 bg-transparent backdrop-blur-md border-b border-orange-500/30 px-4 sm:px-6 py-3 sm:py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl sm:text-2xl font-light text-white drop-shadow-lg">
          Crypto<span className="text-orange-400">Brain</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:inline text-white/80 text-sm drop-shadow-sm">
            Welcome, {user?.email}
          </span>
          <span className="sm:hidden text-white/80 text-xs drop-shadow-sm max-w-24 truncate">
            {user?.email?.split('@')[0]}
          </span>
          <Button 
            onClick={signOut} 
            variant="outline" 
            className="text-white border-orange-400/40 bg-orange-500/20 hover:bg-orange-500/30 backdrop-blur-sm text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 min-h-[36px] sm:min-h-[40px]"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};
