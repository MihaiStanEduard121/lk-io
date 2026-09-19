import { useEffect, useState, useMemo } from 'react';
import { api } from '../../lib/api';
import { Article, ArticleCategory } from '../../types';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, Newspaper, Filter, Clock, ArrowRight } from 'lucide-react';

const calculateReadingTime = (content: string) => {
  const cleanContent = content ? content.replace(/<[^>]*>?/gm, '').replace(/[#*`_\[\]()\-]/g, '') : '';
  const words = cleanContent.trim().split(/\s+/).filter(Boolean);
  const minutes = Math.max(1, Math.ceil(words.length / 200));
  return `${minutes} min`;
};

export default function NewsPage() {
  const context = useOutletContext<{ theme?: string; isDark?: boolean }>() || {};
  const isDark = context.isDark ?? (context.theme === 'dark');

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      api.getArticles(),
      api.getCategories()
    ]).then(([articlesData, categoriesData]) => {
      const published = (articlesData || [])
        .filter((a: Article) => a.status === 'published')
        .sort((a: Article, b: Article) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      
      setArticles(published);
      setCategories(categoriesData || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const matchArticleWithCategory = (art: Article, cat: ArticleCategory) => {
    if (art.categoryId && art.categoryId === cat.id) {
      return true;
    }
    const nameLower = cat.name.toLowerCase();
    const slugLower = cat.slug.toLowerCase();
    
    const artCat = (art as any).category;
    if (artCat && (artCat.toLowerCase() === nameLower || artCat.toLowerCase() === slugLower)) {
      return true;
    }
    
    const title = (art.title || '').toLowerCase();
    return normalize(title).includes(normalize(nameLower)) || normalize(title).includes(normalize(slugLower));
  };

  const activeCategories = useMemo(() => {
    return categories.filter(cat => 
      articles.some(art => matchArticleWithCategory(art, cat))
    );
  }, [articles, categories]);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'All') return articles;
    const cat = categories.find(c => c.id === selectedCategory);
    if (!cat) return articles;
    return articles.filter(art => matchArticleWithCategory(art, cat));
  }, [articles, selectedCategory, categories]);

  if (loading) {
    return (
      <div className={`min-h-[70vh] flex flex-col items-center justify-center font-bold ${
        isDark ? 'bg-zinc-950 text-zinc-400' : 'bg-slate-50 text-slate-500'
      }`}>
        <div className="flex h-4 w-4 relative mb-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600"></span>
        </div>
        <span className="text-sm font-semibold">Se încarcă articolele...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-10 transition-colors duration-200 ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-xs mb-1">
              <Newspaper className="w-4 h-4" />
              <span>Noutăți TV & Media</span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Știri și Articole
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Cele mai recente știri din lumea televiziunii, premiere, meciuri și noutăți media.
            </p>
          </div>
        </div>

        {/* Category Pills */}
        {activeCategories.length > 0 && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-3 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === 'All'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
              }`}
            >
              Toate Știrile ({articles.length})
            </button>
            {activeCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : isDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
        
        {filteredArticles.length === 0 ? (
          <div className={`py-16 rounded-3xl border text-center max-w-md mx-auto p-8 ${
            isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <Newspaper className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
              Niciun articol găsit
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Nu există articole publicate momentan în această categorie.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredArticles.map((art, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={art.id}
              >
                <Link 
                  to={`/news/${art.slug}`} 
                  className={`group block h-full rounded-3xl overflow-hidden border transition-all duration-200 flex flex-col shadow-xs hover:shadow-md ${
                    isDark 
                      ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' 
                      : 'bg-white border-slate-200/90 hover:border-indigo-300'
                  }`}
                >
                  <div className="aspect-[16/9] w-full overflow-hidden bg-slate-200 dark:bg-zinc-900 relative">
                    {art.coverImage ? (
                      <img 
                        src={art.coverImage} 
                        alt={art.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(art.title)}&background=111827&color=6366f1&size=500`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                        Articol TV
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{new Date(art.publishedAt).toLocaleDateString('ro-RO')}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{calculateReadingTime(art.content)}</span>
                        </span>
                      </div>

                      <h2 className={`text-lg font-black mb-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {art.title}
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {art.content.replace(/<[^>]*>?/gm, '').substring(0, 140)}...
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-inherit flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <span>Citește articolul</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
