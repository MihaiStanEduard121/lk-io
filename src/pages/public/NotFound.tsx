import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { useAppLanguage } from '../../context/LanguageContext';

export default function NotFound() {
  const { currentLang } = useAppLanguage();

  const title = currentLang === 'ro' ? 'Pagina Nu A Fost Găsită (404)' : 'Page Not Found (404)';
  const description = currentLang === 'ro' 
    ? 'Ne pare rău, dar pagina pe care o căutați nu există sau a fost mutată.' 
    : 'Sorry, the page you are looking for does not exist or has been moved.';
  const backText = currentLang === 'ro' ? 'Înapoi la Acasă' : 'Back to Home';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-full text-red-500 dark:text-red-400 mb-6">
        <AlertTriangle size={48} id="alert-icon" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" id="notfound-title">
        {title}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 max-w-md mb-8 leading-relaxed" id="notfound-description">
        {description}
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-colors duration-200"
        id="back-home-button"
      >
        <Home size={18} />
        {backText}
      </Link>
    </div>
  );
}
