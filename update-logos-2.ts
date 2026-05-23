import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const logos: Record<string, string> = {
  'BBC EARTH': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/BBC_Earth_logo.svg/512px-BBC_Earth_logo.svg.png',
  'TVR INTERNATIONAL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Tvr_international_logo.svg/512px-Tvr_international_logo.svg.png',
  'UTV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/U_TV_logo.svg/512px-U_TV_logo.svg.png',
  'ID INVESTIGATION': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Investigation_Discovery_logo.svg/512px-Investigation_Discovery_logo.svg.png',
  'FILM CAFE': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/FilmCafe_logo.png/512px-FilmCafe_logo.png',
  'ETNO TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Etno_TV_logo.svg/512px-Etno_TV_logo.svg.png',
  'JIM JAM': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/JimJam_logo.svg/512px-JimJam_logo.svg.png',
  'TARAF TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Taraf_TV_logo_%282015%29.png/512px-Taraf_TV_logo_%282015%29.png',
  'FAVORIT TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Favorit_TV_logo_%282015%29.png/512px-Favorit_TV_logo_%282015%29.png',
  'NICK JR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Nick_Jr_logo.svg/512px-Nick_Jr_logo.svg.png',
  'NICKTOONS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Nicktoons_logo_2016.svg/512px-Nicktoons_logo_2016.svg.png',
  'TEEN NICK': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/TeenNick_2019_Logo.svg/512px-TeenNick_2019_Logo.svg.png',
  'DISNEY JR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Disney_Junior_Logo_%282020%29.svg/512px-Disney_Junior_Logo_%282020%29.svg.png',
  'NAT GEO WILD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Nat_Geo_Wild_logo.svg/512px-Nat_Geo_Wild_logo.svg.png',
  'VIASAT HISTORY': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Viasat_History_2020_logo.svg/512px-Viasat_History_2020_logo.svg.png',
  'VIASAT NATURE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Viasat_Nature_2020_logo.svg/512px-Viasat_Nature_2020_logo.svg.png',
  'VIASAT EXPLORER': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Viasat_Explore_2020_logo.svg/512px-Viasat_Explore_2020_logo.svg.png',
  'EPIC DRAMA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Epic_Drama_logo.png/512px-Epic_Drama_logo.png',
  'CRIME & INVESTIGATION': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Crime_%26_Investigation_Network_logo.svg/512px-Crime_%26_Investigation_Network_logo.svg.png',
  'CARTOONITO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Cartoonito_2021_Logo.svg/512px-Cartoonito_2021_Logo.svg.png',
  'WARNER TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Warner_TV_logo.svg/512px-Warner_TV_logo.svg.png',
  'HGTV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/HGTV_logo.svg/512px-HGTV_logo.svg.png',
  'PAPRIKA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/TV_Paprika_logo.svg/512px-TV_Paprika_logo.svg.png',
  'MUSIC CHANNEL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Music_Channel_Romania.svg/512px-Music_Channel_Romania.svg.png',
  'AXN SPIN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/AXN_Spin_logo_2016.svg/512px-AXN_Spin_logo_2016.svg.png',
  'AXN BLACK': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/AXN_Black_logo_2016.svg/512px-AXN_Black_logo_2016.svg.png',
  'AXN WHITE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/AXN_White_logo_2016.svg/512px-AXN_White_logo_2016.svg.png',
  'CINEMAX 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Cinemax_2_logo_2016.svg/512px-Cinemax_2_logo_2016.svg.png'
};

const getLogo = (title: string) => {
  return logos[title] || null;
};

async function update() {
  const querySnapshot = await getDocs(collection(db, 'programs'));
  let updated = 0;
  for (const item of querySnapshot.docs) {
    const data = item.data();
    const logoUrl = getLogo(data.title);
    if (logoUrl) {
      await updateDoc(doc(db, 'programs', item.id), {
        thumbnail: logoUrl,
        banner: logoUrl
      });
      updated++;
      if (updated % 10 === 0) console.log(`Updated ${updated} channels...`);
    }
  }
  console.log(`✅ Done. Updated \${updated} additional channels with real logos.`);
  process.exit(0);
}

update().catch(console.error);
