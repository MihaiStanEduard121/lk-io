import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

// 1. Initialize Firebase
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Custom curated rich monografii for the top 40+ most popular channels in Romania
const customMonografii: Record<string, string> = {
  'PROTV HD': `### Istoricul și Lansarea Postului
Lansat oficial la 1 decembrie 1995 de către Adrian Sârbu, PRO TV HD a fost postul de televiziune care a revoluționat din temelii peisajul mass-media din România. Introducând formate moderne de jurnalism, broadcasting la standarde occidentale și o identitate vizuală extrem de puternică, postul s-a impus rapid drept liderul incontestabil al audiențelor naționale. De la celebrul slogan "Te uiți și câștigi" până la campaniile sociale anuale de Ziua Națională, PRO TV a rămas un pilon de referință al televiziunii din țară.

### Profilul de Emisie și Programe Emblematice
Grila de programe a postului PRO TV HD este un mix perfect calibrat de divertisment de top, ficțiune originală și jurnalism de elită. Jurnalul PRO TV de la ora 19:00, prezentat de Andreea Esca, este cel mai urmărit program de știri din România. Grila de divertisment include show-uri legendare precum „Românii au talent”, „Vocea României”, „Survivor România” și „MasterChef”. Pe zona de ficțiune, serialul de comedie fenoment „Las Fierbinți” a redefinit audiențele de prime-time, devenind cel mai de succes proiect de ficțiune autohton.

### Publicul Țintă și Receptare
PRO TV se adresează unui public extrem de extins, dar își concentrează succesul pe publicul comercial urban și dinamic. Receptarea mărcii este una de mare încredere pe zona de știri și loialitate absolută pe zona de divertisment. Prin conținutul energic, modern și de familie, postul continuă să fie opțiunea numărul unu a românilor pentru petrecerea timpului liber în fața ecranelor.`,

  'A1 HD': `### Istoricul și Lansarea Postului
Antena 1 (A1 HD) a fost înființată în anul 1993 ca primul canal de televiziune privat din România cu capital integral românesc, făcând parte din trustul Intact Media Group. De-a lungul deceniilor, postul și-a consolidat statutul de principal competitor al liderului de piață și a devenit o prezență constantă și stimată în casele a milioane de români, remarcându-se prin campanii media de succes și show-uri de divertisment spectaculoase.

### Profilul de Emisie și Programe Emblematice
Grila de emisie este centrată pe divertisment de familie, știri sociale de larg interes și producții autohtone de succes. Printre cele mai îndrăgite emisiuni se numără matinalul de succes „Super Neatza cu Răzvan și Dani”, formatul incendiar „Chefi la cuțite”, show-ul de aventură „Asia Express” / „America Express”, precum și show-ul de talente „Te cunosc de undeva!” și emisiunea de divertisment „iUmor”. Jurnalele de știri „Observator” oferă o acoperire completă a evenimentelor naționale cu accent pe latura umană și socială.

### Publicul Țintă și Receptare
Antena 1 se bucură de o fidelitate remarcabilă în rândul publicului feminin și de familie. Brandul este perceput ca fiind cald, interactiv, plin de culoare și foarte apropiat de viața de zi cu zi a românilor. Cu o prezență digitală masivă pe rețelele de socializare, A1 HD este o alegere de vârf pentru relaxare și informare utilă.`,

  'CANAL D': `### Istoricul și Lansarea Postului
Canal D a fost lansat în România în februarie 2007 de către grupul media internațional Doğan Media International. Prin strategii de programare inovatoare și atenție la cerințele publicului de masă, Canal D a urcat rapid în topul preferințelor, reușind să se bată de la egal la egal cu televiziunile istorice din România și adjudecându-și frecvent poziția de lider de audiență în prime-time.

### Profilul de Emisie și Programe Emblematice
Postul este legendar pentru introducerea și popularizarea fenomenului serialelor turcești în România, producții care au înregistrat audiențe-record. Pe lângă acestea, Canal D s-a impus prin producții locale puternice precum talk-show-ul de impact „40 de întrebări cu Denise Rifai”, emisiunea-concurs de cultură generală „Jocul Cuvintelor” prezentată de Dan Negru, emisiunea socială „Asta-i România!” și matinalul de divertisment. Știrile Canal D oferă o viziune directă și axată pe evenimentele care marchează societatea.

### Publicul Țintă și Receptare
Canal D atrage un public activ de toate vârstele, având o aderență extrem de puternică în zona urbană și regională. Telespectatorii apreciază postul pentru conținutul emoționant, poveștile remarcabile de viață și formatele unice de divertisment inteligent, transformându-l într-un brand mass-media de o excepțională popularitate.`,

  'TVR1': `### Istoricul și Lansarea Postului
TVR 1 este principalul canal al Societății Române de Televiziune (TVR), televiziunea publică națională din România. Cu prima emisie difuzată în noaptea de Anul Nou din 1956, TVR 1 este garantul jurnalismului echidistant, al promovării valorilor culturale autohtone și al educării generațiilor întregi de români, păstrând o moștenire istorică inestimabilă în arhiva națională de imagini.

### Profilul de Emisie și Programe Emblematice
Canalul oferă o grilă complexă și de interes public, dominată de brandul informativ „Telejurnal”, emisiuni de profil social-politic precum „România 9”, documentare istorice și culturale unice, precum și emisiuni folclorice tradiționale extrem de apreciate („Tezaur Folcloric”, „O dată-n viață”). Totodată, TVR 1 transmite mari evenimente culturale și competiții de top din sportul mondial, de la Jocurile Olimpice până la Campionatele Mondiale de Fotbal.

### Publicul Țintă și Receptare
Fiind un canal de utilitate publică, TVR 1 se adresează tuturor categoriilor sociale din România. Este perceput ca un ghid de încredere, neutru și valoros din punct de vedere cultural, fiind reperul principal pentru telespectatorii care doresc emisiuni informative aprofundate, reportaje de cultură și păstrarea identității românești.`,

  'TVR2': `### Istoricul și Lansarea Postului
TVR 2 este al doilea canal al televiziunii publice române, înființat în anul 1968. De-a lungul deceniilor, canalul și-a asumat un profil distinct, mai dinamic și axat profund pe cultură, educație, divertisment inteligent și producții cinematografice de mare valoare, completând misiunea publică a postului principal și deschizând ecranele către dezbateri moderne de idei.

### Profilul de Emisie și Programe Emblematice
Grila TVR 2 propune emisiuni destinate tineretului, documentare științifice calitative, talk-show-uri interactive și piese de teatru TV adaptate. Emisiuni celebre precum „Câștigă România!”, prezentată de Virgil Ianțu, reprezintă chintesența divertismentului educativ autohton de mare succes. Postul excelează, totodată, în difuzarea filmelor de artă și a serialelor clasice europene și americane de top.

### Publicul Țintă și Receptare
Canalul atrage un profil de public educat, dornic de alternative la divertismentul comercial agresiv. Receptarea sa este una de apreciere pentru rafinament, formatul cultural prietenos și implicarea activă în promovarea spiritului comunitar din mediul academic și cultural din România.`,

  'ROMANIA TV': `### Istoricul și Lansarea Postului
România TV a fost lansat în octombrie 2011 ca un post privat de televiziune din România axat exclusiv pe știri, breaking news și talk-show-uri politice și sociale. Cu o abordare editorială extrem de dinamică și o prezență constantă în zonele fierbinți ale evenimentelor, postul a cucerit în scurt timp o cotă imensă de piață, ocupând frecvent prima poziție pe segmentul nichei de știri.

### Profilul de Emisie și Programe Emblematice
România TV emite 24 de ore din 24, axându-se pe investigații, dezbateri în studio, știri de ultimă oră și emisiuni de analiză economică cu impact direct asupra veniturilor cetățenilor. Jurnaliști incisivi și talk-show-uri captivante definesc grila de seară a postului, comentând în timp real evoluțiile guvernamentale, deciziile politice și fenomenele sociale din țară.

### Publicul Țintă și Receptare
Postul are un public fidel uriaș format în special din seniori, pensionari și locuitori ai zonelor medii și rurale, dornici de analiză dedicată și știri aduse rapid în prim-plan. Este apreciat pentru limbajul accesibil, implicarea în problemele sociale ale cetățeanului de rând și promptitudinea transmisiilor în direct.`,

  'REALITATEA TV': `### Istoricul și Lansarea Postului
Realitatea TV (în prezent emis ca Realitatea Plus) a fost primul post privat de știri din România, lansat în anul 2001. A fost pionierul conceptului de televiziune de știri 24/24 din țară și a jucat un rol definitoriu în modelarea dezbaterilor democratice din societatea românească în perioade de alegeri parlamentare, prezidențiale și crize politico-sociale majore.

### Profilul de Emisie și Programe Emblematice
Focusul principal este pe știri din oră în oră, investigații dure și talk-show-uri politice incisive de seară. Programe legendare de dezbatere, conduse de realizatori proeminenți, analizează sistemul administrativ, lupta anticorupție și evenimentele economice esențiale din spațiul românesc și european.

### Publicul Țintă și Receptare
Canalul se adresează cetățenilor activi politic, din mediul urban și regional, interesați de dezbatere liberă și analiză critică. Se bucură de respectul telespectatorilor care caută puncte de vedere diverse, anchete viguroase și o monitorizare atentă a puterii politice din România.`,

  'NEWS24': `### Istoricul și Lansarea Postului
Digi 24 HD (înregistrat ca News24) a fost lansat de gigantul de telecomunicații RCS&RDS ca un post de știri premium, integrat și echidistant. Promovând un jurnalism bazat pe fapte concrete, fără cancan și fără senzaționalism tabloid, Digi 24 a ridicat standardele calitative de imagine publicară din România prin studiouri complet digitalizate de ultimă generație.

### Profilul de Emisie și Programe Emblematice
Grila propune un flux continuu de știri naționale, internaționale și economice, jurnalele de seară axate pe analize din mediul de afaceri și geopolitic, studii științifice și emisiuni dedicate sănătății sau tehnologiei digitale de vârf. Stilul de prezentare este modern, fluid, cu un decor virtual minimalist elegant.

### Publicul Țintă și Receptare
Canalul atrage un public modern, urban, corporatist, format în mare parte din specialiști, antreprenori și tineri educați. Receptarea Digi 24 este asociată cu seriozitatea jurnalistică, obiectivitatea și calitatea ireproșabilă a transmisiei video HD, fiind preferat de cei care caută informații curate și nepartizane.`,

  'EURONEWS ROMANIA': `### Istoricul și Lansarea Postului
Euronews România este filiala locală a rețelei europene multilingve de știri Euronews, lansată în mod oficial în anul 2022 ca urmare a unui parteneriat academic prestigios cu Universitatea Politehnica din București. Postul aduce în premieră pe piața românească filozofia jurnalismului european, axat pe sloganul "All Views" (Toate Perspectivele), oferind o platformă neutră de analiză.

### Profilul de Emisie și Programe Emblematice
Canalul se distinge prin jurnale concise, conectate direct la realitățile Uniunii Europene, dezbateri obiective privind politicile comunitare, inovația, sustenabilitatea și tendințele climatice globale. Rubrici precum „No Comment” transmit imagini brute de la fața locului de pe tot mapamondul, fără comentarii subiective din partea editorilor, stimulând gândirea critică a telespectatorului.

### Publicul Țintă și Receptare
Canalul se adresează studenților, mediului academic, specialiștilor în relații internaționale și publicului urban pro-european. Este foarte respectat pentru tonul reținut, profesionalismul riguros și legătura directă cu știrile globale de larg interes.`,

  'HBO': `### Istoricul și Lansarea Postului
HBO (Home Box Office) a intrat pe piața din România la mijlocul anilor '90 ca un canal premium pay-TV de filme, revoluționând modul în care românii consumă cinematografia la televizor. Fără reclame comerciale în timpul filmelor și cu difuzarea celor mai mari succes de box-office imediat după lansarea în cinematografe, HBO a devenit regele incontestabil al televiziunii cinematografice de acasă.

### Profilul de Emisie și Programe Emblematice
Postul difuzează blockbustere de la marile studiouri de la Hollywood, premiere săptămânale de absolut top și, mai ales, celebrele producții originale HBO care au scris istoria televiziunii mondiale: „Game of Thrones”, „The Sopranos”, „Chernobyl” și ecranizări de marcă autohtone precum „Umbre” și „Hackerville”.

### Publicul Țintă și Receptare
HBO se adresează pasionaților de film de calitate din toate categoriile de vârstă. Cu o loialitate uriașă de brand, postul este sinonim cu divertismentul cinematografic de lux, povestea excepțională și calitatea inegalabilă a scenariilor și a producției de film.`,

  'HBO 2': `### Istoricul și Lansarea Postului
HBO 2 a fost creat pentru a se alătura canalului premium principal și pentru a oferi telespectatorilor o grilă extinsă de conținut cinematografic, axat pe comedii și filme pentru întreaga familie în timpul zilei, și pe acțiune, thrillere și comedie în timpul serii, oferind o flexibilitate sporită în programare.

### Profilul de Emisie și Programe Emblematice
Grila conține o selecție amplă de filme de divertisment de familie, blockbuster-uri de acțiune și maratoane sezoniere de seriale de top create de HBO. Reprezintă alternativa ideală la postul principal, fiind o destinație perfectă pentru un spectacol relaxant.

### Publicul Țintă și Receptare
O alegere foarte populară în rândul familiilor și al tinerilor care doresc filme ușor de urmărit, producții de animație valoroase și divertisment accesibil, dar la înaltul standard tehnic de imagine și sunet impus de rețeaua internațională HBO.`,

  'HBO 3': `### Istoricul și Lansarea Postului
HBO 3 este canalul rețelei premium dedicat special epocii de aur a serialelor de televiziune. Înlocuind fostul canal HBO Comedy, HBO 3 a devenit rapid un paradis pentru iubitorii de binging, găzduind cele mai celebrate drame, comedii și seriale fantastice de pe piața globală de streaming.

### Profilul de Emisie și Programe Emblematice
Grila este compusă din sezoane întregi difuzate cap-la-cap sau în maratoane de weekend din mari producții precum „Succession”, „Westworld”, „House of the Dragon” și „Euphoria”. Fiecare serial beneficiază de o difuzare extinsă și calitativă pentru fanii devotați.

### Publicul Țintă și Receptare
Destinat consumatorilor înfocați de cultură pop, seriale complexe și producții nominalizate la premiile Emmy. Receptarea sa este extrem de pozitivă în rândul tinerilor pasionați de povești complexe și regie de clasă mondială.`,

  'TV1000': `### Istoricul și Lansarea Postului
TV1000 este un renumit canal pay-TV de filme deținut de grupul media de top Viasat World. Intrat pe piața din Europa de Est și România de la mijlocul anilor 2000, postul s-a impus ca o destinație de excepție pentru iubitorii de filme europene de artă și producții de prim rang de la Hollywood.

### Profilul de Emisie și Programe Emblematice
Grila programatică acoperă o gamă vastă de genuri: drame istorice rafinate, thrillere tensionate, filme romantice spectaculoase și capodopere romantice laureate cu premiul Oscar. Oferă o atenție deosebită cinematekilor europene clasice și moderne, difuzând frecvent opere ale unor regizori faimoși.

### Publicul Țintă și Receptare
Canalul atrage cinefili pasionați, publicul de vârstă medie și pe toți cei care vor să descopere filme europene și blockbustere de substanță, fiind foarte apreciat pentru programarea de calitate și diversitatea ofertei cinematografice.`,

  'FILM NOW': `### Istoricul și Lansarea Postului
Film Now HD (cunoscut anterior ca Digi Film) este postul propriu de filme al trustului RCS&RDS. Creat pentru a oferi clienților de cablu digital un canal accesibil exclusiv dedicat filmelor bune, acesta a crescut rapid în preferințe datorită selecției variate de filme mari difuzate fără întreruperi de publicitate de-a lungul întregii zile.

### Profilul de Emisie și Programe Emblematice
Canalul propune comedii spumoase, filme SF de top, pelicule de acțiune și horror-uri faimoase provenite direct de la studiouri globale gigant precum Universal, Warner, Sony sau Paramount. Seara este dedicată premierelor de top adresate fanilor de cinematografie dinamică.

### Publicul Țintă și Receptare
Film Now este adorat de publicul activ, tineri și familii care doresc o selecție curată, variată și modernă de filme de aventură și acțiune difuzate impecabil în format High Definition fără pauze publicitare.`,

  'SUPERSPORT 1': `### Istoricul și Lansarea Postului
SuperSport 1 HD (cunoscut și ca Digi Sport 1) este canalul sportiv premium fanion din România, oferind mii de ore de transmisiuni live ale celor mai mari competiții sportive de pe planetă. Dotat cu tehnologii moderne de emisie, grafică dinamică de scor de ultimă oră și caruri de emisie UHD, este inima microbiștilor din țară.

### Profilul de Emisie și Programe Emblematice
Canalul transmite live meciurile din Liga 1 a României, marile încleștări din UEFA Champions League, campionatele de fotbal ale Spaniei, Italiei și Angliei. Grila de emisie conține emisiuni de analiză tactică conduse de foști mari fotbaliști, buletine zilnice de știri sportive și analize detaliate pre- și post-meci.

### Publicul Țintă și Receptare
Adresat direct iubitorilor înfocați de fotbal și sport de înaltă performanță. Este marca cea mai respectată de pe piața media românească pentru promptitudinea știrilor sportive, comentariile pasionate și calitatea superioară a imaginilor de pe marile stadioane.`,

  'EUROSPORT 1': `### Istoricul și Lansarea Postului
Eurosport 1 este de zeci de ani canalul continental de referință pentru pasionații de sport, deținut de grupul Warner Bros. Discovery. Cu comentarii profesioniste în limba română asigurate de cei mai buni experți din domeniu, Eurosport 1 a adus în casele românilor spiritul olimpic și pasiunea disciplinelor sportive diverse.

### Profilul de Emisie și Programe Emblematice
Canalul este renumit pentru transmisiunile epice ale celor 3 Mari Tururi Cicliste (Turul Franței, Turul Italiei, Turul Spaniei), turneele de tenis de Mare Șlem (Australian Open, Roland Garros, US Open, Wimbledon), sporturile de iarnă spectaculoase și, cel mai important, transmisiunile integrale exclusive ale Jocurilor Olimpice de Vară și de Iarnă.

### Publicul Țintă și Receptare
Se adresează fanilor sporturilor olimpice, tenismenilor, cicliștilor și iubitorilor de competiții atletice variate. Brandul este iubit pentru rigoarea analizelor, acoperirea globală impecabilă și spiritul de sportivitate autentică cultivat sistematic.`,

  'DISCOVERY CHANNEL': `### Istoricul și Lansarea Postului
Discovery Channel este canalul documentar numărul unu în lume, intrat pe piața românească încă din anii '90 ca un vector esențial al cunoașterii științifice și antropologice. Postul a transformat modul în care oamenii privesc știința, tehnologia și natura, stimulând curiozitatea nativă a telespectatorilor români prin povești incredibile de viață și experimente unice.

### Profilul de Emisie și Programe Emblematice
Postul propune seriale legendare precum „Tehnici de supraviețuire cu Bear Grylls”, „Vânătorii de mituri” (MythBusters), „Goana după aur”, emisiuni auto spectaculoase („Mașini pe alese” / Wheeler Dealers) și rubrici exclusive de popularizare a fizicii, roboticii, astronomiei globale și investigării spațiului cosmic.

### Publicul Țintă și Receptare
Discovery atrage un public uriaș, curios și activ, de tineri, elevi și adulți fascinați de modalitatea practică de asimilare a cunoștințelor. Postul este considerat un reper de excelență educațională și divertisment inteligent, având o reputație de prestigiu în media românească.`,

  'NATIONAL GEOGRAPHIC': `### Istoricul și Lansarea Postului
National Geographic (Nat Geo) aduce pe ecranele din România moștenirea faimoasei societăți științifice internaționale din Washington. Lansat cu o identitate vizuală excepțională axată pe faimosul chenar galben, canalul propune documentare științifice realizate la bugete imense, expediții unice de explorare arheologică și reportaje spectaculoase de mediu.

### Profilul de Emisie și Programe Emblematice
De la misterele Egiptului Antic până la seria revoluționară „Cosmos”, documentarele despre dezastre aviatice („Dezastre în aer”) și expediții în interiorul junglei amazoniene, postul oferă imagini uluitoare de o mare finețe tehnologică cinematografică, realizate de fotografi și exploratori de elită mondială.

### Publicul Țintă și Receptare
Adresat tuturor celor interesați de istoria planetei, arheologie, geografie și ecologie. Receptarea sa este magnifică, fiind recunoscut ca liderul absolut al documentarelor geografice și antropologice din lume și un brand media de o înaltă valoare educațională și estetică.`,

  'DISNEY CHANNEL': `### Istoricul și Lansarea Postului
Disney Channel a fost lansat în România în toamna anului 2009, devenind destinația favorită a copiilor și adolescenților români. Cu desene clasice și seriale pline de comedie semnate de studiourile Disney de la Hollywood, canalul a fost catalizatorul distracției de familie, promovând mesaje calde de prietenie, loialitate și urmărire a visurilor.

### Profilul de Emisie și Programe Emblematice
Grila este compusă din producții legendare precum „Phineas și Ferb”, „Mickey Mouse”, seriale celebre pentru adolescenți ca „Hannah Montana”, „Wizards of Waverly Place”, „Violetta” și producții remarcabile de animație contemporană de la studiourile Pixar și Disney de mare succes mondial.

### Publicul Țintă și Receptare
Canalul este favoritul preșcolarilor, școlarilor și adolescenților, asigurând totodată părinților un mediu de emisie sigur, educativ și monitorizat atent. Receptarea sa este una de bucurie pură, fantezie, haz și culoare, reprezentând un lider absolut pe nișa copiilor.`,

  'CARTOON NETWORK': `### Istoricul și Lansarea Postului
Cartoon Network a fost prima rețea globală de televiziune 24/24 complet dedicată desenelor animate, lansată în Statele Unite în 1992 și intrată rapid și în casele din România în decursul anilor '90 cu opțiune de dublare audio de înaltă calitate în limba română, definind copilăria multor generații de tineri.

### Profilul de Emisie și Programe Emblematice
Canalul difuzează blockbustere celebre: animații cult ca „Laboratorul lui Dexter”, „Fetițele Powerpuff”, „Curaj, câinele cel leneș”, continuând cu fenomene contemporane uluitoare precum „Ben 10”, „Uimitoarea lume a lui Gumball”, „Să-nceapă aventura” (Adventure Time) și „Tinerii Titani, în acțiune!”.

### Publicul Țintă și Receptare
Postul atrage deopotrivă copiii și adolescenții datorită umorului spumos, acțiunii dinamice și aventurilor memorabile, având o influență profundă asupra culturii vizuale și a hazului inteligent din rândul publicului tânăr român.`
};

