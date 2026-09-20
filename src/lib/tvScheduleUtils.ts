import { TVScheduleItem } from '../types';

export interface ChannelLiveInfo {
  currentProgram: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    progressPercent: number;
    remainingMinutes: number;
    category?: string;
  } | null;
  nextProgram: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    category?: string;
  } | null;
}

// Default master schedules per channel with standard typical programming blocks
const CHANNEL_TEMPLATES: Record<string, Array<{ start: string; end: string; title: string; desc: string; cat: string }>> = {
  'pro-tv': [
    { start: '06:00', end: '10:30', title: 'Știrile Pro TV Dimineața', desc: 'Cele mai proaspete informații ale dimineții, meteo și sport.', cat: 'Știri' },
    { start: '10:30', end: '13:00', title: 'Vorbește Lumea', desc: 'Lifestyle, invitați speciali, sfaturi utile și voie bună cu gazdele emisiunii.', cat: 'Generalist' },
    { start: '13:00', end: '14:00', title: 'Știrile Pro TV de la Ora 13:00', desc: 'Jurnalul de știri al prânzului prezentat din studioul Pro TV.', cat: 'Știri' },
    { start: '14:00', end: '15:00', title: 'Lecții de Viață', desc: 'Drame de familie și situații din viața reală inspirate din fapte autentice.', cat: 'Filme' },
    { start: '15:00', end: '17:00', title: 'La Măruță', desc: 'Talk-show plin de energie, vedete autohtone și momente în exclusivitate.', cat: 'Generalist' },
    { start: '17:00', end: '18:00', title: 'Ce se întâmplă doctore?', desc: 'Sănătate, nutriție și prevenție explicate de specialiști.', cat: 'Generalist' },
    { start: '18:00', end: '19:00', title: 'Lecții de Viață - Episod Nou', desc: 'Povești de viață captivante și deznodăminte surprinzătoare.', cat: 'Filme' },
    { start: '19:00', end: '20:30', title: 'Știrile Pro TV cu Andreea Esca', desc: 'Principalul buletin de știri al zilei. România, te iubesc!', cat: 'Știri' },
    { start: '20:30', end: '21:30', title: 'Las Fierbinți', desc: 'Comedia fenomen a României. Pățaniile lui Bobiță, Giani, Dorel și Celentano.', cat: 'Generalist' },
    { start: '21:30', end: '23:30', title: 'Filmul Pro: Misiune Imposibilă', desc: 'Acțiune de mare clasă, efecte speciale și adrenalină la cote maxime.', cat: 'Filme' },
    { start: '23:30', end: '00:30', title: 'Știrile Nopții Pro TV', desc: 'Recapitularea celor mai importante evenimente ale zilei.', cat: 'Știri' },
    { start: '00:30', end: '06:00', title: 'Aventuri Nocturne & Filme Clasice', desc: 'Selecție de filme și emisiuni de divertisment în reluare.', cat: 'Filme' },
  ],
  'antena-1': [
    { start: '06:00', end: '08:00', title: 'Observator Dimineața', desc: 'Știrile primei ore, trafic, meteo și evenimentele nopții.', cat: 'Știri' },
    { start: '08:00', end: '12:00', title: 'Neatza cu Răzvan și Dani', desc: 'Divertisment, umor, rubrici utile și invitați de seamă în direct.', cat: 'Generalist' },
    { start: '12:00', end: '14:00', title: 'Observator 12:00', desc: 'Jurnalul de prânz cu știri din țară și din lume.', cat: 'Știri' },
    { start: '14:00', end: '17:00', title: 'Mireasa - Sezon Nou', desc: 'Reality show matrimonial de succes, trăiri intense și competiție.', cat: 'Generalist' },
    { start: '17:00', end: '19:00', title: 'Observator 17:00 & Prețul cel bun', desc: 'Actualitate și concursul în care intuiția aduce premii pe măsură.', cat: 'Generalist' },
    { start: '19:00', end: '20:30', title: 'Observator 19:00', desc: 'Jurnalul principal de știri al Antenei 1, anchete și exclusivități.', cat: 'Știri' },
    { start: '20:30', end: '23:30', title: 'Chefi la Cuțite / America Express', desc: 'Competiție culinară spectaculoasă și reality-show-ul suprem.', cat: 'Generalist' },
    { start: '23:30', end: '00:30', title: 'Observator Noaptea', desc: 'Sinteza zilei și dosarele serii.', cat: 'Știri' },
    { start: '00:30', end: '06:00', title: 'Filmul Nopții Antena 1', desc: 'Comedii romantice și thrillere palpitante.', cat: 'Filme' },
  ],
  'digi-sport-1': [
    { start: '06:00', end: '09:00', title: 'Știrile Digi Sport & Rezumate', desc: 'Toate golurile din marile campionate europene și clasamente la zi.', cat: 'Sport' },
    { start: '09:00', end: '12:00', title: 'Tenis ATP / WTA Live', desc: 'Transmisiune în direct de la turneele internaționale de tenis.', cat: 'Sport' },
    { start: '12:00', end: '14:00', title: 'Digi Sport Matinal', desc: 'Dezbateri sportive, intervenții în direct și analize taktice.', cat: 'Sport' },
    { start: '14:00', end: '17:00', title: 'Liga 2 Live / Handbal EHF', desc: 'Partide în direct din competițiile naționale de top.', cat: 'Sport' },
    { start: '17:00', end: '18:30', title: 'Fotbal Club - Ediție Specială', desc: 'Avancronica meciurilor din SuperLiga României.', cat: 'Sport' },
    { start: '18:30', end: '20:45', title: 'SuperLiga României LIVE: Meciul Zilei', desc: 'Transmisiune în direct din campionatul național de fotbal.', cat: 'Sport' },
    { start: '20:45', end: '21:30', title: 'Studioul Fotbal Club', desc: 'Reacții la cald, interviuri de pe teren și faze controversate.', cat: 'Sport' },
    { start: '21:30', end: '23:45', title: 'UEFA Champions League / La Liga LIVE', desc: 'Spectacol fotbalistic de cel mai înalt nivel pe Digi Sport 1.', cat: 'Sport' },
    { start: '23:45', end: '01:00', title: 'Digi Sport Special', desc: 'Sinteza rundei europene cu experții Digi Sport.', cat: 'Sport' },
    { start: '01:00', end: '06:00', title: 'Reluări Partide de Top', desc: 'Meciurile memorabile ale săptămânii în reluare HD.', cat: 'Sport' },
  ],
  'digi24': [
    { start: '06:00', end: '10:00', title: 'Digi24 Dimineața', desc: 'Știri din oră în oră, revista presei și pulsul Capitalei.', cat: 'Știri' },
    { start: '10:00', end: '13:00', title: 'Știrile Zilei Digi24', desc: 'Evenimente politice, sociale și economice în direct.', cat: 'Știri' },
    { start: '13:00', end: '16:00', title: 'Jurnalul de Prânz & Studio Deschis', desc: 'Analize detaliate și transmisiuni live de la punctele fierbinți.', cat: 'Știri' },
    { start: '16:00', end: '19:00', title: 'România în Direct', desc: 'Dezbateri de actualitate, conexiuni cu corespondenții din țară.', cat: 'Știri' },
    { start: '19:00', end: '21:00', title: 'Jurnalul de Seară cu Cosmin Prelipceanu', desc: 'Cele mai importante dosare politice și sociale explicate transparent.', cat: 'Știri' },
    { start: '21:00', end: '23:00', title: 'Cap Limpede / Proiect de Țară', desc: 'Editorial de opinie, interviuri de profunzime cu personalități publice.', cat: 'Știri' },
    { start: '23:00', end: '00:00', title: 'Sinteza Zilei Digi24', desc: 'Concluziile celor mai fierbinți ore de actualitate din România.', cat: 'Știri' },
    { start: '00:00', end: '06:00', title: 'Știrile Nopții Digi24', desc: 'Flux continuu de informații și reportaje speciale.', cat: 'Știri' },
  ],
  'kanal-d': [
    { start: '07:00', end: '09:00', title: 'Știrile Kanal D Dimineața', desc: 'Informațiile începutului de zi explicate simplu și direct.', cat: 'Știri' },
    { start: '09:00', end: '12:00', title: 'Casa Iubirii', desc: 'Emisiune despre trăiri romantice și alegeri de viață.', cat: 'Generalist' },
    { start: '12:00', end: '13:00', title: 'Știrile Kanal D 12:00', desc: 'Jurnalul de știri prezentat din noul studio Kanal D.', cat: 'Știri' },
    { start: '13:00', end: '15:00', title: 'În căutarea adevărului', desc: 'Seriale docudramă bazate pe mărturii și conflicte umane.', cat: 'Generalist' },
    { start: '15:00', end: '17:00', title: 'Teo Show & Roata Norocului', desc: 'Divertisment de familie și premii pentru concurenți.', cat: 'Generalist' },
    { start: '17:00', end: '19:00', title: 'Casa Iubirii - Gala Zilei', desc: 'Emoții puternice și răsturnări de situație în platoul emisiunii.', cat: 'Generalist' },
    { start: '19:00', end: '20:00', title: 'Știrile Kanal D cu Christian Sabbagh', desc: 'Anchete speciale, reportaje sociale și știri de impact.', cat: 'Știri' },
    { start: '20:00', end: '22:30', title: 'Jocul Cuvintelor cu Dan Negru', desc: 'Quiz show-ul fenomen al minții și al vocabularului românesc.', cat: 'Generalist' },
    { start: '22:30', end: '00:30', title: 'Serial Turcesc de Succes', desc: 'Episoade pline de pasiune, intrigi și suspans.', cat: 'Filme' },
    { start: '00:30', end: '07:00', title: 'Reluări Emisiuni Kanal D', desc: 'Cele mai urmărite momente ale săptămânii.', cat: 'Generalist' },
  ],
  'hbo': [
    { start: '06:00', end: '08:30', title: 'Filmul Dimineții: Aventura Magică', desc: 'Producție cinematografică pentru întreaga familie.', cat: 'Filme' },
    { start: '08:30', end: '10:30', title: 'Comedie de Weekend', desc: 'Umor inteligent și distribuție de actori premiați.', cat: 'Filme' },
    { start: '10:30', end: '13:00', title: 'Drama Anului: Povești din New York', desc: 'O peliculă nominalizată la premiile Academiei Americane de Film.', cat: 'Filme' },
    { start: '13:00', end: '15:00', title: 'Blockbuster Sci-Fi: Dune 2', desc: 'Epopeea spațială regizată de Denis Villeneuve în calitate Ultra HD.', cat: 'Filme' },
    { start: '15:00', end: '17:30', title: 'Serial Original HBO: Succession', desc: 'Jocuri de putere și lupte dinastice într-un imperiu media.', cat: 'Filme' },
    { start: '17:30', end: '20:00', title: 'The Last of Us - Sezon Nou', desc: 'Supraviețuire, emoție și speranță într-o lume post-apocaliptică.', cat: 'Filme' },
    { start: '20:00', end: '22:15', title: 'Premiera HBO: Oppenheimer', desc: 'Capodopera istorică a lui Christopher Nolan. Film eveniment.', cat: 'Filme' },
    { start: '22:15', end: '00:30', title: 'House of the Dragon - Episod Nou', desc: 'Războiul civil din casa Targaryen ajunge la apogeu.', cat: 'Filme' },
    { start: '00:30', end: '06:00', title: 'Cinemateca Nocturnă HBO', desc: 'Thrillere psihologice și clasici ai cinematografiei moderne.', cat: 'Filme' },
  ],
  'digi-sport-2': [
    { start: '06:00', end: '10:00', title: 'Motorsport & Formula 1 Magazine', desc: 'Analize tehnice, telemetrie și culisele Marelui Circ.', cat: 'Sport' },
    { start: '10:00', end: '13:00', title: 'Baschet Euroliga / NBA Action', desc: 'Dunk-uri spectaculoase și faze memorabile.', cat: 'Sport' },
    { start: '13:00', end: '16:00', title: 'Ciclism / Turul Italiei', desc: 'Etape montane spectaculoase și sprinturi de neuitat.', cat: 'Sport' },
    { start: '16:00', end: '18:30', title: 'Fotbal Serie A LIVE', desc: 'Meci de tradiție din prima ligă a Italiei.', cat: 'Sport' },
    { start: '18:30', end: '21:00', title: 'Fotbal Ligue 1 LIVE', desc: 'Transmisiune în direct din campionatul Franței.', cat: 'Sport' },
    { start: '21:00', end: '23:30', title: 'Handbal Champions League LIVE', desc: 'Meci decisiv din cupele europene intercluburi.', cat: 'Sport' },
    { start: '23:30', end: '06:00', title: 'Sporturi cu Motor & Reluări', desc: 'Raliuri, Superbike și rezumate de colecție.', cat: 'Sport' },
  ],
  'prima-tv': [
    { start: '06:00', end: '09:00', title: 'Focus Dimineața', desc: 'Știri pozitive, starea vremii și informații din trafic.', cat: 'Știri' },
    { start: '09:00', end: '12:00', title: 'Poezie și Delicatețuri', desc: 'Mircea Dinescu gătește cu pasiune alături de invitați de seamă.', cat: 'Generalist' },
    { start: '12:00', end: '14:00', title: 'Schimb de Mame', desc: 'Reality-show cu familii din toate colțurile României.', cat: 'Generalist' },
    { start: '14:00', end: '18:00', title: 'Seriale & Filme de Familie', desc: 'Comedii calde și povești de neuitat.', cat: 'Filme' },
    { start: '18:00', end: '19:30', title: 'Focus 18: Știrile Prima TV', desc: 'Principalul buletin de știri al postului Prima TV.', cat: 'Știri' },
    { start: '19:30', end: '21:00', title: 'Cronica Cârcotașilor', desc: 'Cea mai longevivă satiră TV din România. Bâlbe și haz de necaz.', cat: 'Generalist' },
    { start: '21:00', end: '23:00', title: 'Starea Nației cu Dragoș Pătraru', desc: 'Jurnalism critic, sancționarea derapajelor politice și umor fin.', cat: 'Generalist' },
    { start: '23:00', end: '06:00', title: 'Filmul Nopții Prima TV', desc: 'Selecție variată de filme artistice.', cat: 'Filme' },
  ],
  'tvr-1': [
    { start: '06:00', end: '09:00', title: 'Cu capul în zori', desc: 'Matinalul TVR cu muzică de calitate, reportaje culturale și sănătate.', cat: 'Generalist' },
    { start: '09:00', end: '12:00', title: 'Tezaur Folcloric', desc: 'Tradiții autentice, cântece strămoșești și obiceiuri din vatra satului.', cat: 'Documentare' },
    { start: '12:00', end: '14:00', title: 'Telejurnalul de Prânz', desc: 'Știrile Televiziunii Române.', cat: 'Știri' },
    { start: '14:00', end: '17:00', title: 'Viața Satului & Ferma', desc: 'Actualitate rurală, agricultură modernă și meșteșuguri românești.', cat: 'Documentare' },
    { start: '17:00', end: '19:00', title: 'România 9', desc: 'Dezbateri fundamentale despre educație, societate și cultură.', cat: 'Știri' },
    { start: '19:00', end: '20:00', title: 'Ediție Specială TVR', desc: 'Interviuri cu academicieni, scriitori și oameni de știință.', cat: 'Generalist' },
    { start: '20:00', end: '21:30', title: 'Telejurnalul TVR 1', desc: 'Jurnalul de referință al postului public de televiziune.', cat: 'Știri' },
    { start: '21:30', end: '23:30', title: 'Filmul de Artă TVR', desc: 'Cinematografie de festival și capodopere premiate la Cannes și Berlin.', cat: 'Filme' },
    { start: '23:30', end: '06:00', title: 'Arhiva de Aur a TVR', desc: 'Momente istorice și piese de teatru TV de colecție.', cat: 'Documentare' },
  ],
  'pro-arena': [
    { start: '06:00', end: '10:00', title: 'Arena Sportivă: Golurile Zilei', desc: 'Cele mai frumoase execuții din fotbalul mondial.', cat: 'Sport' },
    { start: '10:00', end: '13:00', title: 'Lupte de Contact & MMA', desc: 'Competiții spectaculoase în cușcă și gale UFC.', cat: 'Sport' },
    { start: '13:00', end: '17:00', title: 'Super Meciuri din Fotbalul European', desc: 'Partide istorice și rezumate extinse.', cat: 'Sport' },
    { start: '17:00', end: '20:00', title: 'Ora Exactă în Sport', desc: 'Emisiune interactivă cu analiști și jurnaliști sportivi.', cat: 'Sport' },
    { start: '20:00', end: '23:00', title: 'Europa League LIVE', desc: 'Transmisiuni în direct din fazele eliminatorii.', cat: 'Sport' },
    { start: '23:00', end: '06:00', title: 'Noaptea Gladiatorilor', desc: 'Kickboxing internațional și gale spectaculoase.', cat: 'Sport' },
  ],
  'national-geographic': [
    { start: '06:00', end: '09:00', title: 'Animale Salbatice în Acțiune', desc: 'Fauna africană în cele mai spectaculoase filmări 4K.', cat: 'Documentare' },
    { start: '09:00', end: '12:00', title: 'Dezastre în Aer (Air Crash)', desc: 'Reconstituirea pas cu pas a celor mai misterioase accidente aviatice.', cat: 'Documentare' },
    { start: '12:00', end: '15:00', title: 'Genii ale Ingineriei', desc: 'Megastructuri, poduri gigantice și tuneluri subacvatice.', cat: 'Documentare' },
    { start: '15:00', end: '18:00', title: 'Planeta Vie: Secretele Oceanelor', desc: 'Expediții științifice în cele mai adânci abisuri ale Terrei.', cat: 'Documentare' },
    { start: '18:00', end: '20:00', title: 'Istoria Neștiută a Civilizațiilor', desc: 'Arheologie modernă, scanări laser LiDAR și morminte egiptene.', cat: 'Documentare' },
    { start: '20:00', end: '22:00', title: 'Cosmos: Odisee în Spațiu', desc: 'O călătorie vizuală uluitoare prin legile fizicii și universul observabil.', cat: 'Documentare' },
    { start: '22:00', end: '00:00', title: 'Taboo & Enigmele Omenirii', desc: 'Cercetarea celor mai fascinante ritualuri ale planetei.', cat: 'Documentare' },
    { start: '00:00', end: '06:00', title: 'Natura Nocturnă', desc: 'Misterele vieții din junglele ecuatoriale după apusul soarelui.', cat: 'Documentare' },
  ]
};

