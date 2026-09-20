import https from 'https';
import http from 'http';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';

export interface EPGProgram {
  id: string;
  channelId: string;
  channelName: string;
  title: string;
  description: string;
  startTime: string;       // ISO string UTC
  endTime: string;         // ISO string UTC
  startFormatted: string;  // "HH:MM" (Europe/Bucharest)
  endFormatted: string;    // "HH:MM" (Europe/Bucharest)
  date: string;            // "YYYY-MM-DD" (Europe/Bucharest)
  durationMinutes: number;
  category: string;
  genre?: string;
  image?: string;
  icon?: string;
  rating?: string;
  season?: number;
  episode?: number;
  providerChannelId: string;
  source: string;
}

export interface ChannelLiveEPG {
  channelId: string;
  channelName: string;
  channelLogo?: string;
  channelCategory?: string;
  currentProgram: {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    startFormatted: string;
    endFormatted: string;
    progressPercent: number;
    remainingMinutes: number;
    category: string;
    image?: string;
  } | null;
  nextProgram: {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    startFormatted: string;
    endFormatted: string;
    minutesUntilStart: number;
    category: string;
    image?: string;
  } | null;
}

export interface EPGStatus {
  lastSyncTime: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastError: string | null;
  totalProgrammes: number;
  totalChannelsInFeed: number;
  mappedChannelsCount: number;
  imageCoveragePercent: number;
  primarySource: string;
  fallbackSource: string;
  activeSourceUsed: string | null;
  sources: Array<{ name: string; url: string; status: string }>;
}

// Built-in high-quality artwork mapping for known Romanian TV flagship shows
const KNOWN_SHOW_ARTWORK: Record<string, string> = {
  // Pro TV
  'stirile pro tv': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
  'stirile pro tv dimineata': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
  'las fierbinti': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
  'romanii au talent': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'vocea romaniei': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'vorbeste lumea': 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80',
  'la maruta': 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&auto=format&fit=crop&q=80',
  'lectii de viata': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
  'batem palma': 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
  'ce se intampla doctore': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80',
  'romania, te iubesc': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
  'clanul': 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
  'groapa': 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80',
  'visuri la cheie': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
  'masterchef': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80',
  'imparatia': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  'la marginea lumii': 'https://static.cinemagia.ro/img/resize/db/movie/33/27/233/uzak-sehir-700910l-175x0-w-5fe52981.jpg',
  'fata din vis': 'https://static.cinemagia.ro/img/resize/db/movie/33/30/071/esref-ruya-602183l-175x0-w-e327340b.jpg',

  // Antena 1
  'observator': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
  'neatza cu razvan si dani': 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80',
  'super neatza': 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80',
  'chefi la cutite': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80',
  'asia express': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80',
  'america express': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  'mireasa': 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80',
  'te cunosc de undeva': 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=600&auto=format&fit=crop&q=80',
  'iubire cu parfum de lavanda': 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80',
  'iumor': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'furnicutele': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
  'pretul cel bun': 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
  'lia, sotia sotului meu': 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80',

  // Kanal D
  'stirile kanal d': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
  'casa iubirii': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
  'jocul cuvintelor': 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
  'in cautarea adevarului': 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=600&auto=format&fit=crop&q=80',
  'roata norocului': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
  '40 de intrebari': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
  'tu urmezi': 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
  'vieti schimbate': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',

  // Sport (Digi Sport, Prima Sport, etc.)
  'stirile digi sport': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
  'fotbal club': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
  'digi sport special': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80',
  'digi sport matinal': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
  'superliga': 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80',
  'uefa champions league': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
  'uefa europa league': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
  'formula 1': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80',
  'tenis': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80',
  'handbal': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
  'la liga': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
  'serie a': 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80',
  'premier league': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
  'motosport': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80',

  // News (Digi24, Antena 3 CNN, Romania TV, B1 TV, Prima News, Euronews)
  'jurnalul de seara': 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&auto=format&fit=crop&q=80',
  'stirile digi24': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
  'digi24 dimineata': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
  'romania in direct': 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=600&auto=format&fit=crop&q=80',
  'cap limpede': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
  'sinteza zilei': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
  'starea natiei': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
  'cronica carcotasilor': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'focus': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
  'telejurnal': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
  'tezaur folcloric': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  'viata satului': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
  'romania 9': 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=600&auto=format&fit=crop&q=80',
  'exclusiv vip': 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80',
  'poezie si delicateturi': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80'
};

