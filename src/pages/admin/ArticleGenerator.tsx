import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { WORLD_CUP_MATCHES, WCMatch } from '../public/worldCupData';
import { 
  Sparkles, Calendar, Award, MapPin, CheckCircle2, ArrowRight, 
  ChevronRight, Volume2, Globe, Heart, Newspaper, Flame, Loader2,
  Tv, Activity, FileText, Check, Settings, MessageSquare, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ArticleGenerator() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prematch' | 'live-event'>('prematch');
  const [successMatch, setSuccessMatch] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  // Form states for manual/live event article creation
  const [selectedMatchId, setSelectedMatchId] = useState<string>(WORLD_CUP_MATCHES[0].id);
  const [eventType, setEventType] = useState<'goal' | 'kickoff' | 'card' | 'final'>('goal');
  const [eventMinute, setEventMinute] = useState<number>(45);
  const [playerName, setPlayerName] = useState<string>('');
  const [selectedTeamSide, setSelectedTeamSide] = useState<'team1' | 'team2'>('team1');
  const [cardColor, setCardColor] = useState<'galben' | 'roșu'>('galben');
  const [finalScore, setFinalScore] = useState<string>('2 - 1');
  const [manOfTheMatch, setManOfTheMatch] = useState<string>('');
  const [extraDetails, setExtraDetails] = useState<string>('');

  // Auto-fill mock players on match or team change for quick administration
  const mockPlayers: Record<string, string[]> = {
    'SUA': ['Christian Pulisic', 'Weston McKennie', 'Timothy Weah', 'Ricardo Pepi'],
    'Anglia': ['Harry Kane', 'Jude Bellingham', 'Phil Foden', 'Bukayo Saka'],
    'Mexic': ['Santiago Giménez', 'Hirving Lozano', 'Edson Álvarez', 'Luis Chávez'],
    'Argentina': ['Lionel Messi', 'Lautaro Martínez', 'Julián Álvarez', 'Enzo Fernández'],
    'Franța': ['Kylian Mbappé', 'Antoine Griezmann', 'Ousmane Dembélé', 'Marcus Thuram'],
    'Spania': ['Lamine Yamal', 'Álvaro Morata', 'Nico Williams', 'Pedri'],
    'Germania': ['Florian Wirtz', 'Jamal Musiala', 'Kai Havertz', 'Niclas Füllkrug'],
    'Brazilia': ['Vinícius Júnior', 'Rodrygo Silva', 'Raphinha Dias', 'Endrick Felipe'],
    'România': ['Dennis Man', 'Nicolae Stanciu', 'Denis Drăguș', 'Florinel Coman', 'Radu Drăgușin'],
    'Italia': ['Federico Chiesa', 'Gianluca Scamacca', 'Nicolò Barella', 'Davide Frattesi']
  };

  const selectedMatch = WORLD_CUP_MATCHES.find(m => m.id === selectedMatchId) || WORLD_CUP_MATCHES[0];

  // Pick a random player according to selected team for convenience
  useEffect(() => {
    const currentTeam = selectedTeamSide === 'team1' ? selectedMatch.team1 : selectedMatch.team2;
    const players = mockPlayers[currentTeam] || ['Starul echipei', 'Căpitanul Selecționatei', 'Atacantul principal'];
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    setPlayerName(randomPlayer);
    setManOfTheMatch(randomPlayer);
  }, [selectedMatchId, selectedTeamSide]);

  useEffect(() => {
    api.getCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  const getCategoryImageId = () => {
    const wcCategory = categories.find(c => c.name.toLowerCase().includes('cupa') || c.name.toLowerCase().includes('sport'));
    if (wcCategory) return wcCategory.id;
    return categories.length > 0 ? categories[0].id : '';
  };

  const coverImagesPool = [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200', // Massive vibrant stadium lights
    'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=1200', // Macro of football ball on training pitch
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=1200', // Cinematic dark soccer stadium 
    'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=1200', // Modern sport field texture and spectators lines
    'https://images.unsplash.com/photo-1579952365111-2a4d1e3baa20?auto=format&fit=crop&q=80&w=1200', // Top corner soccer ball inside net goal
    'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=1200', // Soccer team training action shot
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1200', // High dynamic stadium net with deep sunset light
    'https://images.unsplash.com/photo-1614632537190-23e414d4095a?auto=format&fit=crop&q=80&w=1200'  // Epic professional scoreboard and lights background
  ];

  // Select cover image dynamically based on seeds
  const getCoverImageForId = (seed: string) => {
    const s = seed || 'default';
    const index = Math.abs(s.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % coverImagesPool.length;
    return coverImagesPool[index];
  };

  // Pre-match preview article generator (Standard)
  const handleGenerateArticle = async (match: WCMatch) => {
    setGeneratingFor(match.id);
    setSuccessMatch(null);

    const catId = getCategoryImageId();
    const title = `🔥 Unde vedem live ${match.team1} - ${match.team2} la Cupa Mondială 2026? Avanpremieră, echipe probabile și ponturi bune`;
    const coverImage = getCoverImageForId(match.id);

    const content = `# 🏆 Cupa Mondială 2026: Blockbuster-ul Zilei între ${match.team1} și ${match.team2}!

Spectacolul fotbalistic de pe planetă atinge cote maxime la Cupa Mondială FIFA 2026, iar confruntarea epică din Grupa ${match.group} dintre super-puterile **${match.team1}** și **${match.team2}** se anunță a fi un adevărat roller-coaster de emoții! Arena de clasă mondială **${match.stadium}** din orașul gazdă **${match.city}** (${match.country}) va găzdui un meci crucial pentru soarta calificării în optimi.

Partida este programată de FIFA pe data de **${match.date}**, începând cu ora **${match.time}** (ora oficială a României). Dacă ești în căutarea celei mai bune metode de vizionare online sau vrei să afli unde vezi live stream-ul meciului, rămâi cu noi pentru că am pregătit detalii esențiale și link-urile oficiale!

---

## 🔍 Analiza Tactică a Confruntării & Forme de Joc

### 🏟️ Statutul de Forță Oficială: ${match.team1}
Echipa fanion **${match.team1}** vine cu o motivație rară și un lot extrem de talentat evaluat la sute de milioane de euro. Sub bagheta antrenorului principal, stilul caracteristic bazat pe un pressing strâns, pase precise și tranziție fulgerătoare de la apărare la atac promite să pună probleme din prima secundă.
* **Jucător cheie de urmărit:** Mijlocașul ofensiv cu viziune de geniu și faze fixe letale.
* **Sistem probabil:** 4-3-3 ofensiv cu benzi rapide.

### ⚽ Ambițiile de Luptători: ${match.team2}
De cealaltă parte, **${match.team2}** reprezintă una dintre cele mai rezistente defensive din fotbalul modern. Cunoscuți pentru organizarea tactică perfectă la mijlocul terenului și atacuri de tip „counter-strike” incredibil de eficiente, aceștia sunt pregătiți să blocheze orice atac advers și să dea lovitura decisivă în repriza secundă.
* **Punct forte:** Unitatatea colectivă de excepție și determinarea la fazele fixe.
* **Sistem probabil:** 4-2-3-1 compact, bazat pe dueluri fizice intense.

---

## 🔥 Unde Se Poate Viziona Meciul Live Online?
Pentru a veni în sprijinul iubitorilor de fotbal din România, redacția **programetv.online** îți aduce gratuit cel mai rapid streaming live online gratuit pentru emisiuni sportive și meciuri din cadrul grupelor cu ajutorul elementelor de încorporare iframe din rețele publice libere. 

### Doar un simplu click te desparte de acțiune:

👉 [TELEVIZARE DIRECTĂ: CLICK AICI PENTRU PLAYERUL MECIULUI LIVE ÎN TIMP REAL](/world-cup)

---

## 📈 Integrare SEO, Cuvinte Cheie & Tag-uri Google Search
* **Titlul original căutat:** *Unde pot vedea meciul ${match.team1} cu ${match.team2} live de pe telefon?*
* **Cuvinte cheie de interes major:** Cupa Mondială 2026 deținători drepturi, stream video gratis fotbal live comentat română, ponturi fotbal gratis ${match.team1} vs ${match.team2}, meciuri online gratis, program TV transmisiuni sportive.
* **Tag-uri de top:** \`#CupaMondiala2026\` \`#${match.team1.replace(/\s+/g, '')}\` \`#${match.team2.replace(/\s+/g, '')}\` \`#FotbalLiveStream\` \`#MeciuriLiveOnline\` \`#ProgramTVOnline\` \`#PonturiFotbal\` \`#${match.city}\`

---

## ❤️ Susține Jurnalismul Sportiv Independent!
*Suntem o echipă mică și pasionată care adună gratuit ghiduri TV și recenzii pentru tine! Dacă apreciezi transmisiunile, rapiditatea informației și interfața modernă fără publicitate agasantă, ne poți oferi o cafea și susține direct prin rețeaua ultrarapidă pe [Pagina Noastră de Donații Revolut sau PayPal](/donations). Mulțumim și vizionare plăcută!*`;

    const articlePayload = {
      title,
      content,
      coverImage,
      status: 'published',
      author: 'Redacția Sport Premium',
      publishedAt: new Date().toISOString(),
      categoryId: catId,
      isBreakingNews: match.round === 1 && iCanBeBreaking(match),
      views: 0
    };

    try {
      await api.createArticle(articlePayload);
      setSuccessMatch(match.id);
    } catch (err) {
      console.error(err);
      alert('A apărut o eroare la salvarea articolului în baza de date!');
    } finally {
      setGeneratingFor(null);
    }
  };

  // Core event-based live writer generator
  const getSimulatedArticleDetails = () => {
    const actingMatch = selectedMatch;
    const teamName = selectedTeamSide === 'team1' ? actingMatch.team1 : actingMatch.team2;
    const opponentTeamName = selectedTeamSide === 'team1' ? actingMatch.team2 : actingMatch.team1;
    const cleanPlayer = playerName.trim() || 'Starul meciului';

    let generatedTitle = '';
    let generatedContent = '';

    if (eventType === 'goal') {
      generatedTitle = `⚽ GOOOL! ${cleanPlayer} a înscris pentru ${teamName} în duelul cu ${opponentTeamName}! (Minutul ${eventMinute}')`;
      generatedContent = `# 🥅 GOOOL MAGNIFIC! ${cleanPlayer} deschide scorul în meciul de foc ${actingMatch.team1} - ${actingMatch.team2}!

Tensiunile au atins cote stratosferice pe arena **${actingMatch.stadium}** din **${actingMatch.city}**! În **minutul ${eventMinute}** al meciului de la Cupa Mondială 2026, tabela de marcaj s-a schimbat spectaculos în favoarea selecționatei din **${teamName}**, grație unei sclipiri de geniu semnate de **${cleanPlayer}**!

O pasă excelentă de la marginea careului a destabilizat complet defensiva celor de la **${opponentTeamName}**. Pe fază, **${cleanPlayer}** a preluat perfect, s-a întors fulgerător și a trimis o minge de neoprit chiar sub bara transversală a porții adverse. O execuție absolut remarcabilă care va fi analizată pe parcursul întregii zile!

---

## 📈 Desfășurarea Tactică a Confruntării
După această reușită superbă, jocul capătă noi nuanțe strategice extrem de interesante:
* **${teamName}** își consolidează încrederea și se așază în teren cu un plus de posesie defensivă.
* **${opponentTeamName}** este obligată să iasă la atac, lăsând spații mari în propria linie de funders.

Meciul se anunță cu totul spectaculos în minutele ce urmează!

---

## 🖥️ Unde Puteți Urmări Meciul în Direct Live Stream?
Nu rata nicio secundă din acest duel pasionant! Redacția **programetv.online** oferă gratuit streameri live și scor actualizat în timp real cu comentarii românești integrate:

[👉 CLICK AICI PENTRU PLAYERUL LIVE GRATUIT](/world-cup)

---

## 📈 Cuvinte Cheie SEO pentru Google Search
* **Căutări organice populare:** video gol ${cleanPlayer} azi, scor live ${actingMatch.team1} ${actingMatch.team2}, goluri cupa mondială 2026, transmisiune tv live stream gratis fotbal românia.
* **Tag-uri oficiale:** \`#Goal\` \`#${cleanPlayer.replace(/\s+/g, '')}\` \`#${teamName.replace(/\s+/g, '')}\` \`#CupaMondiala2026\` \`#FotbalLive\` \`#${actingMatch.city}\`

---

*Dorim să oferim cel mai bun jurnalism sportiv fără reclame abuzive. Susține-ne efortul independent cu o mică donație pentru costurile de hosting pe [Pagina de Donații Revolut sau PayPal](/donations) - fiecare leu contează!*`;
    } 
    else if (eventType === 'kickoff') {
      generatedTitle = `🚀 Fluier de start în derby-ul ${actingMatch.team1} - ${actingMatch.team2}! S-a dat startul bătăliei din Grupa ${actingMatch.group}`;
      generatedContent = `# ⚔️ A Început Bătălia! ${actingMatch.team1} vs ${actingMatch.team2} în Direct la Cupa Mondială 2026

Atmosferă electrizantă de mari dimensiuni pe arena **${actingMatch.stadium}** din **${actingMatch.city}**! Arbitrul a fluierat startul faimoaselor 90 de minute de duel titanic între marile super-puteri fotbalistice ale globului: **${actingMatch.team1}** și **${actingMatch.team2}** în cadrul grupelor turneului mondial.

Fanii din ambele țări au creat un decor colorat formidabil în tribune, iar tensiunea tactică este palpabilă încă din primele secunde. Obiectivul ambelor formații este unic: victoria, care ar simplifica radical traseul către marea finală.

---

## 📋 Detalii de Ultimă Oră & Echipe de Start
Comentatorii noștri sportivi subliniază tacticile extrem de ambițioase alese pentru acest blockbuster:
* **Sistemul tactic ales:** ${extraDetails || 'O așezare dinamică bazată pe o defensivă mobilă de 4-3-3 de atac și o linie mediană extrem de agresivă.'}
* **Atmosfera pe stadion:** Un cor imens de urale și cântece de susținere care răsună spectaculos în aerul curat din orașul **${actingMatch.city}**.

---

## 🖥️ Conectează-te ACUM la Live Stream-ul Video
Vrei să fii în alertă cu fiecare pasă, fiecare duel aerian și fază de poartă? Platforma noastră îți aduce stream-urile stabile în timp real direct în player:

[👉 TELESPECTATOR: INTRĂ LIVE ÎN CADRUL PLAYERULUI COMENTAT](/world-cup)

---

## 🏷️ Tag-uri Google Search & SEO Keywords:
* **Cuvinte cheie de top:** live stream gratis moca fotbal online, meciu de azi cupa mondiala, unde pot sa vad ${actingMatch.team1} ${actingMatch.team2}, meciuri televizate azi romania.
* **Tag-uri:** \`#Kickoff\` \`#CupaMondiala2026\` \`#${actingMatch.team1.replace(/\s+/g, '')}vs${actingMatch.team2.replace(/\s+/g, '')}\` \`#FotbalDirect\` \`#${actingMatch.city}\``;
    } 
    else if (eventType === 'card') {
      generatedTitle = `⚠️ Momente Tensionate! Jucătorul ${cleanPlayer} de la ${teamName} a văzut cartonașul ${cardColor.toUpperCase()}! (Minutul ${eventMinute}')`;
      generatedContent = `# 🟥 Tensiuni uriașe în minutul ${eventMinute}! Cartonaș ${cardColor.toUpperCase()} încasat de ${cleanPlayer}

Atmosfera s-a încins la maximum pe gazonul stadionului **${actingMatch.stadium}** din **${actingMatch.city}**! În **minutul ${eventMinute}** al meciului intens disputat între **${actingMatch.team1}** și **${actingMatch.team2}**, centralul partidei a fost forțat de împrejurări să îl avertizeze dur pe fotbalistul **${cleanPlayer}** de la echipa **${teamName}**, arătându-i direct cartonașul **${cardColor}**.

Faza a pornit de la un duel extrem de fizic la mijlocul terenului. Jucătorul avertizat a intrat cu întârziere într-un tackling masiv, doborându-și direct adversarul din selecționata adversă **${opponentTeamName}**. Intervenția dură a iscat spirite nervoase extrem de aprinse pe gazon între staff-urile tehnice și jucători!

---

## 🚨 Impactul Tactic General pe Teren
${cardColor === 'roșu' 
  ? `Această eliminare definitivă determină ca **${teamName}** să funcționeze în inferioritate numerică (în doar 10 oameni) până la sfârșitul partidei! O lovitură devastatoare pentru antrenor, care acum trebuie să renunțe la un vârf ofensiv pentru a acoperi spațiile libere defensiv.` 
  : `Deși a scăpat doar cu avertisment, **${cleanPlayer}** va trebui să fie pe deplin precaut la fiecare intersecție următoare, deoarece o nouă greșeală îi va atrage automat excluderea din joc pe soarta meciului.`}

---

## 📱 Urmărește Meciul Live în Direct Online
Fiecare moment suplimentar din meci escaladează intensitatea! Rămâi conectat în direct pe net de pe mobil sau laptop accesând playerul:

[👉 CLICK PENTRU PLAYER CONFLICTE LIVE DIRECT](/world-cup)

---

## 🏷️ Tag-uri Google Search & SEO Keywords:
* **Căutări relevante:** fault grav ${cleanPlayer} azi, meciuri tensionate ${actingMatch.team1} cu ${actingMatch.team2}, imagini cartonas rosu fotbal, ponturi online live gratis.
* **Tag-uri:** \`#Cartonas${cardColor === 'roșu' ? 'Rosu' : 'Galben'}\` \`#Fault\` \`#${cleanPlayer.replace(/\s+/g, '')}\` \`#CupaMondiala2026\` \`#NervitFotbal\``;
    } 
    else { // final
      generatedTitle = `🏁 Fluier Final! Meci istoric la Cupa Mondială: ${actingMatch.team1} ${finalScore} ${actingMatch.team2}. Vezi rezumatul complet și omul meciului`;
      generatedContent = `# 🏆 Epic! Meciul ${actingMatch.team1} - ${actingMatch.team2} s-a încheiat cu scorul spectaculos ${finalScore}!

S-a auzit fluierul de final al arbitrului pe impunătoarea arenă **${actingMatch.stadium}** din **${actingMatch.city}**! Într-una dintre cele mai complexe și atractive etape ale Cupei Mondiale 2026, selecționata din **${actingMatch.team1}** și rivala sa **${actingMatch.team2}** au terminat duelul direct din grupa ${actingMatch.group} la un scor absolut incredibil de **${finalScore}**!

Ambele tabere au dat tot ce aveau mai bun pe teren, punând în joc o dăruire fizică incredibilă și execuții artistice memorabile care au generat mii de aplauze în tribune.

---

## 🔥 Omul Meciului: Super-Eroul Serii
Marele merit pentru dinamica acestei partide îi revine fără îndoială jucătorului **${manOfTheMatch || cleanPlayer}**. Cu un efort fizic inepuizabil, o dinamică perfectă de pase și abilități extraordinare în situații limită de unu la unu, acesta a ghidat tactica propriei echipe pe parcursul celor 90 de minute epice.

---

## 📊 Configurația Clasamentului în Grupa ${actingMatch.group}
Cu acest deznodământ captivant, lupta pentru primele două locuri din clasament devine o adevărată nebunie! Runda următoare va fi definitorie pentru calificarea în fazele cu eliminare directă.

Vrei să revizionezi cele mai palpitante faze video, golurile de generic, interviurile la vestiare sau clasamentul complet actualizat interactiv la minut? Accesează panoul nostru:

[👉 VEZI REZUMAT VIDEO & CLASAMENT GRUPĂ INTERACTIV](/world-cup)

---

## 🏷️ Tag-uri Google Search & SEO Keywords:
* **Cuvinte cheie:** cine a câștigat meciul ${actingMatch.team1} vs ${actingMatch.team2} azi, scor final meciuri de fotbal, rezumat video goluri tv romania, statistici fotbalisti cupa mondiala.
* **Tag-uri:** \`#FluierFinal\` \`#RezultatScor\` \`#${actingMatch.team1.replace(/\s+/g, '')}\` \`#${actingMatch.team2.replace(/\s+/g, '')}\` \`#ScorCorect\` \`#CupaMondiala2026\` \`#PonturiPonturi\``;
    }

    return { title: generatedTitle, content: generatedContent };
  };

  const handleGenerateLiveEventArticle = async () => {
    setGeneratingFor('live_event_gen');
    setSuccessMatch(null);

    const matchObj = selectedMatch;
    const { title, content } = getSimulatedArticleDetails();
    const coverImage = getCoverImageForId(matchObj.id + eventType + playerName);
    const catId = getCategoryImageId();

    const articlePayload = {
      title,
      content,
      coverImage,
      status: 'published',
      author: 'Redacția Sport Live',
      publishedAt: new Date().toISOString(),
      categoryId: catId,
      isBreakingNews: eventType === 'goal' || eventType === 'final',
      views: 0
    };

    try {
      await api.createArticle(articlePayload);
      setSuccessMatch('live_event_gen');
      // Briefly reset indicators
      setTimeout(() => {
        setSuccessMatch(null);
      }, 5000);
    } catch (err) {
      console.error(err);
      alert('Eroare la scrierea articolului eveniment live în Firestore!');
    } finally {
      setGeneratingFor(null);
    }
  };

  const iCanBeBreaking = (m: WCMatch) => {
    return m.team1 === 'Mexic' || m.team1 === 'SUA' || m.team1 === 'Canada' || m.team1 === 'Brazilia' || m.team1 === 'Germania';
  };

  if (loading) {
    return (
      <div className="p-8 text-zinc-500 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <span className="font-medium text-xs">Se încarcă listele de meciuri și categoriile...</span>
      </div>
    );
  }

  // Live preview details for reactive UI component
  const calculatedPreview = getSimulatedArticleDetails();

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6 opacity-90">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2.5">
            <Sparkles className="w-8 h-8 text-indigo-400" />
            <span>Sistem Inteligent de Articole Sportive</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Generează instantaneu articole SEO pre-completate în limba română pentru pre-meciuri sau evenimente live (goluri, faulturi, cartonașe, kickoff, rezultate).
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-full md:w-auto self-start">
          <button
            onClick={() => setActiveTab('prematch')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg font-bold text-xs cursor-pointer select-none transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'prematch' 
                ? 'bg-indigo-600 text-white' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Avanpremiere Meciuri</span>
          </button>
          <button
            onClick={() => setActiveTab('live-event')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg font-bold text-xs cursor-pointer select-none transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'live-event' 
                ? 'bg-indigo-600 text-white' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Evenimente Live (Faze)</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'prematch' ? (
          /* PREMATCH ADVANCED LIST */
          <motion.div
            key="prematch"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex items-start gap-3 text-xs text-zinc-400">
              <Settings className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <p>
                Apasă pe butonul de generare de pe rândul meciului dorit. Sistemul va compila automat datele oficiale din loturi, stadium, ora, oraș, referințe și va stoca textul pre-completat instant în colecția publică de articole cu statut <strong>Publicat</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {WORLD_CUP_MATCHES.map((match, i) => {
                const isGenerating = generatingFor === match.id;
                const isSuccess = successMatch === match.id;

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.6, i * 0.04) }}
                    key={match.id}
                    className={`p-4.5 rounded-2xl border transition-all ${
                      isSuccess 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : 'bg-zinc-900/50 border-zinc-850 hover:border-zinc-800'
                    } flex flex-col md:flex-row md:items-center justify-between gap-4`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Team flags mockup */}
                      <div className="flex -space-x-2.5">
                        <img 
                          src={`https://flagcdn.com/w40/${match.team1Code}.png`} 
                          alt={match.team1} 
                          className="w-10 h-7 object-cover rounded shadow border border-zinc-900/30 z-10"
                          referrerPolicy="no-referrer"
                        />
                        <img 
                          src={`https://flagcdn.com/w40/${match.team2Code}.png`} 
                          alt={match.team2} 
                          className="w-10 h-7 object-cover rounded shadow border border-zinc-900/30"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-white text-sm md:text-base">
                            {match.team1} vs {match.team2}
                          </h3>
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
                            Grupa {match.group}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 mt-0.5 font-medium">
                          <span className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            {match.date} la {match.time}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            {match.city}, {match.country}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end md:self-auto">
                      {isSuccess ? (
                        <div className="flex items-center space-x-1 text-emerald-400 font-bold text-xs bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/15 animate-in fade-in duration-200">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Articol Publicat!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateArticle(match)}
                          disabled={generatingFor !== null}
                          className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/5 select-none"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Se scrie articolul...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Generează Avanpremieră (Auto-SEO)</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* LIVE EVENT INTERACTIVE CONTROLLER (GOLS, CARDS, START, END) */
          <motion.div
            key="live-event"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left side: Advanced Controller Settings Form */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-zinc-855 pb-3">
                  Configurator Evenimente Meci Live
                </h3>

                {/* Match Picker Selector */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Selectează Confruntarea</label>
                  <select
                    value={selectedMatchId}
                    onChange={(e) => setSelectedMatchId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    {WORLD_CUP_MATCHES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.team1} vs {m.team2} (Grupa {m.group} - {m.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Type Grid Selector */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Tip Fază sau Eveniment</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { type: 'goal', label: '⚽ Gol Marcat' },
                      { type: 'kickoff', label: '🚀 Fluier Start' },
                      { type: 'card', label: '🟨🟥 Cartonaș' },
                      { type: 'final', label: '🏁 Fluier Final' }
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          setEventType(item.type as any);
                          setSuccessMatch(null);
                        }}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          eventType === item.type
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                            : 'bg-zinc-950 border-zinc-850 hover:border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team Selection Radio Box (Only for Goals/Cards) */}
                {(eventType === 'goal' || eventType === 'card') && (
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Echipa implicată direct</label>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setSelectedTeamSide('team1')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                          selectedTeamSide === 'team1'
                            ? 'bg-zinc-800 text-white border-zinc-700'
                            : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-400'
                        }`}
                      >
                        <img 
                          src={`https://flagcdn.com/w20/${selectedMatch.team1Code}.png`} 
                          className="w-4 h-3 object-cover rounded shadow"
                          alt="t1"
                          referrerPolicy="no-referrer"
                        />
                        <span>{selectedMatch.team1} (Gazde)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedTeamSide('team2')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                          selectedTeamSide === 'team2'
                            ? 'bg-zinc-800 text-white border-zinc-700'
                            : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-400'
                        }`}
                      >
                        <img 
                          src={`https://flagcdn.com/w20/${selectedMatch.team2Code}.png`} 
                          className="w-4 h-3 object-cover rounded shadow"
                          alt="t2"
                          referrerPolicy="no-referrer"
                        />
                        <span>{selectedMatch.team2} (Oaspeți)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Event Fields based on selections */}
                <div className="space-y-4 pt-1 border-t border-zinc-850/50">
                  {/* Minute and specific inputs */}
                  {(eventType === 'goal' || eventType === 'card') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Minutul Evenimentului</label>
                        <input
                          type="number"
                          min="1"
                          max="125"
                          value={eventMinute}
                          onChange={(e) => setEventMinute(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Nume Jucător Vizat</label>
                        <input
                          type="text"
                          required
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="Ex: Kylian Mbappé"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Card specific parameters */}
                  {eventType === 'card' && (
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Severitate Cartonaș</label>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-zinc-300">
                          <input 
                            type="radio" 
                            name="cardColor" 
                            value="galben" 
                            checked={cardColor === 'galben'} 
                            onChange={() => setCardColor('galben')}
                            className="bg-zinc-950 accent-amber-500"
                          />
                          <span className="text-amber-400 font-black">🟨 Cartonaș Galben (Avertisment)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-zinc-300">
                          <input 
                            type="radio" 
                            name="cardColor" 
                            value="roșu" 
                            checked={cardColor === 'roșu'} 
                            onChange={() => setCardColor('roșu')}
                            className="bg-zinc-950 accent-rose-500"
                          />
                          <span className="text-rose-500 font-black">🟥 Cartonaș Roșu (Eliminare)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Final result specific parameters */}
                  {eventType === 'final' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Scor Final înregistrat</label>
                        <input
                          type="text"
                          required
                          value={finalScore}
                          onChange={(e) => setFinalScore(e.target.value)}
                          placeholder="Ex: 3 - 2"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Omul Meciului (Interviuri sclipitoare)</label>
                        <input
                          type="text"
                          required
                          value={manOfTheMatch}
                          onChange={(e) => setManOfTheMatch(e.target.value)}
                          placeholder="Ex: Portarul meciului prin parade geniale"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Extra textual inputs */}
                  {eventType === 'kickoff' && (
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Detaliu tactici de start / Arbitraj (Opțional)</label>
                      <input
                        type="text"
                        value={extraDetails}
                        onChange={(e) => setExtraDetails(e.target.value)}
                        placeholder="Ex: Formație compactă de 4-3-3, arbitru din Argentina la centru"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>

                {/* Manual Trigger Actions */}
                <div className="pt-2 border-t border-zinc-850">
                  <button
                    type="button"
                    onClick={handleGenerateLiveEventArticle}
                    disabled={generatingFor !== null}
                    className="w-full flex items-center justify-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-zinc-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10 select-none"
                  >
                    {generatingFor === 'live_event_gen' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Se compune și se stochează articolul...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generează și Publică Articol Eveniment Live!</span>
                      </>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {successMatch === 'live_event_gen' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 block animate-in fade-in"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Articolul evenimentului a fost generat și publicat cu succes pe site!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right side: Awesome Real-Time Preview Area */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-zinc-900/60 border border-zinc-850 rounded-2xl p-5 shadow-xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center space-x-2 pb-1.5 border-b border-zinc-850">
                  <Tv className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Previzualizare Live în timp real (Cum va apărea pe platformă)</span>
                </h4>

                {/* Main cover sport image mockup */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 mb-4">
                  <img 
                    src={getCoverImageForId(selectedMatch.id + eventType + playerName)} 
                    alt="Sport Image" 
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  
                  {/* Category overlay */}
                  <span className="absolute top-3 left-3 text-[9px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded tracking-wide uppercase shadow">
                    CUPA MONDIALĂ 2026
                  </span>

                  {/* Flag layouts overlay */}
                  <div className="absolute bottom-3 left-3 flex items-center space-x-2.5">
                    <div className="flex -space-x-1.5">
                      <img 
                        src={`https://flagcdn.com/w40/${selectedMatch.team1Code}.png`} 
                        alt="flag1" 
                        className="w-8 h-5.5 object-cover rounded shadow border border-zinc-950" 
                        referrerPolicy="no-referrer"
                      />
                      <img 
                        src={`https://flagcdn.com/w40/${selectedMatch.team2Code}.png`} 
                        alt="flag2" 
                        className="w-8 h-5.5 object-cover rounded shadow border border-zinc-950" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-zinc-300 font-extrabold text-[11px] uppercase tracking-wider">
                      {selectedMatch.team1} vs {selectedMatch.team2}
                    </span>
                  </div>
                </div>

                {/* Preview text sections */}
                <div className="space-y-3 px-1">
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-bold tracking-widest text-[#E05424] uppercase">REPRODUCERE ÎN DIRECT / PROMO</span>
                  </div>

                  <h3 className="text-base md:text-lg font-extrabold text-white leading-snug tracking-tight">
                    {calculatedPreview.title}
                  </h3>

                  <div className="p-3.5 bg-zinc-950/75 border border-zinc-850/60 rounded-xl">
                    <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono px-2 py-0.5 rounded uppercase">Articol format Markdown</span>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-2 line-clamp-[7] whitespace-pre-wrap font-sans">
                      {calculatedPreview.content.substring(calculatedPreview.content.indexOf('\n') + 1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
