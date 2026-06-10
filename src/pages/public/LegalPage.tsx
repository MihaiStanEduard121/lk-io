import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Cookie, 
  Mail, 
  FileSignature, 
  Scale, 
  Info, 
  Lock, 
  BookOpen, 
  HeartHandshake, 
  Send,
  Eye,
  Trash2
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  title: string;
  metaDesc: string;
}

export default function LegalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Clean URL tab router helper functions
  const getTabFromPathname = (pathname: string): string => {
    if (pathname.includes('/privacy-policy')) return 'privacy';
    if (pathname.includes('/terms-of-service')) return 'termeni';
    if (pathname.includes('/cookie-policy')) return 'cookie';
    if (pathname.includes('/dmca')) return 'dmca';
    if (pathname.includes('/copyright')) return 'copyright';
    if (pathname.includes('/disclaimer')) return 'disclaimer';
    if (pathname.includes('/legal-contact')) return 'contact';
    if (pathname.includes('/delete-my-data')) return 'delete-my-data';
    if (pathname.includes('/accessibility')) return 'accessibility';
    if (pathname.includes('/aup')) return 'aup';
    if (pathname.includes('/ads')) return 'ads';
    return '';
  };

  const getPathnameFromTab = (tabId: string): string => {
    switch (tabId) {
      case 'privacy': return '/privacy-policy';
      case 'termeni': return '/terms-of-service';
      case 'cookie': return '/cookie-policy';
      case 'dmca': return '/dmca';
      case 'copyright': return '/copyright';
      case 'disclaimer': return '/disclaimer';
      case 'contact': return '/legal-contact';
      case 'delete-my-data': return '/delete-my-data';
      case 'accessibility': return '/accessibility';
      case 'aup': return '/aup';
      case 'ads': return '/ads';
      default: return `/legal?tab=${tabId}`;
    }
  };

  const searchParams = new URLSearchParams(location.search);
  const pathTab = getTabFromPathname(location.pathname);
  const initialTab = pathTab || searchParams.get('tab') || 'termeni';
  const [activeTab, setActiveTab ] = useState(initialTab);
  
  // DMCA States
  const [claimantName, setClaimantName] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [claimantAddress, setClaimantAddress] = useState('');
  const [claimType, setClaimType] = useState('takedown'); // 'takedown' | 'counter'
  const [workTitle, setWorkTitle] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [infringingUrl, setInfringingUrl] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [declarationGoodFaith, setDeclarationGoodFaith] = useState(false);
  const [declarationAccuracy, setDeclarationAccuracy] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState('');

  // General Legal Contact State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('GDPR Rights Enquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // GDPR Data Deletion Request States
  const [deleteName, setDeleteName] = useState('');
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteReason, setDeleteReason] = useState('full_gdpr');
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const tabs: TabConfig[] = [
    { 
      id: 'termeni', 
      label: 'Termeni și Condiții', 
      icon: FileText, 
      title: 'Termeni și Condiții de Utilizare - programetv.online',
      metaDesc: 'Citește termenii și condițiile de utilizare programetv.online România. Reguli de acces, licențiere conținut media și obligații legale actualizate pentru anul 2026.'
    },
    { 
      id: 'privacy', 
      label: 'Confidențialitate & GDPR', 
      icon: Shield, 
      title: 'Politica de Confidențialitate și GDPR - programetv.online',
      metaDesc: 'Află cum îți protejăm datele cu caracter personal conform Regulamentului GDPR (UE) 2016/679. Drepturile tale, prelucrarea datelor și securitatea pe portal.'
    },
    { 
      id: 'cookie', 
      label: 'Politica de Cookie-uri', 
      icon: Cookie, 
      title: 'Politica privind Modulele Cookie - programetv.online România',
      metaDesc: 'Informații complete despre utilizarea modulelor cookie și tehnologiilor de urmărire de pe site-ul nostru de streaming și noutăți TV.'
    },
    { 
      id: 'dmca', 
      label: 'Copyright & DMCA', 
      icon: Scale, 
      title: 'Drepturi de Autor, DMCA și Notificări Takedown - programetv.online',
      metaDesc: 'Procedura legală completă pentru respectarea drepturilor de autor pe programetv.online. Formular oficial DMCA Takedown și Contranotificare în limba română.'
    },
    {
      id: 'copyright',
      label: 'Politica de Copyright',
      icon: FileSignature,
      title: 'Politica de Copyright și Proprietate Intelectuală - programetv.online',
      metaDesc: 'Politică explicită de proprietate intelectuală pentru programetv.online. Află cum respectăm mărcile înregistrate, legăturile embedded și elementele grafice.'
    },
    { 
      id: 'disclaimer', 
      label: 'Disclaimer Legal', 
      icon: AlertTriangle, 
      title: 'Disclaimer și Declinarea Responsabilității - programetv.online',
      metaDesc: 'programetv.online este un agregator de fluxuri video publice independente. Notă privind responsabilitatea conținutului încorporat prin iframe.'
    },
    { 
      id: 'aup', 
      label: 'Acceptable Use (AUP)', 
      icon: Lock, 
      title: 'Politica de Utilizare Acceptabilă (AUP) - programetv.online',
      metaDesc: 'Regulile comunității și restricțiile tehnice pentru utilizarea serviciului nostru. Interzicerea scraping-ului neautorizat și a comentariilor dăunătoare.'
    },
    { 
      id: 'ads', 
      label: 'Publicitate & Afiliere', 
      icon: HeartHandshake, 
      title: 'Politica de Afiliere și Publicitate - programetv.online',
      metaDesc: 'Transparență totală referitoare la monetizarea conținutului, inserția publicitară, rețelele de publicitate terțe și linkurile de afiliere.'
    },
    { 
      id: 'contact', 
      label: 'Contact Legal & Formular', 
      icon: Mail, 
      title: 'Contact Juridic, DPO și Raportări Oficiale - programetv.online',
      metaDesc: 'Cum poți lua legătura cu Ofițerul nostru pentru Protecția Datelor (DPO) sau cum trimiți o sesizare oficială. Formular securizat de contact legal.'
    },
    {
      id: 'delete-my-data',
      label: 'Ștergere Date (GDPR)',
      icon: Trash2,
      title: 'Solicitare de Ștergere a Datelor Personale - programetv.online',
      metaDesc: 'Completează formularul oficial de ștergere a datelor cu caracter personal în temeiul Regulamentului GDPR. Proces rapid și ireversibil.'
    },
    {
      id: 'accessibility',
      label: 'Declarație Accesibilitate',
      icon: Eye,
      title: 'Declarație de Accesibilitate Web - programetv.online',
      metaDesc: 'Angajamentul programetv.online de a oferi accesibilitate deplină pentru utilizatorii cu deficiențe, compatibilitate cu screen readers și asistență tehnică.'
    }
  ];

  const currentTabInfo = tabs.find(t => t.id === activeTab) || tabs[0];

  useEffect(() => {
    const tabFromPath = getTabFromPathname(location.pathname);
    if (tabFromPath) {
      setActiveTab(tabFromPath);
    } else {
      const searchParams = new URLSearchParams(location.search);
      const tabParam = searchParams.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    // Update Client side Title & Meta Desc dynamically for better search engines index
    document.title = currentTabInfo.title;
    const metaDescElement = document.querySelector('meta[name="description"]');
    if (metaDescElement) {
      metaDescElement.setAttribute('content', currentTabInfo.metaDesc);
    }
  }, [activeTab, currentTabInfo]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(getPathnameFromTab(tabId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteSuccess(false);

    if (!deleteName || !deleteEmail) {
      setDeleteError('Vă rugăm să introduceți tot numele și adresa de e-mail.');
      return;
    }

    if (!deleteConfirmation) {
      setDeleteError('Trebuie să confirmați veridicitatea solicitării.');
      return;
    }

    setDeleteSubmitting(true);
    try {
      await addDoc(collection(db, 'data_deletions'), {
        name: deleteName,
        email: deleteEmail,
        reasonType: deleteReason,
        status: 'pending',
        createdAt: new Date().toISOString(),
        siteYear: 2026,
        timeframeLimit: '30_days' // GDPR law response limit
      });

      setDeleteSuccess(true);
      setDeleteName('');
      setDeleteEmail('');
      setDeleteConfirmation(false);
    } catch (err: any) {
      setDeleteError(`Eroare la procesare: ${err.message || err}`);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleDMCASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError('');
    setClaimSuccess(false);

    if (!claimantName || !claimantEmail || !claimantPhone || !claimantAddress || !workTitle || !infringingUrl || !digitalSignature) {
      setClaimError('Vă rugăm să completați toate câmpurile obligatorii marcate cu (*).');
      return;
    }

    if (!declarationGoodFaith || !declarationAccuracy) {
      setClaimError('Trebuie să confirmați și să bifați ambele declarații legale de bună credință.');
      return;
    }

    setSubmittingClaim(true);
    try {
      await addDoc(collection(db, 'legal_claims'), {
        claimantName,
        claimantEmail,
        claimantPhone,
        claimantAddress,
        claimType,
        workTitle,
        originalUrl,
        infringingUrl,
        claimNotes,
        digitalSignature,
        status: 'pending',
        createdAt: new Date().toISOString(),
        siteYear: 2026,
        originalHost: window.location.origin
      });

      setClaimSuccess(true);
      // Reset Form fields
      setWorkTitle('');
      setOriginalUrl('');
      setInfringingUrl('');
      setClaimNotes('');
      setDigitalSignature('');
      setDeclarationGoodFaith(false);
      setDeclarationAccuracy(false);
    } catch (err: any) {
      setClaimError(`Eroare la trimiterea sesizării: ${err.message || err}`);
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(false);
    
    if (!contactName || !contactEmail || !contactMessage) {
      alert('Vă rugăm să completați toate câmpurile obligatorii.');
      return;
    }

    setContactSubmitting(true);
    try {
      await addDoc(collection(db, 'legal_contacts'), {
        contactName,
        contactEmail,
        contactSubject,
        contactMessage,
        status: 'new',
        createdAt: new Date().toISOString(),
        siteYear: 2026
      });

      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (err: any) {
      alert(`Eroare: ${err.message || err}`);
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="legal-central-container">
      {/* Visual Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-10 text-center relative overflow-hidden" id="legal-hero">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="inline-flex p-3 bg-indigo-500/10 rounded-xl text-indigo-400 mb-4 border border-indigo-500/20 shadow-inner">
          <Scale className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Centrul Legal & Conformitate GDPR
        </h1>
        <p className="mt-2 text-zinc-400 max-w-2xl mx-auto text-sm md:text-base">
          Garantul tău de transparență, legalitate și protecție a datelor personale pe portalul <strong>programetv.online</strong>. Toate documentele sunt actualizate conform normelor UE din anul <strong>2026</strong>.
        </p>
        <div className="mt-4 inline-block bg-zinc-800 text-zinc-300 text-xs py-1 px-3 rounded-full border border-zinc-700 font-mono">
          Ultima actualizare: Iunie 2026
        </div>
      </div>

      {/* Grid Layout for Readability */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sticky Sidebar Navigation */}
        <aside className="lg:col-span-1 space-y-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sticky top-24" id="legal-nav-sidebar">
            <h3 className="font-semibold text-zinc-400 text-xs tracking-wider uppercase mb-3 px-3">
              Documente Legale
            </h3>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                    id={`btn-tab-${tab.id}`}
                  >
                    <IconComponent className={`h-4.5 w-4.5 ${isSelected ? 'text-white' : 'text-zinc-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-6 pt-4 border-t border-zinc-800/80 px-3 text-zinc-500 text-xs">
              <p className="flex items-center space-x-1.5 font-mono mb-1">
                <Shield className="h-3 w-3 text-emerald-500" />
                <span>Securitate SSL 256-bit</span>
              </p>
              <p>programetv.online deține implementări avansate de confidențialitate.</p>
            </div>
          </div>
        </aside>

        {/* Dynamic Legal Content Reader */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-xl" id="legal-body-container">
          
          {/* TAB 1: TERMENI SI CONDITII */}
          {activeTab === 'termeni' && (
            <article className="prose prose-invert prose-indigo max-w-none text-zinc-300 leading-relaxed space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white border-b border-zinc-850 pb-4">
                Termeni și Condiții de Utilizare
              </h1>
              <p className="text-zinc-400 text-sm italic font-mono">
                Versiune aplicabilă și revizuită în anul 2026. Prezentul document stabilește regulile contractuale dintre utilizator și portalul nostru.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">1.</span> Acceptarea Termenilor și Condițiilor
              </h2>
              <p>
                Prin accesarea, navigarea și utilizarea website-ului <strong>programetv.online</strong> (denumit în continuare „Site-ul” sau „Serviciul”), disponibil la adresele aferente domeniilor noastre de operare, recunoașteți că ați citit, înțeles și sunteți de acord să respectați termenii legali stabiliți în acest acord. Dacă nu sunteți de acord cu acești termeni, aveți obligația de a înceta imediat utilizarea Serviciului.
              </p>
              <p>
                Serviciul este asigurat și administrat de asociații programetv.online în vederea facilitării accesului la informații media și ghid TV din România. Ne rezervăm dreptul de a modifica acești termeni fără o notificare prealabilă, modificările intrând în vigoare din clipa publicării pe Site.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">2.</span> Descrierea Serviciilor Noastre
              </h2>
              <p>
                Site-ul funcționează ca un <strong>portal media, catalog informațional și agregator de legături externe</strong>. Acesta reunește:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ghiduri TV, grile de programe și programe de difuzare pe zile ale televiziunilor de stat și private românești.</li>
                <li>Monografii TV detaliate, descrieri, articole de știri și opinii despre evoluția trusturilor media din România.</li>
                <li><strong>Wod/VOD și iframes încorporate</strong>: Facilitarea redării unor fluxuri video și jucători externi (embedded players) care sunt difuzate public pe internet de terțe site-uri, fără ca fișierele video respective să fie găzduite sau modificate în vreun fel pe serverele programetv.online.</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">3.</span> Natura Juridică a Embedding-ului (Încorporarea iframe)
              </h2>
              <p>
                Utilizatorii recunosc în mod expres faptul că <strong>programetv.online</strong> nu retransmite în format propriu, nu stochează și nu găzduiește semnalul video al canalelor de televiziune prezentate. Încorporarea fluxurilor video publice prin formatul elementului <code>&lt;iframe&gt;</code> se face în deplină conformitate cu jurisprudența Curții de Justiție a Uniunii Europene (C-348/13 - Cauza BestWater, C-466/12 - Cauza Svensson), care stipulează că inserarea unui link sau a unei legături încorporate către o lucrare protejată ce a fost deja pusă la dispoziția publicului pe un alt site, în mod liber, nu reprezintă o „comunicare către public” nouă și nu încalcă drepturile de autor, întrucât nu folosește un public nou și nici o metodă tehnică diferită.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">4.</span> Eligibilitate și Înregistrare
              </h2>
              <p>
                Accesul la serviciile de bază ale site-ului este complet gratuit. Utilizarea site-ului este permisă doar persoanelor care au împlinit vârsta de 16 ani (sau vârsta legală în jurisdicția din care accesează site-ul) sau care beneficiază de acordul explicit al părinților ori tutorilor legali pentru utilizare.
              </p>
              <p>
                Pentru anumite secțiuni interactive (cum ar fi publicarea de comentarii), utilizatorii se pot conecta utilizând conturi terțe (autentificare Google furnizată de Firebase). Sunteți singurul responsabil pentru securitatea conturilor și pentru acțiunile desfășurate sub identitatea dvs. pe Serviciu.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">5.</span> Conținutul Generat de Utilizatori (Comments Policy)
              </h2>
              <p>
                În cazul în care publicați comentarii sau recenzii la emisiuni ori canale, sunteți singurul răspunzător pentru legalitatea acestui conținut. Se interzice cu desăvârșire publicarea de mesaje xenofobe, rasiste, jignitoare, instigatoare la ură, linkuri către conținut piratat sau materiale promoționale nesolicitate (spam). Ne rezervăm dreptul nuanțat de a modera, edita sau elimina orice comentariu care încalcă bunele practici, fără justificare prealabilă.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">6.</span> Limitarea Răspunderii
              </h2>
              <p>
                programetv.online nu își asumă responsabilitatea pentru întreruperile tehnice de funcționare ale linkurilor încorporate, pentru calitatea grafică a fluxurilor de la terți, ori pentru eventualele pagube directe sau indirecte ce decurg din imposibilitatea utilizării temporare a sistemelor. Serviciul este livrat „Așa Cum Este” („As Is”) și „În Limita Disponibilității” („As Available”).
              </p>

              {/* FAQ Schema render */}
              <div className="bg-zinc-850 border border-zinc-800 rounded-xl p-6 mt-10 space-y-4" id="faq-schema-termeni">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Info className="h-5 w-5 text-indigo-400" /> Întrebări Frecvente (FAQ) - Termeni Legali
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-white font-medium text-sm">Î1: programetv.online transmite conținut ilegal de televiziune?</h4>
                    <p className="text-sm text-zinc-400">R: Nu. Site-ul funcționează ca un portal de ghid TV și un catalog de linkuri publice încorporate. Toate iframes provin de pe platforme terțe unde conținutul a fost deja încărcat public. Portalul nu găzduiește și nu transmite semnal TV de pe servere proprii.</p>
                  </div>
                  <hr className="border-zinc-800" />
                  <div>
                    <h4 className="text-white font-medium text-sm">Î2: Serviciile oferite pe site sunt gratuite?</h4>
                    <p className="text-sm text-zinc-400">R: Da, utilizarea de bază și navigarea prin grilele și monografiile noastre media sunt 100% gratuite pentru comunitate, fiind susținute exclusiv prin publicitate digitală neinvazivă.</p>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* TAB 2: PRIVACY & GDPR */}
          {activeTab === 'privacy' && (
            <article className="prose prose-invert prose-indigo max-w-none text-zinc-300 leading-relaxed space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white border-b border-zinc-850 pb-4">
                Politica de Confidențialitate și GDPR
              </h1>
              <p className="text-zinc-400 text-sm italic font-mono">
                Actualizată conform Regulamentului General privind Protecția Datelor (UE) 2016/679 (GDPR) pentru anul 2026.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">1.</span> Cine suntem noi și cum ne puteți contacta
              </h2>
              <p>
                Suntem operatorul portalului <strong>programetv.online</strong>. Acordăm o importanță deosebită intimității și protecției datelor utilizatorilor noștri. Pentru orice solicitări legate de datele dvs. cu caracter personal, exercitarea drepturilor GDPR sau întrebări tehnice, ne puteți scrie oricând la adresa de e-mail a responsabilului DPO: <strong>colaborari.mihai@gmail.com</strong>.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">2.</span> Ce date colectăm și de ce le prelucrăm
              </h2>
              <p>Colectăm minimal doar datele tehnice și de identificare necesare operării și securizării portalului TV:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Date despre prezență și trafic (Analytics)</strong>: Pentru a măsura numărul de utilizatori care vizionează un canal concomitent (folosind metricile noastre de prezență activă de pe server), colectăm adrese de IP anonimizate, tipul de browser și paginile accesate. Aceste date au ca temei juridic interesul legitim (Art. 6 alin. 1 lit. f GDPR) de a asigura funcționalitatea optimă a serverelor noastre.
                </li>
                <li>
                  <strong>Date de conectare (comments/autentificare)</strong>: În momentul în care alegeți să adăugați comentarii, colectăm prin protocolul de autentificare Google (Firebase Authentication) numele asociat contului dvs., adresa de e-mail și avatarul profilului. Prelucrarea are ca temei consimțământul (Art. 6 alin. 1 lit. a GDPR) ales prin decizia explicită de logare.
                </li>
                <li>
                  <strong>Date din formulare (Contact / DMCA)</strong>: Datele introduse voluntar în formularele noastre de asistență legală sunt prelucrate exclusiv în vederea soluționării cererilor legale stricte (îndeplinirea unei obligații legale conform Art. 6 alin. 1 lit. c GDPR).
                </li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">3.</span> Drepturile utilizatorului conform GDPR
              </h2>
              <p>În calitate de persoană vizată din Uniunea Europeană, beneficiați de drepturi depline:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li><strong>Dreptul de acces</strong>: Puteți cere o confirmare a datelor dvs. prelucrate de noi.</li>
                <li><strong>Dreptul la rectificare</strong>: Puteți cere corectarea datelor personale inexacte.</li>
                <li><strong>Dreptul la ștergerea datelor („Dreptul de a fi uitat”)</strong>: Aveți dreptul de a ne cere ștergerea integrală a conturilor dvs. de comentarii și a preferințelor din sistemele noastre.</li>
                <li><strong>Dreptul la restricționarea prelucrării</strong>: Puteți suspenda temporar operațiunile pe contul dvs.</li>
                <li><strong>Dreptul de a vă opune prelucrării</strong> bazate pe interesul nostru legitim.</li>
                <li><strong>Dreptul de a depune o plângere</strong> în fața Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP) din România.</li>
              </ol>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">4.</span> Perioada de stocare a datelor
              </h2>
              <p>
                Datele anonime de trafic sunt colectate temporar pe durate scurte. Datele privind comentariile sunt păstrate pe întreaga durată de existență a contului utilizatorului sau până când acesta solicită explicit ștergerea contului și a istoricului său. Sesizările din formularul DMCA sunt păstrate timp de 5 ani din considerente de probațiune în instanțe civile și apărări juridice.
              </p>

              {/* FAQ Schema for GDPR */}
              <div className="bg-zinc-850 border border-zinc-800 rounded-xl p-6 mt-10 space-y-4" id="faq-schema-privacy">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-400" /> Întrebări GDPR Frecvente
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-white font-medium text-sm">Î1: Cum pot cere ștergerea tuturor datelor mele de pe platformă?</h4>
                    <p className="text-sm text-zinc-400">R: Ne puteți trimite un e-mail la colaborari.mihai@gmail.com cu titlul „Cerere Ștergere Date GDPR”. Vom procesa cererea și vom elimina definitiv profilul, avatarul și comentariile în maximum 48 de ore.</p>
                  </div>
                  <hr className="border-zinc-800" />
                  <div>
                    <h4 className="text-white font-medium text-sm">Î2: Datele mele personale sunt vândute către terțe companii?</h4>
                    <p className="text-sm text-zinc-400">R: Nu, sub nicio formă. Nu vindem, nu închiriem și nu cedem datele vizitatorilor. Prelucrarea noastră este pur funcțională.</p>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* TAB 3: COOKIE POLICY */}
          {activeTab === 'cookie' && (
            <article className="prose prose-invert prose-indigo max-w-none text-zinc-300 leading-relaxed space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white border-b border-zinc-850 pb-4">
                Politica de Cookie-uri
              </h1>
              <p className="text-zinc-400 text-sm italic font-mono">
                Totul despre stocarea datelor cookie și stocarea locală pe portalul nostru.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">1.</span> Ce sunt modulele Cookie?
              </h2>
              <p>
                Un modul cookie este un fișier text de mici dimensiuni pe care un site web îl salvează pe computerul sau pe dispozitivul dvs. mobil atunci când îl vizitați. Datorită cookie-urilor, site-ul poate reține, pe o anumită perioadă de timp, acțiunile și preferințele dvs. (cum ar fi conectarea, limba, dimensiunea caracterelor și alte preferințe de afișare), astfel încât nu mai trebuie să le reintroduceți ori de câte ori reveniți pe site sau navigați de pe o pagină pe alta.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">2.</span> Cum utilizăm cookie-urile pe acest portal?
              </h2>
              <p>Portalul programetv.online folosește module cookie clasificate în trei mari categorii:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Cookie-uri Strictly Necesare (Esenețiale)</strong>: Acestea permit navigarea de bază și reținerea stării de logare prin Firebase. Fără ele, anumite zone interactive (comentariile și interfețele administrative) nu pot funcționa corect.
                </li>
                <li>
                  <strong>Cookie-uri de Performanță și Statistici</strong>: Urmăresc cum interacționează vizitatorii cu elementele paginii și ce canale live primesc cele mai multe vizualizări concomitent, pentru a echilibra ecranele grafice.
                </li>
                <li>
                  <strong>Cookie-uri de la Terți (Third-Party Cookies)</strong>: Deoarece încorporăm fluxuri iframe externe (cum ar fi transmisiuni video furnizate de youtube, dailymotion sau platforme de streaming dedicate), aceste rețele externe pot plasa propriile cookie-uri de urmărire și publicitate comportamentală. Nu controlăm și nu avem acces la aceste module terțe.
                </li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">3.</span> Cum puteți controla modulele cookie?
              </h2>
              <p>
                Puteți controla și/sau șterge cookie-urile după cum doriți (consultați detalii pe <a href="https://aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">aboutcookies.org</a>). Puteți șterge toate cookie-urile deja stocate pe computer și puteți seta majoritatea browserelor să blocheze plasarea acestora. Totuși, dacă faceți acest lucru, este posibil să trebuiască să setați manual unele preferințe de fiecare dată când vizitați site-ul.
              </p>
            </article>
          )}

          {/* TAB 4: DMCA & COPYRIGHT */}
          {activeTab === 'dmca' && (
            <article className="prose prose-invert prose-indigo max-w-none text-zinc-300 leading-relaxed space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white border-b border-zinc-850 pb-4">
                Protecția Drepturilor de Autor și Politica DMCA
              </h1>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-amber-300 text-sm space-y-2">
                <p className="font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> NOTĂ IMPORTANTĂ PRIVIND DREPTURILE DE PROPRIETATE INTELECTUALĂ:
                </p>
                <p>
                  <strong>programetv.online</strong> funcționează ca un motor de catalogare nuanțat și indexator de fluxuri video live disponibile public pe internet. Nu încărcăm, nu stocăm, nu retransmitem și nu găzduim date în format video pe serverele noastre. Toate elementele media (logo-uri, mărci) aparțin proprietarilor legitimi de drepturi (ex. PRO TV, Antena Group, Dogan Media, etc.) și sunt utilizate exclusiv sub formă de indexare informativă a pieței TV.
                </p>
              </div>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-400"><Scale className="h-5 w-5 inline" /></span> Ghidul Utilizatorului pentru Depunerea Notificărilor
              </h2>
              <p>
                În conformitate cu Titlul II din Directiva (UE) 2019/790 și prevederile legii SUA DMCA (Digital Millennium Copyright Act), dacă sunteți titularul unor drepturi de autor și considerați că un element embedded pe Site aduce atingere drepturilor dvs. fără licență, puteți solicita înlăturarea imediată a linkului de încorporare completând formularul electronic securizat de mai jos sau scriindu-ne la adresa <strong>colaborari.mihai@gmail.com</strong>.
              </p>

              {/* Form container for DMCA forms */}
              <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950/80 my-8 space-y-6" id="dmca-interactive-forms">
                <div className="flex border-b border-zinc-800 pb-3 gap-4">
                  <button 
                    onClick={() => setClaimType('takedown')} 
                    className={`pb-2 text-sm font-bold transition-all ${claimType === 'takedown' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-300'}`}
                  >
                    1. Formular Takedown (DMCA Request)
                  </button>
                  <button 
                    onClick={() => setClaimType('counter')} 
                    className={`pb-2 text-sm font-bold transition-all ${claimType === 'counter' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-300'}`}
                  >
                    2. Contranotificare (Counter-Notice)
                  </button>
                </div>

                {claimSuccess ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-emerald-400 space-y-2">
                    <h4 className="font-bold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" /> Cererea a fost transmisă cu succes în baza de date legală!
                    </h4>
                    <p className="text-sm text-zinc-400">
                      Am înregistrat ticketul dvs. Departamentul nostru legal va verifica corepondența tehnică și va înlătura embed-ul incriminat în cel mai scurt timp (de regulă în sub 24 de ore). Veți primi confirmarea pe e-mail.
                    </p>
                    <button 
                      onClick={() => setClaimSuccess(false)}
                      className="mt-3 text-xs bg-zinc-800 text-zinc-300 py-1 px-3 rounded hover:bg-zinc-700 transition"
                    >
                      Trimite o nouă notificare
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDMCASubmit} className="space-y-4">
                    <h3 className="text-base font-bold text-white">
                      {claimType === 'takedown' ? 'Raportează Încălcări Drepturi de Autor (DMCA Takedown)' : 'Depune Contranotificare pentru Material Restaurat'}
                    </h3>

                    {claimError && (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-medium">
                        {claimError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Numele Titularului / Reprezentantului legal *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: Popescu Ion" 
                          value={claimantName}
                          onChange={(e) => setClaimantName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Adresă de E-mail de contact *</label>
                        <input 
                          type="email" 
                          required
                          placeholder="Ex: legal@compania.ro" 
                          value={claimantEmail}
                          onChange={(e) => setClaimantEmail(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Număr de Telefon *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: +40722000000" 
                          value={claimantPhone}
                          onChange={(e) => setClaimantPhone(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Adresă Poștală Completă *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Strada, Număr, Oraș, Țară" 
                          value={claimantAddress}
                          onChange={(e) => setClaimantAddress(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <hr className="border-zinc-900" />

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Titlul Lucrării cu Drept de Autor sau Serial TV vizat *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Emisiunea Vocea Romaniei Sezonul 10 / Canal TV X" 
                        value={workTitle}
                        onChange={(e) => setWorkTitle(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">{claimType === 'takedown' ? 'URL Sursă Original / Dovadă deținere licență' : 'URL original stocat'}</label>
                        <input 
                          type="url" 
                          placeholder="https://www.youtube.com/watch... sau https://protv.ro/..." 
                          value={originalUrl}
                          onChange={(e) => setOriginalUrl(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">URL-ul incriminat de pe Portalul programetv.online *</label>
                        <input 
                          type="url" 
                          required
                          placeholder={`${window.location.origin}/play/PROTV-HD`} 
                          value={infringingUrl}
                          onChange={(e) => setInfringingUrl(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Informații și Detalii Suplimentare Clarificatoare</label>
                      <textarea 
                        rows={3} 
                        placeholder="Explicați contextul sau menționați documentul de delegare legală..."
                        value={claimNotes}
                        onChange={(e) => setClaimNotes(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <hr className="border-zinc-900" />

                    <div className="space-y-2 text-xs text-zinc-400 bg-zinc-950 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <input 
                          type="checkbox" 
                          id="good_faith" 
                          required
                          checked={declarationGoodFaith}
                          onChange={(e) => setDeclarationGoodFaith(e.target.checked)}
                          className="mt-1 accent-indigo-500" 
                        />
                        <label htmlFor="good_faith" className="cursor-pointer select-none">
                          * Declar pe proprie răspundere, sub sancțiunea legii privind sperjurul, că am bună-credință că utilizarea lucrării în formatul reclamat nu este aprobată de titularul drepturilor de autor, de agentul său sau de legislativul în vigoare.
                        </label>
                      </div>
                      <div className="flex items-start gap-2">
                        <input 
                          type="checkbox" 
                          id="accuracy" 
                          required
                          checked={declarationAccuracy}
                          onChange={(e) => setDeclarationAccuracy(e.target.checked)}
                          className="mt-1 accent-indigo-500" 
                        />
                        <label htmlFor="accuracy" className="cursor-pointer select-none">
                          * Declar că informațiile furnizate în această notificare sunt exacte, complete și veridice și că eu sunt autorul legitim sau persoana împuternicită oficial cu reprezentarea acestuia.
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Semnătură Electronică (Scrieți numele dvs. complet ca semnătură) *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Popescu Ion Ioan" 
                        value={digitalSignature}
                        onChange={(e) => setDigitalSignature(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={submittingClaim}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{submittingClaim ? 'Se procesează...' : 'Trimite Sesizarea Legală'}</span>
                    </button>
                  </form>
                )}
              </div>
            </article>
          )}

          {/* TAB 5: DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            <article className="prose prose-invert prose-indigo max-w-none text-zinc-300 leading-relaxed space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white border-b border-zinc-850 pb-4">
                Disclaimer Legal
              </h1>
              <p className="text-zinc-400 text-sm italic font-mono">
                Declinarea responsabilității și protecția juridică a administratorilor portalului.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">1.</span> Natura Informațională și Ghid TV
              </h2>
              <p>
                Informațiile publicate pe portalul <strong>programetv.online</strong>, inclusiv orarele ghidului TV, știrile, recenziile de seriale, rezumatele de emisiuni și monografiile canalelor media au un scop strict informativ și de divertisment. Deși depunem eforturi susținute pentru a asigura corectitudinea datelor privind grilele TV, acestea pot suferi modificări subite de la orele stabilite de televiziunile mamă fără ca noi să putem interveni.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">2.</span> Neproprietatea asupra Mărcilor și Logo-urilor TV
              </h2>
              <p>
                Numele canalelor (ex. PROTV HD, HBO, Antena 1, Kanal D etc.), siglele, logo-urile, melodiile tematice de prezentare sau elementele grafice specifice posturilor TV sunt mărci înregistrate deținute de trusturile lor respective. Afișarea acestor elemente vizuale pe portalul nostru se face exclusiv în scop informativ-educațional (<strong>Fair Use ocrotit prin legi internaționale</strong>), pentru a permite identificarea rapidă de către telespectatorii români a canalului pe care îl caută.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">3.</span> Conținutul Încorporat de la Terți (Embedded Iframes)
              </h2>
              <p>
                programetv.online colectează și indexează iframe-uri video care rulează fluxurile live ale diverselor televiziuni. Subliniem cu maximă fermitate că:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Portalul nu inițiază transmisia semnalului TV, nu retransmite semnal propriu de cablu, nu decriptează rețele securizate și nu colectează abonamente bănești.</li>
                <li>Fiecare vizualizator accesând o încorporare este conectat direct cu adresa de rețea oferită de terțele servere care găzduiesc fizic transmisia video. Orice problemă de licențiere a streamului original trebuie semnalată și soluționată la sursa fizică respectivă.</li>
              </ul>
            </article>
          )}

          {/* TAB 6: ACCEPTABLE USE (AUP) */}
          {activeTab === 'aup' && (
            <article className="prose prose-invert prose-indigo max-w-none text-zinc-300 leading-relaxed space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white border-b border-zinc-850 pb-4">
                Politica de Utilizare Acceptabilă (AUP)
              </h1>
              <p className="text-zinc-400 text-sm italic font-mono">
                Regulile de conduită și siguranță cibernetică aplicabile comunității programetv.online în anul 2026.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">1.</span> Activități Interzise în Sisteme (Securitate IT)
              </h2>
              <p>Utilizatorii nu au permisiunea de a desfășura următoarele acțiuni:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Bypass și decriptare</strong>: Încercarea de a obține URL-urile protejate din playerul embedded, dezasamblarea codului Javascript sau injectarea de malware în formulare.
                </li>
                <li>
                  <strong>Scraping neautorizat</strong>: Extragerea automată a grilei TV cu scripturi sau a listei de link-uri (web scrapers dăunătoare) în scopuri de concurență neloială, utilizare comercială sau redistribuire în alte aplicații de streaming mobile dăunătoare fără acord în scris de la administratori.
                </li>
                <li>
                  <strong>DDoS / Suprasolicitare</strong>: Generarea de fluxuri volumetrice mari de solicitări HTTP destinate încetinirii sau blocării serverelor noastre sau ale serviciilor terțe asociate de partajare a prezenței utilizatorilor.
                </li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">2.</span> Conduita în Comentarii
              </h2>
              <p>
                Sunt interzise atacurile la persoană, amenințările sau materialele cu tentă pornografică dăunătoare minorilor. Toate comentariile sunt monitorizate periodic. Încălcarea acestor reguli duce la interdicția imediată de postare (ban IP/cont Firebase).
              </p>
            </article>
          )}

          {/* TAB 7: PUBLICITATE & AFILIERE */}
          {activeTab === 'ads' && (
            <article className="prose prose-invert prose-indigo max-w-none text-zinc-300 leading-relaxed space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white border-b border-zinc-850 pb-4">
                Politica de Publicitate și Afiliere
              </h1>
              <p className="text-zinc-400 text-sm italic font-mono">
                Dezvăluiri obligatorii privind prezența programelor de sponsorizare, reclame și afiliere.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">1.</span> Cum ne susținem financiar portalul?
              </h2>
              <p>
                Asigurarea gratuității absolute a portalului implică costuri legate de găzduire Cloud, baze de date Firestore, interfețe API și scraperi inteligenți care structurează zilnic orarele canalelor TV din România. <strong>programetv.online</strong> se monetizează exclusiv din publicitatea digitală (machete publicitare programatice integrate de rețele terțe). De asemenea, putem promova servicii de streaming oficiale partenere prin recomandări oneste.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">2.</span> Despre modulele publicitare încorporate în iframes
              </h2>
              <p>
                Deoarece încorporăm fluxuri video de la jucători de streaming externi (free hosting), aceștia controlează pe deplin propriile ferestre de dialog (ads/popups) instalate deasupra fluxului video respectiv. Portalul nostru nu beneficiază financiar în nicio manieră din aceste anunțuri pop-up agresive plasate ilegal de administratorii jucătorilor terți. Recomandăm utilizatorilor folosirea de instrumente antiprograme rău-intenționate pe propriile dispozitive pentru o navigare cât mai curată.
              </p>
            </article>
          )}

          {/* TAB 8: CONTACT LEGAL */}
          {activeTab === 'contact' && (
            <article className="prose prose-invert prose-indigo max-w-none text-zinc-300 leading-relaxed space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white border-b border-zinc-850 pb-4">
                Contact Legal, DPO și Formular Securizat
              </h1>
              <p className="text-zinc-400 text-sm italic font-mono">
                Canale oficiale destinate proceselor de respectare a confidențialității GDPR și cooperare strânsă cu autoritățile.
              </p>

              <p>
                Dacă reprezentați o autoritate judiciară din Uniunea Europeană, o entitate pentru protecția drepturilor de autor ori doriți să depuneți o cerere specială DPO de acces la informații, puteți transmite solicitările dvs. prin formularul securizat oficial de mai jos:
              </p>

              {/* Form container */}
              <div className="border border-zinc-850 bg-zinc-950 p-6 rounded-2xl max-w-xl mx-auto space-y-5" id="legal-contact-form">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                  <Mail className="h-6 w-6 text-indigo-500" />
                  <h4 className="text-white font-bold text-base">Formular de Sesizare și Contact Juridic</h4>
                </div>

                {contactSuccess ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm leading-relaxed">
                    <p className="font-bold flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Sesizare înregistrată!</p>
                    <p className="text-zinc-400 text-xs mt-1">Echipa noastră tehnică și de protecție a datelor s-a activat. Vă vom răspunde oficial la coordonatele de e-mail furnizate în termen legal.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Numele Complet / Reprezentant *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Av. Popescu Ion" 
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Adresă Oficială de E-mail *</label>
                      <input 
                        type="email" 
                        required
                        placeholder="Ex: dpo@companie.ro" 
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Subiectul Sesizării *</label>
                      <select 
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="GDPR Rights Enquiry">Solicitare Drepturi GDPR (Ștergere, Acces, Portabilitate)</option>
                        <option value="Licensing & Stream Removal">Notificare Înlăturare Stream / Drepturi Licență</option>
                        <option value="Authorities requests">Solicitare Oficială / Autorități Judiciare</option>
                        <option value="Sponsorship & Partnership">Propuneri Sponsorizări & Publicitate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Mesajul și Detalierea Solicitării *</label>
                      <textarea 
                        required 
                        rows={4} 
                        placeholder="Introduceți aici textul sesizării cu diacritice, argumentele juridice și detalii concrete..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={contactSubmitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded transition disabled:opacity-50"
                    >
                      {contactSubmitting ? 'Trimitere...' : 'Transmite Solicitarea în format securizat'}
                    </button>
                  </form>
                )}
              </div>
            </article>
          )}

          {/* TAB: COPYRIGHT */}
          {activeTab === 'copyright' && (
            <article className="prose prose-invert prose-indigo max-w-none text-zinc-300 leading-relaxed space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white border-b border-zinc-850 pb-4">
                Politica de Copyright & Proprietate Intelectuală
              </h1>
              <p className="text-zinc-400 text-sm italic font-mono">
                Politica privind protecția drepturilor de proprietate intelectuală și utilizarea mărcilor comerciale.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">1.</span> Protejarea Proprietății Intelectuale
              </h2>
              <p>
                Platforma <strong>programetv.online</strong> respectă cu strictețe drepturile de proprietate intelectuală și de autor ale tuturor creatorilor de conținut, companiilor de radiodifuziune și trusturilor media. Obiectivul nostru este de a oferi utilizatorilor un serviciu util și complet de ghid TV și noutăți din mass-media, acționând ca intermediar informațional (agregator).
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">2.</span> Utilizarea de Logo-uri, Sigle și Mărci
              </h2>
              <p>
                Toate logo-urile, denumirile de posturi TV și elementele vizuale asociate canalelor prezentate pe site-ul nostru aparțin exclusiv trusturilor media respective sau deținătorilor legali de drepturi (de exemplu: PRO TV, Antena Group, Clevers Group, TVR, HBO, Warner Bros. Discovery și alții). 
              </p>
              <p>
                Afișarea acestor elemente se face sub incidența conceptului juridic de <strong>Utilizare Comercială Rezonabilă (Fair Use)</strong>:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Are un rol exclusiv de informare, identificare istorică și ghidaj pentru public.</li>
                <li>Nu sugerează nicio afiliere oficială, parteneriat formal sau aprobare specială de către trusturile TV din România sau de la nivel internațional.</li>
                <li>Este furnizată gratuit, aducând un plus de audiență și trafic canalelor TV, direcționând telespectatorii români către grilele de program oficiale ale acestora.</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">3.</span> Procedura de Notificare a Încălcărilor (Copyright Notice)
              </h2>
              <p>
                Dacă considerați că vreun material publicat sau încorporat pe platforma noastră încalcă drepturile dvs. de autor sau drepturile de exploatare media, vă rugăm să trimiteți o solicitare oficială prin completarea formularului din tab-ul <a href="/dmca" className="text-indigo-400 underline font-medium font-semibold text-indigo-400 hover:underline">Copyright & DMCA</a> sau completând formularul de asistență legală disponibil în tab-ul <a href="/legal-contact" className="text-indigo-400 underline font-medium font-semibold text-indigo-400 hover:underline">Contact Legal</a>. Vă asigurăm de cooperarea noastră promptă.
              </p>
            </article>
          )}

          {/* TAB: DELETE MY DATA */}
          {activeTab === 'delete-my-data' && (
            <article className="prose prose-invert prose-indigo max-w-none text-zinc-300 leading-relaxed space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white border-b border-zinc-850 pb-4">
                Solicitare GDPR de Ștergere a Datelor (Right to Erasure)
              </h1>
              <p className="text-zinc-400 text-sm italic font-mono">
                Procedură oficială conformă cu Articolul 17 al Regulamentului UE 2016/679 (GDPR).
              </p>

              <p>
                În conformitate cu legislația europeană, aveți dreptul de a cere ștergerea integrală, definitivă și ireversibilă a tuturor datelor dvs. cu caracter personal prelucrate în sistemul nostru (de ex: comentarii lăsate pe canalele TV, avatar de profil Firebase, detalii din baza de date).
              </p>

              {/* Form container */}
              <div className="border border-zinc-850 bg-zinc-950 p-6 rounded-2xl max-w-xl mx-auto space-y-5" id="data-deletion-form-container">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                  <Trash2 className="h-6 w-6 text-indigo-500" />
                  <h4 className="text-white font-bold text-base">Formular de Solicitare Ștergere Date</h4>
                </div>

                {deleteSuccess ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm leading-relaxed">
                    <p className="font-bold flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Cerere trimisă!</p>
                    <p className="text-zinc-400 text-xs mt-1">Conform cerințelor GDPR, un operator are la dispoziție maximum 30 de zile pentru verificarea identității și operarea ștergerii în baza de date. Vă vom trimite confirmarea finalizării pe adresa de e-mail specificată.</p>
                  </div>
                ) : (
                  <form onSubmit={handleDeleteSubmit} className="space-y-4">
                    {deleteError && (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-medium">
                        {deleteError}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Numele Complet al solicitantului *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Popescu Ion" 
                        value={deleteName}
                        onChange={(e) => setDeleteName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Adresă de E-mail (trebuie să corespundă cu contul folosit) *</label>
                      <input 
                        type="email" 
                        required
                        placeholder="Ex: ion.popescu@gmail.com" 
                        value={deleteEmail}
                        onChange={(e) => setDeleteEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Tipul solicitării / Motiv *</label>
                      <select 
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="full_gdpr">Vreau ștergerea completă a contului de comentarii și datelor asociate</option>
                        <option value="comment_cleanup">Vreau ștergerea tuturor comentariilor făcute pe site, dar doresc menținerea contului</option>
                        <option value="ip_log_erasure">Solicit ștergerea log-urilor administrative cu IP-ul meu</option>
                      </select>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-400 bg-zinc-950 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <input 
                          type="checkbox" 
                          id="delete_confirm_check" 
                          required
                          checked={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.checked)}
                          className="mt-1 accent-indigo-500" 
                        />
                        <label htmlFor="delete_confirm_check" className="cursor-pointer select-none text-zinc-400">
                          * Confirm pe proprie răspundere că sunt titularul legitim al acestei adrese de e-mail sau acționez cu mandat deplin în numele acestuia. Înțeleg că procesul este ireversibil și final.
                        </label>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={deleteSubmitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                      <span>{deleteSubmitting ? 'Se trimite solicitarea...' : 'Trimite Solicitarea GDPR'}</span>
                    </button>
                  </form>
                )}
              </div>
            </article>
          )}

          {/* TAB: ACCESSIBILITY */}
          {activeTab === 'accessibility' && (
            <article className="prose prose-invert prose-indigo max-w-none text-zinc-300 leading-relaxed space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white border-b border-zinc-850 pb-4">
                Declarație de Accesibilitate Web
              </h1>
              <p className="text-zinc-400 text-sm italic font-mono">
                Angajamentul programetv.online privind facilitarea accesului incluziv la ghidul de programe TV.
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">1.</span> Angajamentul Nostru
              </h2>
              <p>
                Ne dorim ca portalul <strong>programetv.online</strong> să fie accesibil tuturor vizitatorilor săi, inclusiv persoanelor cu dizabilități vizuale, auditive, motorii sau cognitive. Lucrăm permanent la îmbunătățirea experienței de navigare prin adoptarea standardelor de accesibilitate recunoscute la nivel european (<strong>WCAG 2.1 nivel AA</strong>).
              </p>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">2.</span> Funcționalități de Accesibilitate Implementate
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Structură semantică robustă</strong>: Pagina utilizează tag-uri corecte în concordanță cu specificațiile HTML5 (<code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;footer&gt;</code>) asigurând interpretarea fidelă prin intermediul software-urilor de tip screen reader (cititoare de ecran).
                </li>
                <li>
                  <strong>Contrast de înaltă calitate</strong>: Fundalul întunecat cu tentă indigo/cărbune asigură un contrast optim pentru citirea fără oboseală vizuală, respectând raportul minim de strălucire.
                </li>
                <li>
                  <strong>Atributul alt pentru imagini</strong>: Toate siglele și thumbnail-urile canalelor TV sau știrilor au furnizate alt-tag-uri complete și explicative pentru interfețele asistive.
                </li>
                <li>
                  <strong>Navigare via tastatură</strong>: Elementele interactive pot fi focusate într-o secvență logică prin tastarea tastei <code>Tab</code>.
                </li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <span className="text-indigo-500">3.</span> Raportarea Problemelor de Accesibilitate
              </h2>
              <p>
                Dacă întâmpinați dificultăți în vizualizarea sau navigarea ghidului TV programetv.online, vă încurajăm să ne semnalați de îndată prin formularul securizat oficial de asistență din tab-ul <a href="/legal-contact" className="text-indigo-400 underline font-medium font-semibold text-indigo-400 hover:underline">Contact Legal</a> sau trimițându-ne un feedback explicit pe e-mail: <strong>colaborari.mihai@gmail.com</strong>. Recomandările dvs. sunt extrem de prețioase.
              </p>
            </article>
          )}

        </div>

      </div>
    </div>
  );
}