// Converts 'HH:mm' string to minutes from 00:00
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  // Handle formats like "19:00 - 20:30" or "19:00"
  const clean = timeStr.trim().split(/[\s\-–]+/)[0];
  const parts = clean.split(':').map(p => parseInt(p, 10));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

// Converts minutes from 00:00 back to 'HH:mm'
export function minutesToTime(mins: number): string {
  const norm = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60).toString().padStart(2, '0');
  const m = (norm % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function getBucharestTimeParts(targetDate: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dateString: string;
  timeString: string;
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Bucharest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(targetDate);
    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }
    const year = parseInt(map.year || '2026', 10);
    const month = parseInt(map.month || '1', 10);
    const day = parseInt(map.day || '1', 10);
    const hour = parseInt(map.hour || '0', 10);
    const minute = parseInt(map.minute || '0', 10);
    const second = parseInt(map.second || '0', 10);
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    return { year, month, day, hour, minute, second, dateString, timeString };
  } catch (e) {
    const now = targetDate;
    const dateString = now.toISOString().split('T')[0];
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      dateString,
      timeString
    };
  }
}

export function getCurrentTimeMinutes(): number {
  const parts = getBucharestTimeParts();
  return parts.hour * 60 + parts.minute;
}

export function getTodayBucharestString(): string {
  return getBucharestTimeParts().dateString;
}

