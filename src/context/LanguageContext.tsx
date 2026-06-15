import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Language {
  code: string;
  label: string;
  flag: string; // flagcdn code
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'ro', label: 'Română', flag: 'ro' },
  { code: 'uk', label: 'Українська', flag: 'ua' },
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'es', label: 'Español', flag: 'es' },
  { code: 'de', label: 'Deutsch', flag: 'de' },
  { code: 'fr', label: 'Français', flag: 'fr' },
  { code: 'it', label: 'Italiano', flag: 'it' },
  { code: 'eu', label: 'Euskara', flag: 'eu' },
  { code: 'bg', label: 'Български', flag: 'bg' },
  { code: 'ru', label: 'Русский', flag: 'ru' },
];

interface LanguageContextType {
  currentLang: string;
  setLanguage: (code: string) => void;
  translateUI: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Core translation dictionary for key navigation and UI elements
const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Navbar & Footer
  'nav.home': {
    ro: 'Acasă',
    uk: 'Головна',
    en: 'Home',
    es: 'Inicio',
    de: 'Startseite',
    fr: 'Accueil',
    it: 'Home',
  },
  'nav.schedule': {
    ro: 'Program TV',
    uk: 'ТВ Програма',
    en: 'TV Guide',
    es: 'Programación TV',
    de: 'TV-Programm',
    fr: 'Grille TV',
    it: 'Guida TV',
  },
  'nav.shows': {
    ro: 'Emisiuni (VOD)',
    uk: 'Передачі (VOD)',
    en: 'Shows (VOD)',
    es: 'Programas (VOD)',
    de: 'Sendungen (VOD)',
    fr: 'Émissions (VOD)',
    it: 'Programmi (VOD)',
  },
  'nav.news': {
    ro: 'Știri',
    uk: 'Новини',
    en: 'News',
    es: 'Noticias',
    de: 'Nachrichten',
    fr: 'Actualités',
    it: 'Notizie',
  },
  'nav.worldcup': {
    ro: 'Cupa Mondială 2026',
    uk: 'Чемпіонат Світу 2026',
    en: 'World Cup 2026',
    es: 'Copa Mundial 2026',
    de: 'Weltmeisterschaft 2026',
    fr: 'Coupe du Monde 2026',
    it: 'Coppa del Mondo 2026',
  },
  'footer.description': {
    ro: 'programetv.online este un agregator independent de ghiduri TV și recenzii emisiuni. Redările video se realizează exclusiv prin elemente de încorporare iframe din rețele publice libere externe.',
    uk: 'programetv.online - це незалежний агрегатор телевізійних програм та оглядів передач. Відеопрогравання здійснюється виключно через вбудовані елементи iframe з вільних зовнішніх публічних мереж.',
    en: 'programetv.online is an independent aggregator of TV guides and show reviews. Video playback is performed exclusively via iframe embeds from free external public networks.',
    es: 'programetv.online es un agregador independiente de guías de televisión y reseñas de programas. La reproducción de video se realiza exclusivamente a través de incrustaciones de iframe de redes públicas externas gratuitas.',
    de: 'programetv.online ist ein unabhängiger Aggregator von TV-Führern und Rezensionen. Die Videowiedergabe erfolgt ausschließlich über Iframe-Embeds aus freien externen öffentlichen Netzwerken.',
    fr: 'programetv.online est un agrégateur indépendant de grilles TV et de critiques d\'émissions. La lecture vidéo est assurée exclusivement via des intégrations iframe de réseaux publics externes gratuits.',
    it: 'programetv.online è un aggregatore indipendente di guide TV e recensioni di spettacoli. La riproduzione video viene eseguita esclusivamente tramite iframe provenienti da reti pubbliche esterne gratuite.',
  },
  'search.placeholder': {
    ro: 'Caută emisiuni, filme, canale, articole...',
    uk: 'Шукайте передачі, фільми, канали, статті...',
    en: 'Search shows, movies, channels, articles...',
    es: 'Buscar programas, películas, canales, artículos...',
    de: 'Sendungen, Filme, Kanäle, Artikel suchen...',
    fr: 'Rechercher des émissions, films, chaînes, articles...',
    it: 'Cerca programmi, film, canali, articoli...',
  },
  'nav.search': {
    ro: 'Caută',
    uk: 'Пошук',
    en: 'Search',
    es: 'Buscar',
    de: 'Suchen',
    fr: 'Rechercher',
    it: 'Cerca',
  },
  'common.live': {
    ro: 'LIVE',
    uk: 'НАЖИВО',
    en: 'LIVE',
    es: 'EN VIVO',
    de: 'LIVE',
    fr: 'EN DIRECT',
    it: 'DIRETTA',
  },
  'common.viewers': {
    ro: 'spectatori',
    uk: 'глядачів',
    en: 'viewers',
    es: 'espectadores',
    de: 'Zuschauer',
    fr: 'spectateurs',
    it: 'spettatori',
  },
  'common.active': {
    ro: 'Activ',
    uk: 'Активний',
    en: 'Active',
    es: 'Activo',
    de: 'Aktiv',
    fr: 'Actif',
    it: 'Attivo',
  },
  'common.inactive': {
    ro: 'Inactiv',
    uk: 'Неактивний',
    en: 'Inactive',
    es: 'Inactivo',
    de: 'Inaktiv',
    fr: 'Inactif',
    it: 'Inattivo',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode, initialLang?: string }> = ({ children, initialLang }) => {
  const [currentLang, setCurrentLang] = useState<string>(initialLang || 'ro');

  useEffect(() => {
    // 1. Detect browser language or stored language
    const storedLang = localStorage.getItem('user_lang');
    let detectLang = initialLang || storedLang || 'ro';

    if (!initialLang && !storedLang) {
      const browserLang = (navigator.language || '').toLowerCase();
      // Check for user origin match
      const supportedMatch = SUPPORTED_LANGUAGES.find(l => browserLang.startsWith(l.code));
      detectLang = supportedMatch ? supportedMatch.code : 'en';
      
      // Auto-save the first detected language
      localStorage.setItem('user_lang', detectLang);
    }

    setCurrentLang(detectLang);
    
    // Set Google Translate cookie
    setGoogleTransCookie(detectLang);

    // Initialize Google Translate Widget script dynamically in the background
    initGoogleTranslateScript();
  }, []);

  const setGoogleTransCookie = (lang: string) => {
    // The format is /original_lang/target_lang
    // The original page language is Romanian (ro)
    const cookieValue = `googtrans=/ro/${lang}`;
    document.cookie = `${cookieValue}; path=/;`;
    document.cookie = `${cookieValue}; path=/; domain=${window.location.hostname};`;
    // If running on subdomains or local
    const parts = window.location.hostname.split('.');
    if (parts.length > 2) {
      const domain = `.${parts.slice(-2).join('.')}`;
      document.cookie = `${cookieValue}; path=/; domain=${domain};`;
    }
  };

  const initGoogleTranslateScript = () => {
    if (document.getElementById('google-translate-script')) return;

    // Define global callback expected by Google Translate script
    (window as any).googleTranslateElementInit = function() {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'ro',
        includedLanguages: 'ro,uk,en,es,de,fr,it',
        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  };

  const setLanguage = (code: string) => {
    localStorage.setItem('user_lang', code);
    setCurrentLang(code);
    setGoogleTransCookie(code);
    
    // Smooth reload to apply full-page translation instantly
    window.location.reload();
  };

  const translateUI = (key: string): string => {
    const translations = UI_TRANSLATIONS[key];
    if (!translations) return key;
    return translations[currentLang] || translations['en'] || translations['ro'] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, translateUI }}>
      {/* Hidden container needed by Google translate internally */}
      <div id="google_translate_element" className="hidden pointer-events-none opacity-0 w-0 h-0" />
      {children}
    </LanguageContext.Provider>
  );
};

export const useAppLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useAppLanguage must be used within a LanguageProvider');
  }
  return context;
};
