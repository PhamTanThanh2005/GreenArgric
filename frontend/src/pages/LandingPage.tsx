import React from 'react';
import { Card } from '../components/Card/Card';
import { AuthLogo } from '../features/auth/components/AuthLogo';
import { LoginOptions } from '../features/auth/components/LoginOptions';
import { Footer } from '../components/Footer/Footer';
import bg from "../assets/bg.png";

export const LandingPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col relative min-h-screen">
      
      {/* Vùng ảnh nền */}
      <div className="absolute inset-0">
        <img
          src={bg}
          alt="Nền ruộng bậc thang"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative pt-10 px-6 flex-1 flex flex-col justify-center z-50">
        <div className="max-w-200 w-full mx-auto">
          <Card>
            <AuthLogo />
            <LoginOptions />
          </Card>
        </div>
      </div>

      <div className="-mt-24 relative z-20 w-full">
        <Footer />
      </div>

    </div>
  );
};