export function getBucharestDateString(date: Date = new Date()): string {
  return getBucharestTimeParts(date).dateString;
}

/**
 * Returns the currently playing program and next program for a given channel
 */
export function getChannelLiveSchedule(
  channelId: string,
  customScheduleItems: TVScheduleItem[] = []
): ChannelLiveInfo {
  const currentMinutes = getCurrentTimeMinutes();
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Check if there are user/db scheduled items for this channel for today
  const channelDbItems = customScheduleItems
    .filter(item => {
      const matchChan = (item.channelId || '').toLowerCase() === channelId.toLowerCase();
      const matchDate = !item.date || item.date === todayStr;
      return matchChan && matchDate;
    })
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  if (channelDbItems.length >= 2) {
    // Determine which item is active
    for (let i = 0; i < channelDbItems.length; i++) {
      const cur = channelDbItems[i];
      const next = channelDbItems[i + 1] || null;
      const startM = timeToMinutes(cur.time);
      const endM = (cur as any).endTime 
        ? timeToMinutes((cur as any).endTime) 
        : next ? timeToMinutes(next.time) : startM + 90;

      if (currentMinutes >= startM && currentMinutes < endM) {
        const total = Math.max(1, endM - startM);
        const elapsed = currentMinutes - startM;
        const progressPercent = Math.min(100, Math.max(5, Math.round((elapsed / total) * 100)));
        const remainingMinutes = Math.max(1, endM - currentMinutes);

        return {
          currentProgram: {
            title: cur.title,
            description: cur.description || 'Program TV în direct pe canalul ' + channelId,
            startTime: minutesToTime(startM),
            endTime: minutesToTime(endM),
            progressPercent,
            remainingMinutes,
            category: (cur as any).category
          },
          nextProgram: next ? {
            title: next.title,
            description: next.description || '',
            startTime: minutesToTime(timeToMinutes(next.time)),
            endTime: (next as any).endTime ? minutesToTime(timeToMinutes((next as any).endTime)) : minutesToTime(timeToMinutes(next.time) + 60),
            category: (next as any).category
          } : null
        };
      }
    }
  }

  // 2. Use our rich curated realistic Romanian TV schedule template
  const template = CHANNEL_TEMPLATES[channelId.toLowerCase()] || CHANNEL_TEMPLATES['pro-tv'];
  
  for (let i = 0; i < template.length; i++) {
    const block = template[i];
    const startM = timeToMinutes(block.start);
    let endM = timeToMinutes(block.end);
    if (endM <= startM) {
      endM += 1440; // overnight broadcast
    }

    let checkMinutes = currentMinutes;
    if (checkMinutes < startM && startM > 1200) {
      // It might be after midnight for an evening show
      checkMinutes += 1440;
    }

    if (checkMinutes >= startM && checkMinutes < endM) {
      const nextBlock = template[(i + 1) % template.length];
      const total = Math.max(1, endM - startM);
      const elapsed = checkMinutes - startM;
      const progressPercent = Math.min(100, Math.max(4, Math.round((elapsed / total) * 100)));
      const remainingMinutes = Math.max(1, endM - checkMinutes);

      return {
        currentProgram: {
          title: block.title,
          description: block.desc,
          startTime: block.start,
          endTime: block.end,
          progressPercent,
          remainingMinutes,
          category: block.cat
        },
        nextProgram: {
          title: nextBlock.title,
          description: nextBlock.desc,
          startTime: nextBlock.start,
          endTime: nextBlock.end,
          category: nextBlock.cat
        }
      };
    }
  }

  // Fallback if boundary edge
  const defaultBlock = template[0];
  const nextBlock = template[1] || template[0];
  return {
    currentProgram: {
      title: defaultBlock.title,
      description: defaultBlock.desc,
      startTime: defaultBlock.start,
      endTime: defaultBlock.end,
      progressPercent: 42,
      remainingMinutes: 38,
      category: defaultBlock.cat
    },
    nextProgram: {
      title: nextBlock.title,
      description: nextBlock.desc,
      startTime: nextBlock.start,
      endTime: nextBlock.end,
      category: nextBlock.cat
    }
  };
}

