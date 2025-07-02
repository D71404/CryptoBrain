import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
export const Header = () => {
  const {
    user,
    signOut
  } = useAuth();
  return <header className="relative z-50 bg-gradient-to-r from-[#0a0613] to-[#271a0d] border-b border-orange-500/20 px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-light text-white">
          Crypto<span className="text-orange-500">Brain</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-white/70 text-sm">
            Welcome, {user?.email}
          </span>
          <Button onClick={signOut} variant="outline" className="text-white border-orange-500/30 bg-orange-600 hover:bg-orange-500">
            Sign Out
          </Button>
        </div>
      </div>
    </header>;
};