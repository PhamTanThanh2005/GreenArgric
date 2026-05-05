import React from 'react';

export const AuthLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-4 mb-8 ">
      <div className="w-30">
        <img src="/images/logo-white.png" alt="" />
      </div>
      <div>
        <h1 className="text-4xl font-extrabold text-brand-green tracking-tight">GREEN ARGRIC</h1>
        <p className="text-sm text-brand-green font-medium text-right">giải pháp nông nghiệp thông minh</p>
      </div>
    </div>
  );
};