// Thematic high quality category fallback covers
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'Sport': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
  'Fotbal': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
  'Știri': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
  'Stiri': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
  'Filme': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
  'Film': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
  'Seriale': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
  'Serial': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
  'Documentare': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
  'Documentar': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
  'Divertisment': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'Generalist': 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80',
  'Copii': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
  'Animaţie': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
  'Muzică': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'Muzica': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'Religie': 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop&q=80',
  'Lifestyle': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'
};

// Default Channel Mapping: internal channelId -> XMLTV Provider Channel IDs (ordered by priority)
export const DEFAULT_CHANNEL_MAPPINGS: Record<string, string[]> = {
  'pro-tv': ['PRO.TV.HD.ro', 'PRO.TV.ro', 'PRO.TV.INTERNATIONAL.ro'],
  'antena-1': ['Antena.1.HD.ro', 'Antena.1.ro'],
  'digi-sport-1': ['Digi.Sport.1.HD.ro', 'Digi.Sport.1.ro'],
  'digi-sport-2': ['Digi.Sport.2.HD.ro', 'Digi.Sport.2.ro'],
  'digi-sport-3': ['Digi.Sport.3.HD.ro', 'Digi.Sport.3.ro'],
  'digi-sport-4': ['Digi.Sport.4.HD.ro', 'Digi.Sport.4.ro'],
  'kanal-d': ['Kanal.D.HD.ro', 'Kanal.D.ro'],
  'kanal-d2': ['Kanal.D2.HD.ro', 'Kanal.D2.ro'],
  'hbo': ['HBO.HD.ro', 'HBO.ro'],
  'hbo-2': ['HBO.2.HD.ro', 'HBO.2.ro'],
  'hbo-3': ['HBO.3.HD.ro', 'HBO.3.ro'],
  'prima-tv': ['Prima.TV.HD.ro', 'Prima.TV.ro'],
  'prima-sport-1': ['Prima.Sport.1.HD.ro', 'Prima.Sport.1.ro'],
  'prima-sport-2': ['Prima.Sport.2.HD.ro', 'Prima.Sport.2.ro'],
  'prima-sport-3': ['Prima.Sport.3.HD.ro', 'Prima.Sport.3.ro'],
  'prima-sport-4': ['Prima.Sport.4.HD.ro', 'Prima.Sport.4.ro'],
  'prima-sport-5': ['Prima.Sport.5.HD.ro', 'Prima.Sport.5.ro'],
  'prima-news': ['Prima.News.ro'],
  'digi24': ['Digi.24.HD.ro', 'Digi.24.ro'],
  'tvr-1': ['TVR.1.HD.ro', 'TVR.1.ro'],
  'tvr-2': ['TVR.2.HD.ro', 'TVR.2.ro'],
  'tvr-sport': ['TVR.Sport.HD.ro'],
  'tvr-international': ['TVR.International.ro'],
  'tvr-timisoara': ['TVR.Timișoara.ro', 'TVR.Timisoara.ro'],
  'pro-arena': ['Pro.Arena.HD.ro', 'Pro.Arena.ro'],
  'pro-cinema': ['Pro.Cinema.HD.ro', 'Pro.Cinema.ro'],
  'antena-3': ['Antena.3.CNN.HD.ro', 'Antena.3.CNN.ro', 'Antena.3.ro'],
  'antena-stars': ['Antena.Stars.HD.ro', 'Antena.Stars.ro'],
  'antena-international': ['Antena.International.ro'],
  'happy-channel': ['Happy.Channel.HD.ro', 'Happy.Channel.ro'],
  'acasa-tv': ['Acasa.TV.HD.ro', 'Acasa.TV.ro', 'Acasa.ro'],
  'acasa-gold': ['Acasa.Gold.HD.ro', 'Acasa.Gold.ro'],
  'cinemaraton': ['Cinemaraton.ro', 'Cinemaraton.HD.ro'],
  'cinemax': ['Cinemax.HD.ro', 'Cinemax.ro', 'CineMAX.ro'],
  'cinemax-2': ['Cinemax.2.HD.ro', 'Cinemax.2.ro'],
  'b1-tv': ['B1.TV.HD.ro', 'B1.TV.ro'],
  'realitatea-plus': ['Realitatea.Plus.ro', 'Realitatea.TV.ro'],
  'romania-tv': ['Romania.TV.ro'],
  'national-tv': ['National.TV.ro'],
  'national-24-plus': ['National.24.Plus.ro'],
  'eurosport-1': ['Eurosport.1.HD.ro', 'Eurosport.1.ro'],
  'eurosport-2': ['Eurosport.2.HD.ro', 'Eurosport.2.ro'],
  'discovery': ['Discovery.Channel.ro'],
  'id-investigation': ['ID.Investigation.Discovery.HD.ro', 'ID.Investigation.Discovery.ro'],
  'national-geographic': ['National.Geographic.HD.ro', 'National.Geographic.ro'],
  'nat-geo-wild': ['National.Geographic.Wild.HD.ro', 'National.Geographic.Wild.ro'],
  'history': ['History.Channel.HD.ro', 'History.Channel.ro', 'History.ro'],
  'cartoon-network': ['Cartoon.Network.ro'],
  'disney-channel': ['Disney.Channel.ro'],
  'disney-junior': ['Disney.Junior.ro'],
  'nickelodeon': ['Nickelodeon.ro', 'Nickelodeon.HD.ro'],
  'nicktoons': ['Nicktoons.ro'],
  'minimax': ['Minimax.ro'],
  'kiss-tv': ['Kiss.TV.ro'],
  'zu-tv': ['ZU.TV.HD.ro', 'ZU.TV.ro'],
  'utv': ['UTV.HD.ro', 'UTV.ro'],
  'etno-tv': ['Etno.TV.HD.ro', 'Etno.TV.ro'],
  'favorit-tv': ['Favorit.TV.ro'],
  'taraf-tv': ['Taraf.TV.HD.ro', 'Taraf.TV.ro'],
  'party-mix': ['Party.Mix.HD.ro'],
  'magic-tv': ['Magic.TV.ro'],
  'rock-tv': ['Rock.TV.ro'],
  'trinitas-tv': ['Trinitas.TV.HD.ro', 'Trinitas.TV.ro'],
  'speranta-tv': ['Speranta.TV.ro'],
  'film-now': ['Film.Now.HD.ro', 'Film.Now.ro'],
  'filmcafe': ['FILM.CAFE.HD.ro', 'FILM.CAFE.ro'],
  'amc': ['AMC.ro'],
  'diva': ['DIVA.Universal.ro', 'DIVA.ro'],
  'tv1000': ['TV1000.ro'],
  'epic-drama': ['Epic.Drama.HD.ro'],
  'axn': ['AXN.HD.ro', 'AXN.ro'],
  'viasat-explore': ['Viasat.Explore.HD.ro', 'Viasat.Explore.ro'],
  'viasat-history': ['Viasat.History.HD.ro', 'Viasat.History.ro'],
  'viasat-nature': ['Viasat.Nature.HD.ro', 'Viasat.Nature.ro'],
  'animal-planet': ['Animal.Planet.HD.ro', 'Animal.Planet.ro'],
  'comedy-central': ['Comedy.Central.ro'],
  'euronews': ['Euronews.Romania.HD.ro', 'Euronews.Romania.ro', 'Euronews.ro'],
  'al-jazeera': ['Al.Jazeera.English.ro'],
  'cnn': ['CNN.International.ro'],
  'bbc-news': ['BBC.News.ro']
};

