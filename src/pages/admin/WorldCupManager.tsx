import { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, storage } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { WORLD_CUP_MATCHES, WCMatch } from '../public/worldCupData';
import { Award, Tv, Save, CheckCircle, RefreshCcw, HelpCircle, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import UploadProgressBar from '../../components/UploadProgressBar';

export default function WorldCupManager() {
  const [selectedMatch, setSelectedMatch] = useState<WCMatch>(WORLD_CUP_MATCHES[0]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration settings for Player 1, 2, 3 and Replay
  const [config, setConfig] = useState({
    player1Active: true,
    player1Embed: '',
    player2Active: false,
    player2Embed: '',
    player3Active: false,
    player3Embed: '',
    replayEmbed: ''
  });

  // Load configuration for the selected match
  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      try {
        const docRef = doc(db, 'match_players', selectedMatch.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setConfig({
            player1Active: data.player1Active !== undefined ? data.player1Active : true,
            player1Embed: data.player1Embed || '',
            player2Active: !!data.player2Active,
            player2Embed: data.player2Embed || '',
            player3Active: !!data.player3Active,
            player3Embed: data.player3Embed || '',
            replayEmbed: data.replayEmbed || ''
          });
        } else {
          // Pre-populate with defaults from static match details
          setConfig({
            player1Active: true,
            player1Embed: selectedMatch.embedCode || '',
            player2Active: false,
            player2Embed: '',
            player3Active: false,
            player3Embed: '',
            replayEmbed: ''
          });
        }
      } catch (error) {
        handleFirestoreError(error, 'get' as any, `match_players/${selectedMatch.id}`);
      } finally {
        setLoading(false);
      }
    }
    
    loadConfig();
  }, [selectedMatch]);

  const handleSave = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const docRef = doc(db, 'match_players', selectedMatch.id);
      await setDoc(docRef, {
        matchId: selectedMatch.id,
        ...config,
        updatedAt: new Date().toISOString()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (error) {
      handleFirestoreError(error, 'write' as any, `match_players/${selectedMatch.id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: 'player1Active' | 'player2Active' | 'player3Active') => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTextChange = (key: 'player1Embed' | 'player2Embed' | 'player3Embed' | 'replayEmbed', value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 50MB - inform user as per previous experience
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('Fișierul este prea mare (>50MB). Te rugăm să-l încarci pe un serviciu de hosting video (YouTube/Vimeo) și să folosești link-ul direct.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const startTime = Date.now();

    try {
      const storageRef = ref(storage, `match_replays/${selectedMatch.id}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          
          const timeElapsed = (Date.now() - startTime) / 1000;
          const uploadSpeed = snapshot.bytesTransferred / timeElapsed; // bytes/sec
          const bytesRemaining = snapshot.totalBytes - snapshot.bytesTransferred;
          const remainingTime = bytesRemaining / uploadSpeed;
          setEstimatedTime(remainingTime);
        },
        (error) => {
          console.error('Error uploading file:', error);
          alert('A apărut o eroare la încărcarea fișierului: ' + error.message);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setConfig(prev => ({
            ...prev,
            replayEmbed: downloadURL
          }));
          setUploading(false);
          setEstimatedTime(0);
        }
      );
    } catch (error) {
      console.error('Error starting upload:', error);
      setUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-zinc-950 text-zinc-300 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Award className="text-amber-500 h-8 h-8" />
            <span>Meciuri Cupă & Playeri Stream</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1">
            Gestionează disponibilitatea Player 1, 2, 3 și actualizează în timp real codurile iFrame (embed) pentru transmisiunile live.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Match Selection Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Selectează Meciul</h2>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 space-y-2 max-h-[600px] overflow-y-auto scrollbar-none shadow-xl">
            {WORLD_CUP_MATCHES.map((m) => {
              const active = m.id === selectedMatch.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all border flex flex-col space-y-1.5 ${
                    active
                      ? 'bg-indigo-600/10 border-indigo-500/50 text-white'
                      : 'bg-zinc-900/35 border-zinc-850 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Grup {m.group}</span>
                    <span className="font-mono text-[10px] bg-zinc-950 px-2 py-0.5 rounded text-zinc-500">{m.date} - {m.time}</span>
                  </div>
                  <div className="text-xs font-bold font-sans">
                    {m.team1} vs {m.team2}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Players Configuration Station */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-905 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#E05424] font-black">Editare configurare</span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedMatch.team1} vs {selectedMatch.team2} ({selectedMatch.city})
                </h3>
              </div>
              <button 
                onClick={() => setSelectedMatch({ ...selectedMatch })}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
                title="Reîncărcare"
              >
                <RefreshCcw className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center text-zinc-500 text-xs font-semibold">
                Se încarcă setările canelelor...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Save Info Success Alerts */}
                {saveSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Configurația playerilor a fost salvată cu succes în timp real! Toți spectatorii vor vedea modificările instantaneu.</span>
                  </motion.div>
                )}

                {/* Player 1 Options */}
                <div className="p-4.5 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tv className="w-4.5 h-4.5 text-amber-500" />
                      <span className="text-sm font-bold text-white">Opțiuni - Player 1</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-zinc-500 font-semibold">{config.player1Active ? 'Funcționează (Activ)' : 'Indisponibil (Dezactivat)'}</span>
                      <button
                        onClick={() => handleToggle('player1Active')}
                        className={`w-11 h-6 rounded-full transition-colors relative ${config.player1Active ? 'bg-indigo-600' : 'bg-zinc-800'}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${config.player1Active ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400">Cod Embed / iFrame Sursă Player 1</label>
                    <textarea
                      value={config.player1Embed}
                      onChange={(e) => handleTextChange('player1Embed', e.target.value)}
                      placeholder="Introduceți codul embed iFrame, ex: <iframe src='https://...' referrerpolicy='no-referrer'...>"
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Player 2 Options */}
                <div className="p-4.5 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tv className="w-4.5 h-4.5 text-sky-400" />
                      <span className="text-sm font-bold text-white">Opțiuni - Player 2</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-zinc-500 font-semibold">{config.player2Active ? 'Funcționează (Activ)' : 'Indisponibil (Dezactivat)'}</span>
                      <button
                        onClick={() => handleToggle('player2Active')}
                        className={`w-11 h-6 rounded-full transition-colors relative ${config.player2Active ? 'bg-indigo-600' : 'bg-zinc-800'}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${config.player2Active ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400">Cod Embed / iFrame Sursă Player 2</label>
                    <textarea
                      value={config.player2Embed}
                      onChange={(e) => handleTextChange('player2Embed', e.target.value)}
                      placeholder="Cod embed iFrame pentru Player 2"
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Player 3 Options */}
                <div className="p-4.5 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tv className="w-4.5 h-4.5 text-violet-400" />
                      <span className="text-sm font-bold text-white">Opțiuni - Player 3</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-zinc-550 font-semibold">{config.player3Active ? 'Funcționează (Activ)' : 'Indisponibil (Dezactivat)'}</span>
                      <button
                        onClick={() => handleToggle('player3Active')}
                        className={`w-11 h-6 rounded-full transition-colors relative ${config.player3Active ? 'bg-indigo-600' : 'bg-zinc-800'}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${config.player3Active ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400">Cod Embed / iFrame Sursă Player 3</label>
                    <textarea
                      value={config.player3Embed}
                      onChange={(e) => handleTextChange('player3Embed', e.target.value)}
                      placeholder="Cod embed iFrame pentru Player 3"
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Replay Options */}
                <div className="p-4.5 bg-indigo-900/10 border border-indigo-500/20 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <RefreshCcw className="w-4.5 h-4.5 text-indigo-400" />
                      <span className="text-sm font-bold text-indigo-300">Configurare Replay (MP4)</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400">URL Sursă MP4 (Replay Meci)</label>
                    <div className="flex gap-2">
                       <input
                         type="url"
                         value={config.replayEmbed}
                         onChange={(e) => handleTextChange('replayEmbed', e.target.value)}
                         placeholder="https://exemplu.ro/replay-meci.mp4"
                         className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                       />
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleFileUpload} 
                         className="hidden" 
                         accept="video/*" 
                       />
                       <button
                         type="button"
                         onClick={() => fileInputRef.current?.click()}
                         disabled={uploading}
                         className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl flex items-center justify-center gap-2 transition-colors relative"
                       >
                         <Upload className="w-4 h-4" />
                       </button>
                    </div>
                    {uploading && (
                      <UploadProgressBar 
                        progress={uploadProgress} 
                        isUploading={uploading} 
                        estimatedTimeSeconds={estimatedTime} 
                      />
                    )}
                  </div>
                </div>

                {/* Submitting Trigger actions */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-850">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all pointer-events-auto shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvează Configurația</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick instructions widget block */}
          <div className="bg-zinc-900/20 border border-zinc-850 p-5 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed text-zinc-450">
            <HelpCircle className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-zinc-300 mb-1">Instrucțiuni Importante:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Dacă activați un player și are cod embed, utilizatorii publici vor putea selecta playerul respectiv în interfață.</li>
                <li>Dacă alegeți opțiunea <strong className="text-rose-400">Inactiv</strong>, playerul va apărea ca <strong className="text-rose-400">Indisponibil</strong> pentru utilizatori cu un mesaj politicos de atenționare.</li>
                <li>Toate codurile embed iFrame vor fi verificate și curățate în condții de CSP restrictiv prin serviciul integrat de securizare a stream-ului.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