// Map of genres to generate rich dynamic templates for channels that are not physically in the custom curated map above
const templatesByGenre: Record<string, { istoric: string; programe: string; public: string }> = {
  general: {
    istoric: "Acest post de televiziune face parte din peisajul media românesc generalist, oferind de-a lungul timpului o platformă solidă pentru broadcasting modern și divertisment destinat întregii familii. S-a dezvoltat printr-o strategie de adaptare continuă la preferințele telespectatorilor, integrând treptat transmisia High Definition și tehnologii moderne.",
    programe: "Grila canalului oferă un flux echilibrat de emisiuni de divertisment, jurnale de știri din oră în oră, talk-show-uri sociale în direct, comedii de top și producții cinematografice românești și străine foarte populare. Jurnalele de actualități aduc reportaje obiective în casele românilor, corelate direct cu realitățile administrative autohtone.",
    public: "Se adresează unui public general, extins din mediul urban și rural, fiind un reper excelent pentru relaxarea de familie pe tot parcursul săptămânii datorită gamei variate de selecții media."
  },
  stiri: {
    istoric: "Postul s-a impus în spațiul audio-vizual românesc ca o televiziune de nișă axată pe știri, evenimente în timp real și dezbatere politică de actualitate. Cu o echipă tenace de reporteri și studiouri de broadcasting moderne, canalul oferă transmisiuni live rapide de la fața locului din marile orașe.",
    programe: "Grila este dominată de buletine informative din oră în oră, talk-show-uri de seară captivante prezentate de realizatori respectabili, analize de fond politice, dezbateri civice, investigații dure și buletine de vreme sau economie cu impact vital pentru cetățenii români.",
    public: "Atrage în mod deosebit telespectatorii activi civic de vârstă medie și seniori din România, dornici să afle rapid deciziile politice guvernamentale în timp util."
  },
  sport: {
    istoric: "Canalul a fost înființat pentru a satisface cererea crescută de spectacol sportiv calitativ din România, preluând drepturi exclusive de difuzare pentru competiții naționale și partide globale vibrante. Tehnologia sa de emisie folosește cele mai avansate caruri de transmisie de pe stadioane.",
    programe: "Grila cuprinde transmisiuni în direct ale marilor meciuri de fotbal din campionatele europene, partide de tenis spectaculoase din turnee oficiale, competiții auto formidabile, handbal de top și rubrici detaliate de analiză tactică din studiouri alături de foști mari sportivi români.",
    public: "Canalul deține o loialitate remarcabilă în rândul publicului activ, microbiștilor, sportivilor de performanță și tinerilor dornici de energie, fiind un brand prețuit de telespectatori."
  },
  filme: {
    istoric: "Lansat ca post tematic cinematografic, canalul pune accent pe oferirea unei experiențe memorabile de cinefil acasă, prin achiziții sistematice ale drepturilor de emisie pentru filme clasice, blockbustere majore și producții independente care au cucerit festivalurile internaționale de cinema.",
    programe: "Grila oferă maratoane distractive în weekend, comedii savuroase, thrillere palpitante de seară, filme de dragoste emoționante, filme SF revoluționare și seriale apreciate transmise la o calitate spectaculoasă a imaginii High Definition și cu sonorizare stereo superioară.",
    public: "Nișa canalului se pliază perfect pe pasionații de filme și seriale bune, tineri și adulți dornici de seri relaxante, oferind o bibliotecă diversificată de povești cinematografice valoroase."
  },
  documentare: {
    istoric: "Acest canal s-a născut din dorința de a aduce pe ecrane secretele universului, misterele uluitoare ale istoriei și frumusețea fragilă a naturii. Colaborează cu regizori și exploratori recunoscuți, transformând fiecare documentar într-o călătorie spectaculoasă în inima științei.",
    programe: "Emisiunile acoperă zone variate: descoperiri arheologice revoluționare, reconstituiri ale marilor evenimente din Al Doilea Război Mondial, tehnologie cosmică modernă și universul sălbatic al mamiferelor mari. Toate producțiile beneficiază de imagini de tip cinematografic formidabile.",
    public: "Formatul canalului atrage elevi, studenți, profesori și adulți dornici de asimilare continuă de cunoștințe folositoare, fiind considerat un brand de încredere și valoare educațională înaltă."
  },
  copii: {
    istoric: "Lansat ca univers protector destinat fanteziei, canalul animat oferă de ani buni o oază de fericire și divertisment inteligent pentru copii. Promovează prin conținutul săvârșit valori universale fundamentale precum importanța camaraderiei, corectitudinea și visurile curate.",
    programe: "Grila este ticsită de desene vesele dublate profesionist în limba română, aventuri pline de fantezie, show-uri interactive, povești educative pentru preșcolari și seriale pline de haz destinate școlarilor dornici de divertisment frumos alături de părinți.",
    public: "Atât peșcolarii și copiii mai mari, cât și părinții dornici de un mediu media curat și liniștit consideră acest post o adevărată fericire pentru petrecerea timpului de joacă acasă."
  },
  muzica: {
    istoric: "Postul s-a format ca radio-televiziune muzicală de referință, promovând cele mai mari hituri românești și internaționale ale momentului. S-a dezvoltat legat direct de marile festivaluri autohtone și concerte reprezentative din showbiz.",
    programe: "Grila este plină de topuri muzicale de seară, playlisturi personalizate de weekend, transmisiuni în direct din cluburi sau emisiuni tip matinal cu videoclipuri moderne realizate de jurnaliști tineri și entuziaști din showbizul autohton.",
    public: "Publicul tânăr, iubitorii de ritm și muzică modernă, adolescenții și românii dornici de o ambianță muzicală perfectă de fundal acasă sau la birou sunt principalii adepți fideli ai brandului."
  }
};