class EPGService {
  private primaryUrl = 'https://epgshare01.online/epgshare01/epg_ripper_RO1.xml.gz';
  private fallbackUrl = 'https://epg.lat/files/ro.xml.gz';
  
  // In-memory normalized program store
  private programsByChannel: Map<string, EPGProgram[]> = new Map();
  private allPrograms: EPGProgram[] = [];
  private providerChannels: Map<string, { id: string; name: string; icon?: string }> = new Map();
  private customMappings: Record<string, string[]> = { ...DEFAULT_CHANNEL_MAPPINGS };
  private customArtworkOverrides: Record<string, string> = {};

  private status: EPGStatus = {
    lastSyncTime: null,
    syncStatus: 'idle',
    lastError: null,
    totalProgrammes: 0,
    totalChannelsInFeed: 0,
    mappedChannelsCount: 0,
    imageCoveragePercent: 0,
    primarySource: this.primaryUrl,
    fallbackSource: this.fallbackUrl,
    activeSourceUsed: null,
    sources: [
      { name: 'EPGShare01 Romania (RO1)', url: this.primaryUrl, status: 'Active' },
      { name: 'EPG Lat Romania Backup', url: this.fallbackUrl, status: 'Standby' }
    ]
  };

  private cacheDir = path.join(process.cwd(), 'cache');
  private cacheFilePath = path.join(process.cwd(), 'cache', 'epg_normalized_cache.json');
  private isSyncing = false;