/**
 * Returns full schedule list for a channel on a given date (default today)
 */
export function getChannelFullDaySchedule(channelId: string, dateStr?: string): Array<{
  id: string;
  time: string;
  endTime: string;
  title: string;
  description: string;
  category: string;
  date: string;
  isNow: boolean;
  isPast: boolean;
  progressPercent: number;
}> {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  const currentMinutes = getCurrentTimeMinutes();
  const isToday = !dateStr || dateStr === new Date().toISOString().split('T')[0];
  const template = CHANNEL_TEMPLATES[channelId.toLowerCase()] || CHANNEL_TEMPLATES['pro-tv'];

  return template.map((item, idx) => {
    const startM = timeToMinutes(item.start);
    let endM = timeToMinutes(item.end);
    if (endM <= startM) endM += 1440;

    let isNow = false;
    let isPast = false;
    let progressPercent = 0;

    if (isToday) {
      let checkM = currentMinutes;
      if (checkM < startM && startM > 1200) checkM += 1440;

      if (checkM >= startM && checkM < endM) {
        isNow = true;
        const total = Math.max(1, endM - startM);
        progressPercent = Math.min(100, Math.max(5, Math.round(((checkM - startM) / total) * 100)));
      } else if (checkM >= endM) {
        isPast = true;
        progressPercent = 100;
      }
    }

    return {
      id: `${channelId}-${targetDate}-${idx}`,
      time: item.start,
      endTime: item.end,
      title: item.title,
      description: item.desc,
      category: item.cat,
      date: targetDate,
      isNow,
      isPast,
      progressPercent
    };
  });
}

