import { useParams, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import React from 'react';

export const LanguageInitializer = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams();
  const location = useLocation();
  
  // Validate language
  const supportedCode = SUPPORTED_LANGUAGES.find(l => l.code === lang)?.code;
  
  if (!lang || !supportedCode) {
      // If language missing or unsupported, redirect to /ro/ (default)
      const stored = localStorage.getItem('user_lang');
      const target = stored && SUPPORTED_LANGUAGES.find(l => l.code === stored) ? stored : 'ro';
      return <Navigate to={`/${target}${location.pathname === '/' ? '' : location.pathname}`} replace />;
  }

  return (
    <LanguageProvider initialLang={supportedCode}>
      {children}
    </LanguageProvider>
  );
};