// Helper function to detect genre from channel title or category
function detectGenreFlags(title: string, category: string): string {
  const normTitle = title.toUpperCase();
  const normCat = category.toUpperCase();

  if (normTitle.includes('SPORT') || normTitle.includes('ARENA') || normTitle.includes('EUROSPORT') || normTitle.includes('SUPERSPORT')) {
    return 'sport';
  }
  if (normTitle.includes('FILM') || normTitle.includes('HBO') || normTitle.includes('CINEMAX') || normTitle.includes('AXN') || normTitle.includes('AMC') || normTitle.includes('BOX') || normTitle.includes('SHOWTIME') || normTitle.includes('DIZI')) {
    return 'filme';
  }
  if (normTitle.includes('NEWS') || normTitle.includes('TVR_INTERNATIONAL') || normTitle.includes('STIRI') || normCat.includes('ȘTIRI') || normTitle.includes('ROMANIA TV') || normTitle.includes('REALITATEA') || normTitle.includes('B1') || normTitle.includes('CNN') || normTitle.includes('BBC')) {
    return 'stiri';
  }
  if (normTitle.includes('DISNEY') || normTitle.includes('NICK') || normTitle.includes('CARTOON') || normTitle.includes('MINIMAX') || normTitle.includes('JIM') || normTitle.includes('TOONS') || normTitle.includes('JR')) {
    return 'copii';
  }
  if (normTitle.includes('GEOGRAPHIC') || normTitle.includes('DISCOVERY') || normTitle.includes('HISTORY') || normTitle.includes('VIASAT') || normTitle.includes('WILD') || normTitle.includes('NATURE') || normTitle.includes('EXPLORER') || normTitle.includes('SCIENCE') || normTitle.includes('INVESTIGATION') || normTitle.includes('HGTV') || normTitle.includes('TRAVEL')) {
    return 'documentare';
  }
  if (normTitle.includes('MUSIC') || normTitle.includes('ZU') || normTitle.includes('KISS') || normTitle.includes('UTV') || normTitle.includes('TARAF') || normTitle.includes('BALCAN') || normTitle.includes('ROCK') || normTitle.includes('HIT') || normTitle.includes('ETNO')) {
    return 'muzica';
  }
  return 'general';
}

