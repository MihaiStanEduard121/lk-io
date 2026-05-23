import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const logos: Record<string, string> = {
  'PROTV HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Pro_TV_logo.svg/512px-Pro_TV_logo.svg.png',
  'A1 HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Antena_1_logo.svg/512px-Antena_1_logo.svg.png',
  'TVR1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/TVR_1_logo.svg/512px-TVR_1_logo.svg.png',
  'TVR2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/TVR_2_logo_2022.svg/512px-TVR_2_logo_2022.svg.png',
  'CANAL D': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Kanal_D_logo.svg/512px-Kanal_D_logo.svg.png',
  'CANAL D2': 'https://upload.wikimedia.org/wikipedia/ro/thumb/7/77/Kanal_D2_logo.png/512px-Kanal_D2_logo.png',
  'PRIMA TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Prima_TV_logo_%282021%29.svg/512px-Prima_TV_logo_%282021%29.svg.png',
  'NATIONAL TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/National_TV_logo.svg/512px-National_TV_logo.svg.png',
  'TVR3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/TVR_3_logo.svg/512px-TVR_3_logo.svg.png',
  'PROCINEMA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pro_Cinema_logo_2017.png/512px-Pro_Cinema_logo_2017.png',
  'ACASA TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Acasa_TV_logo.svg/512px-Acasa_TV_logo.svg.png',
  'ACASA GOLD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Acasa_Gold_logo.svg/512px-Acasa_Gold_logo.svg.png',
  'ANTENA STARS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Antena_Stars_logo.svg/512px-Antena_Stars_logo.svg.png',
  'A3 CNN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Antena_3_CNN_logo.svg/512px-Antena_3_CNN_logo.svg.png',
  'ROMANIA TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Romania_TV_logo.svg/512px-Romania_TV_logo.svg.png',
  'REALITATEA TV': 'https://upload.wikimedia.org/wikipedia/ro/thumb/1/14/Realitatea_Plus_logo_2019.png/512px-Realitatea_Plus_logo_2019.png',
  'PRIMA NEWS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Prima_News_logo.png/512px-Prima_News_logo.png',
  'B1 TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/B1_TV_logo.svg/512px-B1_TV_logo.svg.png',
  'EURONEWS ROMANIA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Euronews_Romania_logo.svg/512px-Euronews_Romania_logo.svg.png',
  'NEWS24': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Digi_24_logo.svg/512px-Digi_24_logo.svg.png',
  'CNN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/512px-CNN.svg.png',
  'BBC NEWS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2019.svg/512px-BBC_News_2019.svg.png',
  'SUPERSPORT 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Digi_Sport_1_logo.svg/512px-Digi_Sport_1_logo.svg.png',
  'SUPERSPORT 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Digi_Sport_2_logo.svg/200px-Digi_Sport_2_logo.svg.png',
  'SUPERSPORT 3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Digi_Sport_3_logo.svg/200px-Digi_Sport_3_logo.svg.png',
  'SUPERSPORT 4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Digi_Sport_4_logo.svg/200px-Digi_Sport_4_logo.svg.png',
  'PRO ARENA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pro_Arena_logo.svg/512px-Pro_Arena_logo.svg.png',
  'TVR SPORT': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/TVR_Sport_logo.svg/512px-TVR_Sport_logo.svg.png',
  'PRIMA SPORT 1': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Prima_Sport_1_logo.svg/512px-Prima_Sport_1_logo.svg.png',
  'PRIMA SPORT 2': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e2/Prima_Sport_2_logo.svg/512px-Prima_Sport_2_logo.svg.png',
  'PRIMA SPORT 3': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Prima_Sport_3_logo.svg/512px-Prima_Sport_3_logo.svg.png',
  'PRIMA SPORT 4': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Prima_Sport_4_logo.svg/512px-Prima_Sport_4_logo.svg.png',
  'EUROSPORT 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Eurosport_1_logo_2015.svg/512px-Eurosport_1_logo_2015.svg.png',
  'EUROSPORT 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Eurosport_2_logo_2015.svg/512px-Eurosport_2_logo_2015.svg.png',
  'HBO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/512px-HBO_logo.svg.png',
  'HBO 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/HBO_2_logo.svg/512px-HBO_2_logo.svg.png',
  'HBO 3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/HBO_3_logo.svg/512px-HBO_3_logo.svg.png',
  'TV1000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/TV1000_2003.svg/512px-TV1000_2003.svg.png',
  'FILM NOW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Film_Now_logo.svg/512px-Film_Now_logo.svg.png',
  'AMC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/AMC_logo.svg/512px-AMC_logo.svg.png',
  'AXN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/AXN_logo_2015.svg/512px-AXN_logo_2015.svg.png',
  'CINEMAX': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Cinemax_logo_2016.svg/512px-Cinemax_logo_2016.svg.png',
  'COMEDY CENTRAL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Comedy_Central_2018_logo.svg/512px-Comedy_Central_2018_logo.svg.png',
  'MINIMAX': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Minimax_logo.svg/512px-Minimax_logo.svg.png',
  'CARTOON NETWORK': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/512px-Cartoon_Network_2010_logo.svg.png',
  'DISNEY CHANNEL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Disney_Channel_logo_2014.svg/512px-Disney_Channel_logo_2014.svg.png',
  'NICKELODEON': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Nickelodeon_2009_logo.svg/512px-Nickelodeon_2009_logo.svg.png',
  'DISCOVERY CHANNEL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Discovery_Channel_logo.svg/512px-Discovery_Channel_logo.svg.png',
  'HISTORY CHANNEL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/History_Logo.svg/512px-History_Logo.svg.png',
  'NATIONAL GEOGRAPHIC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/National_Geographic_logo.svg/512px-National_Geographic_logo.svg.png',
  'TLC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/TLC_logo.svg/512px-TLC_logo.svg.png',
  'KISS TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Kiss_TV_logo.svg/512px-Kiss_TV_logo.svg.png',
  'ZU TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/ZU_TV_logo.png/512px-ZU_TV_logo.png',
  'DIVA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Diva_Universal_logo.svg/512px-Diva_Universal_logo.svg.png'
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
  console.log(`✅ Done. Updated ${updated} channels with real logos.`);
  process.exit(0);
}

update().catch(console.error);