  constructor() {
    this.ensureCacheDir();
    this.loadFromCache();
  }

  private ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      try {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      } catch (e) {
        console.warn('Could not create cache dir:', e);
      }
    }
  }

  public getStatus(): EPGStatus {
    return { ...this.status };
  }

  public getChannelMappings(): Record<string, string[]> {
    return { ...this.customMappings };
  }

  public setChannelMappings(mappings: Record<string, string[]>) {
    this.customMappings = { ...DEFAULT_CHANNEL_MAPPINGS, ...mappings };
    this.reindexPrograms();
  }

  public setArtworkOverride(titlePattern: string, imageUrl: string) {
    this.customArtworkOverrides[titlePattern.toLowerCase().trim()] = imageUrl;
  }

  public getProviderChannelsList(): Array<{ id: string; name: string; icon?: string }> {
    return Array.from(this.providerChannels.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Helper to parse XMLTV timestamp format: YYYYMMDDHHMMSS +ZZZZ
   * Converts directly to ISO UTC and Bucharest date/time string
   */
  private parseXmltvTime(timeStr: string): { iso: string; date: string; time: string; timestamp: number } {
    const clean = timeStr.trim();
    // Pattern: 20260918001500 +0300
    const m = clean.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?/);
    if (!m) {
      const fallbackDate = new Date();
      return {
        iso: fallbackDate.toISOString(),
        date: fallbackDate.toISOString().split('T')[0],
        time: '00:00',
        timestamp: fallbackDate.getTime()
      };
    }

    const year = m[1];
    const month = m[2];
    const day = m[3];
    const hour = m[4];
    const min = m[5];
    const sec = m[6];
    const tz = m[7] || '+0300';
    const tzSign = tz.slice(0, 1);
    const tzHours = tz.slice(1, 3);
    const tzMins = tz.slice(3, 5);

    const isoString = `${year}-${month}-${day}T${hour}:${min}:${sec}${tzSign}${tzHours}:${tzMins}`;
    const dateObj = new Date(isoString);

    // Format according to Romanian local broadcast time (Europe/Bucharest)
    const bucharestFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Bucharest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    try {
      const parts = bucharestFormatter.formatToParts(dateObj);
      const partMap: Record<string, string> = {};
      parts.forEach(p => { partMap[p.type] = p.value; });
      const bDate = `${partMap.year}-${partMap.month}-${partMap.day}`;
      const bTime = `${partMap.hour}:${partMap.minute}`;

      return {
        iso: dateObj.toISOString(),
        date: bDate,
        time: bTime,
        timestamp: dateObj.getTime()
      };
    } catch (e) {
      return {
        iso: dateObj.toISOString(),
        date: `${year}-${month}-${day}`,
        time: `${hour}:${min}`,
        timestamp: dateObj.getTime()
      };
    }
  }

  /**
   * Cleans show title and finds optimal artwork
   */
  private resolveShowArtwork(title: string, category: string, xmltvIcon?: string): string | undefined {
    if (xmltvIcon && xmltvIcon.startsWith('http')) {
      return xmltvIcon;
    }

    const normalizedTitle = title.toLowerCase()
      .replace(/[ăâ]/g, 'a')
      .replace(/[î]/g, 'i')
      .replace(/[șş]/g, 's')
      .replace(/[țţ]/g, 't')
      .replace(/\(r\)/gi, '')
      .replace(/\(reluare\)/gi, '')
      .replace(/sezonul\s+\d+/gi, '')
      .replace(/ep\.\s*\d+/gi, '')
      .replace(/episoadele?\s+\d+/gi, '')
      .replace(/\(\?\)/g, '')
      .trim();

    // Check custom manual overrides
    for (const [key, url] of Object.entries(this.customArtworkOverrides)) {
      if (normalizedTitle.includes(key) && url) return url;
    }

    // Check known flagship Romanian TV shows
    for (const [key, url] of Object.entries(KNOWN_SHOW_ARTWORK)) {
      if (normalizedTitle.includes(key)) {
        return url;
      }
    }

    // Check category fallback
    if (category && CATEGORY_FALLBACK_IMAGES[category]) {
      return CATEGORY_FALLBACK_IMAGES[category];
    }

    // Category partial match
    for (const [catKey, catUrl] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
      if (category && category.toLowerCase().includes(catKey.toLowerCase())) {
        return catUrl;
      }
    }

    return undefined;
  }

  /**
   * Normalizes category string to standard Romanian categories
   */
  private normalizeCategory(cat?: string, title?: string): string {
    const c = (cat || '').toLowerCase();
    const t = (title || '').toLowerCase();

    if (c.includes('sport') || c.includes('fotbal') || c.includes('tenis') || t.includes('superliga') || t.includes('champions league') || t.includes('fotbal club') || t.includes('liga')) return 'Sport';
    if (c.includes('stiri') || c.includes('știri') || c.includes('news') || t.includes('jurnal') || t.includes('observator') || t.includes('telejurnal') || t.includes('stirile') || t.includes('stiri')) return 'Știri';
    if (c.includes('film') || c.includes('movie') || c.includes('cinema') || c.includes('comedie') || c.includes('drama') || c.includes('actiune') || c.includes('thriller')) return 'Filme';
    if (c.includes('serial') || c.includes('series')) return 'Seriale';
    if (c.includes('documentar') || c.includes('doc')) return 'Documentare';
    if (c.includes('animat') || c.includes('copii') || c.includes('kids') || c.includes('desene')) return 'Copii';
    if (c.includes('divertisment') || c.includes('show') || c.includes('reality') || c.includes('concurs')) return 'Divertisment';
    if (c.includes('muzic') || c.includes('music')) return 'Muzică';
    if (c.includes('religie')) return 'Religie';

    return cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Generalist';
  }

  /**
   * Downloads XML or GZ from URL
   */
  private fetchFeedBuffer(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Programetv.online Real-EPG Service)',
          'Accept-Encoding': 'gzip, deflate',
        },
        timeout: 45000
      }, res => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return this.fetchFeedBuffer(res.headers.location).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }

        const isGzip = url.endsWith('.gz') || res.headers['content-encoding'] === 'gzip';
        let stream: any = res;
        if (isGzip) {
          const gunzip = zlib.createGunzip();
          stream = res.pipe(gunzip);
        }

        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (err: any) => reject(err));
      });

      req.on('error', (err: any) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout fetching EPG feed'));
      });
    });
  }

  /**
   * Main synchronization routine
   */
  public async syncEPG(force = false): Promise<{ success: boolean; message: string; count: number }> {
    if (this.isSyncing) {
      return { success: false, message: 'O sincronizare EPG este deja în curs...', count: this.allPrograms.length };
    }

    this.isSyncing = true;
    this.status.syncStatus = 'syncing';
    this.status.lastError = null;
    console.log('[EPG Service] Starting XMLTV EPG synchronization...');

    let xmlText = '';
    let usedUrl = this.primaryUrl;

    try {
      try {
        console.log('[EPG Service] Trying primary source:', this.primaryUrl);
        const buf = await this.fetchFeedBuffer(this.primaryUrl);
        xmlText = buf.toString('utf8');
        this.status.sources[0].status = 'Active (200 OK)';
        usedUrl = this.primaryUrl;
      } catch (primaryErr: any) {
        console.warn('[EPG Service] Primary source failed, falling back to:', this.fallbackUrl, primaryErr.message);
        this.status.sources[0].status = `Failed: ${primaryErr.message}`;
        this.status.sources[1].status = 'Attempting...';
        const buf = await this.fetchFeedBuffer(this.fallbackUrl);
        xmlText = buf.toString('utf8');
        this.status.sources[1].status = 'Active (200 OK)';
        usedUrl = this.fallbackUrl;
      }

      this.status.activeSourceUsed = usedUrl;
      console.log(`[EPG Service] Feed downloaded successfully (${(xmlText.length / 1024 / 1024).toFixed(2)} MB). Parsing XMLTV structure...`);

      // 1. Parse Channels
      const providerChannelsMap = new Map<string, { id: string; name: string; icon?: string }>();
      const chanRegex = /<channel\s+id="([^"]+)">([\s\S]*?)<\/channel>/g;
      let chanMatch;
      while ((chanMatch = chanRegex.exec(xmlText)) !== null) {
        const id = chanMatch[1];
        const body = chanMatch[2];
        const nameMatch = body.match(/<display-name[^>]*>([\s\S]*?)<\/display-name>/);
        const iconMatch = body.match(/<icon\s+src="([^"]+)"/);
        const name = nameMatch ? nameMatch[1].trim() : id;
        providerChannelsMap.set(id, {
          id,
          name,
          icon: iconMatch ? iconMatch[1] : undefined
        });
      }
      this.providerChannels = providerChannelsMap;

      // 2. Parse Programmes
      const parsedProgramsByProvider: Map<string, EPGProgram[]> = new Map();
      const progRegex = /<programme\s+([^>]+)>([\s\S]*?)<\/programme>/g;
      let progMatch;
      let totalParsed = 0;
      let totalWithImage = 0;

      while ((progMatch = progRegex.exec(xmlText)) !== null) {
        const attrs = progMatch[1];
        const body = progMatch[2];

        const chMatch = attrs.match(/channel="([^"]+)"/);
        const startMatch = attrs.match(/start="([^"]+)"/);
        const stopMatch = attrs.match(/stop="([^"]+)"/);

        if (!chMatch || !startMatch || !stopMatch) continue;

        const providerChannelId = chMatch[1];
        const startRaw = startMatch[1];
        const stopRaw = stopMatch[1];

        const titleMatch = body.match(/<title[^>]*>([\s\S]*?)<\/title>/);
        if (!titleMatch) continue;
        const rawTitle = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();

        const startParsed = this.parseXmltvTime(startRaw);
        const stopParsed = this.parseXmltvTime(stopRaw);

        const descMatch = body.match(/<desc[^>]*>([\s\S]*?)<\/desc>/);
        const catMatch = body.match(/<category[^>]*>([\s\S]*?)<\/category>/);
        const iconMatch = body.match(/<icon\s+src="([^"]+)"/);
        const ratingMatch = body.match(/<rating[^>]*>[\s\S]*?<value>([\s\S]*?)<\/value>/);

        const rawCat = catMatch ? catMatch[1].trim() : '';
        const normalizedCat = this.normalizeCategory(rawCat, rawTitle);
        const iconSrc = iconMatch ? iconMatch[1] : undefined;
        const finalImage = this.resolveShowArtwork(rawTitle, normalizedCat, iconSrc);

        const durationMinutes = Math.max(5, Math.round((new Date(stopParsed.iso).getTime() - new Date(startParsed.iso).getTime()) / 60000));

        const channelInfo = providerChannelsMap.get(providerChannelId);
        const channelName = channelInfo ? channelInfo.name : providerChannelId;

        const programObj: EPGProgram = {
          id: `${providerChannelId}-${startParsed.date}-${startParsed.time.replace(':', '')}`,
          channelId: '', // populated in mapping step
          channelName,
          title: rawTitle,
          description: descMatch ? descMatch[1].replace(/&amp;/g, '&').trim() : '',
          startTime: startParsed.iso,
          endTime: stopParsed.iso,
          startFormatted: startParsed.time,
          endFormatted: stopParsed.time,
          date: startParsed.date,
          durationMinutes,
          category: normalizedCat,
          genre: rawCat || undefined,
          image: finalImage,
          icon: iconSrc,
          rating: ratingMatch ? ratingMatch[1].trim() : undefined,
          providerChannelId,
          source: usedUrl
        };

        if (!parsedProgramsByProvider.has(providerChannelId)) {
          parsedProgramsByProvider.set(providerChannelId, []);
        }
        parsedProgramsByProvider.get(providerChannelId)!.push(programObj);
        totalParsed++;
        if (finalImage) totalWithImage++;
      }

      console.log(`[EPG Service] Successfully parsed ${totalParsed} programmes across ${providerChannelsMap.size} provider channels.`);

      // 3. Map to internal channel IDs
      this.programsByChannel.clear();
      const allList: EPGProgram[] = [];
      let mappedChannelsCount = 0;

      for (const [internalId, providerIds] of Object.entries(this.customMappings)) {
        let matched = false;
        for (const provId of providerIds) {
          const progs = parsedProgramsByProvider.get(provId);
          if (progs && progs.length > 0) {
            const mappedProgs = progs.map(p => ({
              ...p,
              channelId: internalId
            })).sort((a, b) => a.startTime.localeCompare(b.startTime));

            this.programsByChannel.set(internalId, mappedProgs);
            allList.push(...mappedProgs);
            matched = true;
            mappedChannelsCount++;
            break; // take highest priority match
          }
        }
      }

      this.allPrograms = allList;
      this.status.lastSyncTime = new Date().toISOString();
      this.status.syncStatus = 'success';
      this.status.totalProgrammes = this.allPrograms.length;
      this.status.totalChannelsInFeed = providerChannelsMap.size;
      this.status.mappedChannelsCount = mappedChannelsCount;
      this.status.imageCoveragePercent = totalParsed > 0 ? Math.round((totalWithImage / totalParsed) * 100) : 0;

      // 4. Save to persistent cache file
      this.saveToCache();

      return {
        success: true,
        message: `Sincronizare EPG reușită: ${this.allPrograms.length} emisiuni reale mapate pe ${mappedChannelsCount} canale TV.`,
        count: this.allPrograms.length
      };

    } catch (err: any) {
      console.error('[EPG Service] Synchronization error:', err);
      this.status.syncStatus = 'error';
      this.status.lastError = err.message || 'Eroare necunoscută la sincronizare';
      return { success: false, message: `Eroare sincronizare EPG: ${err.message}`, count: this.allPrograms.length };
    } finally {
      this.isSyncing = false;
    }
  }

  private saveToCache() {
    try {
      this.ensureCacheDir();
      const cacheData = {
        savedAt: new Date().toISOString(),
        status: this.status,
        customMappings: this.customMappings,
        customArtworkOverrides: this.customArtworkOverrides,
        programsByChannel: Array.from(this.programsByChannel.entries()),
        providerChannels: Array.from(this.providerChannels.entries())
      };
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(cacheData), 'utf8');
      console.log(`[EPG Service] Cache saved to ${this.cacheFilePath}`);
    } catch (e) {
      console.warn('[EPG Service] Failed to save EPG cache to disk:', e);
    }
  }

  private loadFromCache(): boolean {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, 'utf8');
        const data = JSON.parse(raw);
        if (data && data.programsByChannel) {
          this.programsByChannel = new Map(data.programsByChannel);
          this.providerChannels = new Map(data.providerChannels || []);
          this.customMappings = data.customMappings || this.customMappings;
          this.customArtworkOverrides = data.customArtworkOverrides || {};
          this.status = { ...this.status, ...(data.status || {}) };

          const list: EPGProgram[] = [];
          for (const [_, progs] of this.programsByChannel.entries()) {
            list.push(...progs);
          }
          this.allPrograms = list;
          console.log(`[EPG Service] Loaded ${this.allPrograms.length} programmes from disk cache (saved at ${data.savedAt}).`);
          return true;
        }
      }
    } catch (e) {
      console.warn('[EPG Service] Failed to load EPG from disk cache:', e);
    }
    return false;
  }

  private reindexPrograms() {
    this.saveToCache();
  }

  /**
   * Calculates live "ACUM" and "URMEAZĂ" program for a channel or all channels
   */
  public getLiveChannels(channelIds?: string[]): ChannelLiveEPG[] {
    const now = new Date();
    const nowTime = now.getTime();
    const bucurestiTimeStr = now.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest' });
    const [bH, bM] = bucurestiTimeStr.split(':').map(Number);
    const currentMinsOfDay = bH * 60 + bM;

    const targetIds = channelIds && channelIds.length > 0 ? channelIds : Array.from(this.programsByChannel.keys());
    const result: ChannelLiveEPG[] = [];

    for (const chId of targetIds) {
      const progs = this.programsByChannel.get(chId) || [];
      if (progs.length === 0) continue;

      let current: EPGProgram | null = null;
      let next: EPGProgram | null = null;

      // 1. Try exact timestamp match
      for (let i = 0; i < progs.length; i++) {
        const p = progs[i];
        const pStart = new Date(p.startTime).getTime();
        const pEnd = new Date(p.endTime).getTime();

        if (nowTime >= pStart && nowTime < pEnd) {
          current = p;
          next = progs[i + 1] || null;
          break;
        } else if (nowTime < pStart) {
          if (!next) next = p;
        }
      }

      // 2. If no exact ISO date match, match by time-of-day within available daily schedule
      if (!current && progs.length > 0) {
        for (let i = 0; i < progs.length; i++) {
          const p = progs[i];
          const [sH, sM] = (p.startFormatted || '00:00').split(':').map(Number);
          const [eH, eM] = (p.endFormatted || '00:00').split(':').map(Number);
          const pStartMins = sH * 60 + sM;
          let pEndMins = eH * 60 + eM;
          if (pEndMins <= pStartMins) pEndMins += 1440; // overnight show

          let curCheck = currentMinsOfDay;
          if (curCheck < pStartMins && pStartMins >= 1200) curCheck += 1440;

          if (curCheck >= pStartMins && curCheck < pEndMins) {
            current = p;
            next = progs[i + 1] || progs[0];
            break;
          }
        }
      }

      // 3. If still no current, pick first show or next upcoming show
      if (!current && progs.length > 0) {
        current = progs[0];
        next = progs[1] || null;
      }

      let currentFormatted = null;
      if (current) {
        const [sH, sM] = (current.startFormatted || '00:00').split(':').map(Number);
        const [eH, eM] = (current.endFormatted || '00:00').split(':').map(Number);
        const pStartMins = sH * 60 + sM;
        let pEndMins = eH * 60 + eM;
        if (pEndMins <= pStartMins) pEndMins += 1440;

        let curCheck = currentMinsOfDay;
        if (curCheck < pStartMins && pStartMins >= 1200) curCheck += 1440;

        const totalDuration = Math.max(1, pEndMins - pStartMins);
        const elapsed = Math.max(0, curCheck - pStartMins);
        const progressPercent = Math.min(100, Math.max(5, Math.round((elapsed / totalDuration) * 100)));
        const remainingMinutes = Math.max(1, pEndMins - curCheck);

        currentFormatted = {
          id: current.id,
          title: current.title,
          description: current.description,
          startTime: current.startTime,
          endTime: current.endTime,
          startFormatted: current.startFormatted,
          endFormatted: current.endFormatted,
          progressPercent,
          remainingMinutes,
          category: current.category,
          image: current.image
        };
      }

      let nextFormatted = null;
      if (next) {
        const [sH, sM] = (next.startFormatted || '00:00').split(':').map(Number);
        const nextStartMins = sH * 60 + sM;
        let diff = nextStartMins - currentMinsOfDay;
        if (diff < 0) diff += 1440;

        nextFormatted = {
          id: next.id,
          title: next.title,
          description: next.description,
          startTime: next.startTime,
          endTime: next.endTime,
          startFormatted: next.startFormatted,
          endFormatted: next.endFormatted,
          minutesUntilStart: diff,
          category: next.category,
          image: next.image
        };
      }

      result.push({
        channelId: chId,
        channelName: current?.channelName || chId,
        currentProgram: currentFormatted,
        nextProgram: nextFormatted
      });
    }

    return result;
  }

  /**
   * Get full day schedule for a channel
   */
  public getChannelSchedule(channelId: string, dateStr?: string): EPGProgram[] {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const progs = this.programsByChannel.get(channelId.toLowerCase()) || [];
    
    if (progs.length === 0) return [];

    const exactMatch = progs.filter(p => p.date === targetDate);
    if (exactMatch.length > 0) return exactMatch;

    // Return the latest available schedule for that channel
    return progs;
  }

  /**
   * Filter schedule across channels
   */
  public querySchedule(options: {
    date?: string;
    channelId?: string;
    category?: string;
    search?: string;
    limit?: number;
  }): EPGProgram[] {
    const targetDate = options.date;
    let list = this.allPrograms;

    if (options.channelId && options.channelId !== 'All' && options.channelId !== 'all') {
      list = this.programsByChannel.get(options.channelId.toLowerCase()) || [];
    }

    if (targetDate) {
      const dateFiltered = list.filter(p => p.date === targetDate);
      if (dateFiltered.length > 0) {
        list = dateFiltered;
      }
    }

    if (options.category && options.category !== 'All' && options.category !== 'all') {
      const catLower = options.category.toLowerCase();
      list = list.filter(p => p.category.toLowerCase() === catLower);
    }

    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.channelName.toLowerCase().includes(q)
      );
    }

    const limit = options.limit || 500;
    return list.slice(0, limit);
  }

  /**
   * Search across all programs
   */
  public searchPrograms(query: string, limit = 50): EPGProgram[] {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return this.allPrograms
      .filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .slice(0, limit);
  }

  /**
   * Get upcoming highlights
   */
  public getUpcomingShows(limit = 12): Array<EPGProgram & { minutesUntilStart: number }> {
    const nowTime = Date.now();
    const future = this.allPrograms.filter(p => {
      const start = new Date(p.startTime).getTime();
      return start > nowTime && start <= nowTime + 24 * 60 * 60 * 1000;
    });

    return future
      .map(p => ({
        ...p,
        minutesUntilStart: Math.max(1, Math.round((new Date(p.startTime).getTime() - nowTime) / 60000))
      }))
      .sort((a, b) => a.minutesUntilStart - b.minutesUntilStart)
      .slice(0, limit);
  }
}

// Global Singleton Instance
export const epgService = new EPGService();
