import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Save, AlertCircle, Image as ImageIcon, Video, Sparkles, Loader2, Check, AlertTriangle, FileText } from 'lucide-react';
import { ProgramCategory } from '../../types';

export default function ProgramEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    streamUrl: '',
    embedCode: '',
    thumbnail: '',
    banner: '',
    status: 'offline' as 'online'|'offline',
    quality: 'HD' as 'SD'|'HD'|'4K',
    tags: '',
    views: 0,
    rating: 0,
    isFeatured: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiChaptersStatus, setAiChaptersStatus] = useState<Array<{ title: string, status: 'pending'|'generating'|'done'|'error', words?: number }>>([
    { title: "Istoricul complet, originile și contextul lansării postului", status: 'pending' },
    { title: "Grila detaliată de programe, emisiuni celebre și prezentatori faimoși", status: 'pending' },
    { title: "Publicul țintă, sociodemografia și strategia de marketing/branding", status: 'pending' },
    { title: "Infrastructura tehnică de emisie, rezoluții, transmisie digitală și platforme", status: 'pending' },
    { title: "Impactul socio-cultural în România, premii primite și retrospectiva critică", status: 'pending' },
  ]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [totalWordsGenerated, setTotalWordsGenerated] = useState(0);

  const handleGenerateAiDescription = async () => {
    if (!formData.title) {
      setAiError('Vă rugăm să introduceți mai întâi Titlul Programului în câmpul de mai sus pentru ca AI-ul să identifice corect postul TV!');
      return;
    }
    setAiGenerating(true);
    setAiError('');
    setTotalWordsGenerated(0);
    setOverallProgress(0);

    const newStatus: Array<{ title: string, status: 'pending'|'generating'|'done'|'error', words?: number }> = [
      { title: "Istoricul complet, originile și contextul lansării postului", status: 'pending', words: 0 },
      { title: "Grila detaliată de programe, emisiuni celebre și prezentatori faimoși", status: 'pending', words: 0 },
      { title: "Publicul țintă, sociodemografia și strategia de marketing/branding", status: 'pending', words: 0 },
      { title: "Infrastructura tehnică de emisie, rezoluții, transmisie digitală și platforme", status: 'pending', words: 0 },
      { title: "Impactul socio-cultural în România, premii primite și retrospectiva critică", status: 'pending', words: 0 },
    ];
    setAiChaptersStatus(newStatus);

    let accumulatedDescription = '';

    accumulatedDescription += `# Monografie Completă: ${formData.title.toUpperCase()}\n\n`;
    accumulatedDescription += `> Acest material de referință extins reprezintă o cercetare completă asupra postului de televiziune **${formData.title}**, acoperind aspectele sale istorice, programele sale emblematice, datele sale demografice, logistica tehnică de emisie și impactul cultural general în societate. Lucrare academică generată la data de ${new Date().toLocaleDateString('ro-RO')}.\n\n---\n\n`;

    for (let i = 0; i < 5; i++) {
      setCurrentChapterIndex(i);
      newStatus[i].status = 'generating';
      setAiChaptersStatus([...newStatus]);

      try {
        const response = await fetch('/api/ai/generate-chapter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programId: id || 'new',
            title: formData.title,
            category: formData.category,
            chapterIndex: i
          })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Eroare necunoscută la generarea acestui capitol.');
        }

        accumulatedDescription += `## ${data.title}\n\n${data.content}\n\n---\n\n`;
        
        newStatus[i].status = 'done';
        newStatus[i].words = data.wordCount;
        setAiChaptersStatus([...newStatus]);
        
        const partialSum = newStatus.reduce((acc, curr) => acc + (curr.words || 0), 0);
        setTotalWordsGenerated(partialSum);
        setOverallProgress(Math.round(((i + 1) / 5) * 100));

        // Dynamically update description state so that user sees updates in real time!
        setFormData(prev => ({ ...prev, description: accumulatedDescription }));
      } catch (err: any) {
        console.error('Error generating chapter', i, err);
        newStatus[i].status = 'error';
        setAiChaptersStatus([...newStatus]);
        setAiError(`Eroare la capitolul ${i+1}: ${err.message || 'Eroare de rețea sau cheia API este incorectă.'}`);
        setAiGenerating(false);
        return;
      }
    }

    setAiGenerating(false);
    setCurrentChapterIndex(null);
  };

  const [programCategories, setProgramCategories] = useState<ProgramCategory[]>([]);

  useEffect(() => {
    api.getProgramCategories().then(setProgramCategories);
    if (isEdit) {
      api.getProgram(id).then(data => {
        setFormData(prev => ({
          ...prev,
          ...data,
          tags: data.tags?.join(', ') || ''
        }));
      });
    }
  }, [id, isEdit]);

  const defaultCategories = ['General', 'Sport', 'Filme', 'Documentare', 'Știri', 'Muzică'];
  const allCategories = useMemo(() => {
    const dbCatNames = programCategories.map(c => c.name);
    return Array.from(new Set([...defaultCategories, ...dbCatNames]));
  }, [programCategories]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpload = async (e: any, field: string) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await api.uploadFile(file);
      setFormData(prev => ({ ...prev, [field]: res.url }));
    } catch (err: any) {
      setError(err.message || 'Eroare la upload');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (isEdit) {
        await api.updateProgram(id, payload);
      } else {
        await api.createProgram(payload);
      }
      navigate('/adminadmin/programs');
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{isEdit ? 'Editează Program' : 'Adaugă Program Nou'}</h1>
      </div>

      {error && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/50 p-4 rounded-lg flex items-center text-rose-400">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center"><Video className="w-5 h-5 mr-2 text-indigo-400"/> Detalii Generale</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Titlu Program</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div className="md:col-span-2">
              {/* Asistent AI Monografie 10K Cuvinte */}
              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-5 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/50 pb-4 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 animate-pulse">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Asistent AI: Monografie Detaliată (10,000 cuvinte)</h3>
                      <p className="text-zinc-500 text-xs">Cofinanțat de modelul Gemini 3.5 Flash pentru redactare academică</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Total Generat: </span>
                    <span className="text-amber-400 text-sm font-bold ml-1">{totalWordsGenerated.toLocaleString()} cuvinte</span>
                  </div>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Fiecare canal TV merită o prezentare exhaustivă de înaltă calitate. Această funcționalitate generează automat o descriere critică-istorică amplă, organizată în 5 capitole distincte, depășind 10.000 de cuvinte în total.
                </p>

                {aiError && (
                  <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-start text-xs text-rose-400 leading-relaxed">
                    <AlertTriangle className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold mb-1">Eroare Asistent AI</p>
                      <p>{aiError}</p>
                    </div>
                  </div>
                )}

                {/* Chapters list and statuses */}
                <div className="space-y-3 mb-6 bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/40">
                  {aiChaptersStatus.map((ch, idx) => (
                    <div key={idx} className="flex gap-3 justify-between items-center text-xs">
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] ${
                          idx === currentChapterIndex 
                            ? 'bg-indigo-500 text-white animate-pulse' 
                            : ch.status === 'done' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className={`${
                          idx === currentChapterIndex ? 'text-indigo-300 font-semibold' : ch.status === 'done' ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>
                          {ch.title}
                        </span>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {ch.status === 'pending' && (
                          <span className="text-zinc-600 font-medium">În așteptare</span>
                        )}
                        {ch.status === 'generating' && (
                          <span className="flex items-center text-indigo-400 font-semibold">
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            Se scrie...
                          </span>
                        )}
                        {ch.status === 'done' && (
                          <span className="flex items-center text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3 mr-1" />
                            +{ch.words?.toLocaleString() || 0} cuvinte
                          </span>
                        )}
                        {ch.status === 'error' && (
                          <span className="text-rose-400 font-semibold">Eșuat</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                {aiGenerating && (
                  <div className="mb-6 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Progres generare monografie</span>
                      <span>{overallProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2.5 border border-zinc-800 p-[1px]">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-500 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={aiGenerating}
                  onClick={handleGenerateAiDescription}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center space-x-2 ${
                    aiGenerating
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                      : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 text-white hover:opacity-95 shadow-indigo-600/10'
                  }`}
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Se redactează monografia... ({overallProgress}% complet)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1 text-yellow-200" />
                      <span>Generează Monografie Completă AI (~10.000 cuvinte)</span>
                    </>
                  )}
                </button>
              </div>

              <label className="block text-zinc-400 text-sm font-medium mb-2">Descriere (Acceptă Markdown, Formatare text, Imagini)</label>
              <textarea 
                required 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={16} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono text-sm leading-relaxed" 
                placeholder="### Generează o descriere uimitoare..."
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Categorie</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Tag-uri (separate prin virgulă)</label>
              <input name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="ex: sport, fotbal, live" />
            </div>

            <div className="md:col-span-2 mt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isFeatured" 
                  checked={formData.isFeatured} 
                  onChange={handleChange} 
                  className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                />
                <span className="text-zinc-300 font-medium">Apare în Recomandate pe Homepage</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center"><ImageIcon className="w-5 h-5 mr-2 text-indigo-400"/> Media & Streaming</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Link Stream (M3U8 / MP4)</label>
              <input name="streamUrl" value={formData.streamUrl} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="https://..." />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Cod Embed Player (Opțional)</label>
              <textarea name="embedCode" value={formData.embedCode} onChange={handleChange} rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm" placeholder="<iframe src=...></iframe"></textarea>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Thumbnail URL / Upload (din PC)</label>
              <div className="flex space-x-2">
                <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
                <label className="bg-zinc-800 hover:bg-zinc-700 cursor-pointer px-4 py-2.5 rounded-lg border border-zinc-700 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  <input type="file" className="hidden" onChange={e => handleUpload(e, 'thumbnail')} />
                </label>
              </div>
              {formData.thumbnail && <img src={formData.thumbnail} alt="thumb" className="mt-2 h-20 w-auto rounded border border-zinc-700 object-cover" />}
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Banner URL / Upload (din PC)</label>
              <div className="flex space-x-2">
                <input name="banner" value={formData.banner} onChange={handleChange} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
                <label className="bg-zinc-800 hover:bg-zinc-700 cursor-pointer px-4 py-2.5 rounded-lg border border-zinc-700 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  <input type="file" className="hidden" onChange={e => handleUpload(e, 'banner')} />
                </label>
              </div>
              {formData.banner && <img src={formData.banner} alt="banner" className="mt-2 h-20 w-auto rounded border border-zinc-700 object-cover" />}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white">
                <option value="offline">Offline / Ascuns</option>
                <option value="online">Online / Public</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Calitate curentă</label>
              <select name="quality" value={formData.quality} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white">
                <option value="SD">SD</option>
                <option value="HD">HD</option>
                <option value="4K">4K</option>
              </select>
            </div>
             <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Rating Inițial</label>
              <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Vizualizări Bază</label>
              <input type="number" name="views" value={formData.views} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Se salvează...' : 'Salvează Programul'}
          </button>
        </div>
      </form>
    </div>
  );
}
