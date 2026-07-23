import { useEffect, useState, useMemo } from 'react';
import { api } from '../../lib/api';
import { Article, ArticleCategory } from '../../types';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, Newspaper, Filter, Clock } from 'lucide-react';

const calculateReadingTime = (content: string) => {
  const cleanContent = content ? content.replace(/<[^>]*>?/gm, '').replace(/[#*`_\[\]()\-]/g, '') : '';
  const words = cleanContent.trim().split(/\s+/).filter(Boolean);
  const minutes = Math.max(1, Math.ceil(words.length / 200));
  return `${minutes} min`;
};

export default function NewsPage() {
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
      const published = articlesData
        .filter((a: Article) => a.status === 'published')
        .sort((a: Article, b: Article) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      
      setArticles(published);
      setCategories(categoriesData);
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
    
    // Fallback: check if the article's category title, slug or content holds matching patterns
    const nameLower = cat.name.toLowerCase();
    const slugLower = cat.slug.toLowerCase();
    
    const artCat = (art as any).category;
    if (artCat && (artCat.toLowerCase() === nameLower || artCat.toLowerCase() === slugLower)) {
      return true;
    }
    
    const title = (art.title || '').toLowerCase();
    return normalize(title).includes(normalize(nameLower)) || normalize(title).includes(normalize(slugLower));
  };

  // Only display categories that actually contain at least one published article
  const activeCategories = useMemo(() => {
    return categories.filter(cat => 
      articles.some(art => matchArticleWithCategory(art, cat))
    );
  }, [articles, categories]);

  // Filter articles based on selection
  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'All') return articles;
    const cat = categories.find(c => c.id === selectedCategory);
    if (!cat) return articles;
    return articles.filter(art => matchArticleWithCategory(art, cat));
  }, [articles, selectedCategory, categories]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-bold">
        <div className="flex h-3 w-3 relative mb-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </div>
        <span className="text-zinc-500">Se încarcă articolele...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
      <div className="flex items-center space-x-3 mb-8">
        <Newspaper className="w-8 h-8 text-indigo-500" />
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Știri și Noutăți</h1>
      </div>

      {/* Category Filter Navigation Bar */}
      {activeCategories.length > 0 && (
        <div className="mb-10 flex gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-850 scrollbar-track-transparent animate-fade-in" id="news-category-navbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-102 font-black'
                : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-880 hover:text-white border border-zinc-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Toate Știrile</span>
          </button>
          {activeCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-102 font-black'
                  : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-880 hover:text-white border border-zinc-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
      
      {filteredArticles.length === 0 ? (
        <div className="text-zinc-550 py-16 bg-zinc-900/10 border border-zinc-850 rounded-2xl text-center max-w-lg mx-auto">
          <Newspaper className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-300">Niciun articol</h3>
          <p className="text-sm text-zinc-500 mt-1">Nu există articole publicate momentan în această categorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((art, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={art.id}
            >
              <Link to={`/news/${art.slug}`} className="group block h-full bg-zinc-900/40 border border-zinc-850 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-950 relative">
                  {art.coverImage ? (
                    <img 
                      src={art.coverImage} 
                      alt={art.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(art.title)}&background=111827&color=6366f1&size=500`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">No Image</div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 mb-3">
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-400"/> {new Date(art.publishedAt).toLocaleDateString()}</span>
                      <span className="flex items-center"><User className="w-3.5 h-3.5 mr-1.5 text-zinc-400"/> {art.author || 'Admin'}</span>
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-400"/> {calculateReadingTime(art.content)}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {art.title}
                    </h2>
                    <p className="text-zinc-450 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {art.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                    </p>
                  </div>
                  <div className="text-sm font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center space-x-1 mt-4">
                    <span>Citește mai mult</span>
                    <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