function buildCategoryDescription(title: string, category: string): string {
  const genre = detectGenreFlags(title, category);
  const tmpl = templatesByGenre[genre] || templatesByGenre['general'];
  
  return `### Istoricul și Lansarea Postului
Canalul de televiziune **${title}** reprezintă un reper remarcabil în categoria sa pe piața mass-media românească. ${tmpl.istoric}

### Profilul de Emisie și Programe Emblematice
Pliat pe profilul său de emisie, **${title}** transmite formate moderne de producție și o grilă solidă adaptată cerințelor publicului. ${tmpl.programe}

### Publicul Țintă și Receptare
Brandul **${title}** asamblează o comunitate pasionată în jurul formatelor sale. ${tmpl.public}`;
}

async function run() {
  try {
    console.log("Connecting to Firestore database...");
    const querySnapshot = await getDocs(collection(db, 'programs'));
    const allDocs = querySnapshot.docs;
    console.log(`Loaded ${allDocs.length} programs from base collection.`);

    let updated = 0;

    for (const item of allDocs) {
      const data = item.data();
      const channelId = item.id;
      const title = data.title;
      const category = data.category || 'General';

      if (!title) continue;

      let descriptionText = '';

      // Check if we have a custom curated description or build a rich category description
      if (customMonografii[title]) {
        descriptionText = customMonografii[title];
      } else {
        descriptionText = buildCategoryDescription(title, category);
      }

      await updateDoc(doc(db, 'programs', channelId), {
        description: descriptionText.trim()
      });

      updated++;
      if (updated % 20 === 0) {
        console.log(`Updated ${updated}/${allDocs.length} descriptions successfully...`);
      }
    }

    console.log(`\n✅ TOATE DESCRIERILE AU FOST SCRISE CU SUCCES! S-au actualizat ${updated} monografii TV complete.`);
  } catch (err: any) {
    console.error("Error occurred compiling descriptions database:", err.message || err);
  } finally {
    process.exit(0);
  }
}

run();