export interface UpcomingShowItem {
  channelId: string;
  channelTitle: string;
  channelLogo?: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  minutesUntilStart: number;
  category?: string;
}

/**
 * Calculates shows starting in the near future across channels (e.g. within 1-180 mins)
 */
export function getUpcomingShows(
  channels: Array<{ id: string; title: string; logo?: string; thumbnail?: string; category?: string }>,
  customSchedule: TVScheduleItem[] = [],
  limit = 8
): UpcomingShowItem[] {
  const currentMinutes = getCurrentTimeMinutes();
  const upcoming: UpcomingShowItem[] = [];

  channels.forEach(ch => {
    const liveInfo = getChannelLiveSchedule(ch.id, customSchedule);
    if (liveInfo.nextProgram) {
      const next = liveInfo.nextProgram;
      const startM = timeToMinutes(next.startTime);
      let diff = startM - currentMinutes;
      if (diff < 0 && startM < 300) {
        diff += 1440; // after midnight
      }
      if (diff > 0 && diff <= 300) {
        upcoming.push({
          channelId: ch.id,
          channelTitle: ch.title,
          channelLogo: ch.logo || ch.thumbnail,
          title: next.title,
          description: next.description,
          startTime: next.startTime,
          endTime: next.endTime,
          minutesUntilStart: diff,
          category: next.category || ch.category
        });
      }
    }
  });

  return upcoming.sort((a, b) => a.minutesUntilStart - b.minutesUntilStart).slice(0, limit);
}

