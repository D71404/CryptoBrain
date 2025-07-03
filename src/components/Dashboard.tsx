
import React from 'react';
import { UnifiedChat } from './UnifiedChat';
import { BackgroundGradientAnimation } from './ui/background-gradient-animation';

export const Dashboard = () => {
  return (
    <div className="relative min-h-screen">
      {/* Background animation layer */}
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(120, 53, 15)"
        gradientBackgroundEnd="rgb(61, 21, 2)"
        firstColor="234, 88, 12"
        secondColor="251, 146, 60"
        thirdColor="254, 215, 170"
        fourthColor="245, 158, 11"
        fifthColor="217, 119, 6"
        pointerColor="194, 65, 12"
        containerClassName="fixed inset-0"
        className="absolute inset-0"
      />
      
      {/* Content layer */}
      <div className="relative z-10 min-h-screen flex items-center justify-center pt-2 p-6">
        <UnifiedChat />
      </div>
    </div>
  );
};
