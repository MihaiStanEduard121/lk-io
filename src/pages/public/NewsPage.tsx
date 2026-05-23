import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Article } from '../../types';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User } from 'lucide-react';

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getArticles().then(data => {
      setArticles(data.filter((a: Article) => a.status === 'published').sort((a: Article, b: Article) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-zinc-500">Încărcare...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
      <h1 className="text-4xl font-bold mb-10 text-white tracking-tight">Știri și Noutăți</h1>
      
      {articles.length === 0 ? (
        <div className="text-zinc-500">Nu am găsit articole publicate.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((art, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={art.id}
            >
              <Link to={`/news/${art.slug}`} className="group block h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors flex flex-col">
                <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-950">
                  {art.coverImage && (
                    <img 
                      src={art.coverImage} 
                      alt={art.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center space-x-4 text-xs text-zinc-500 mb-3">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {new Date(art.publishedAt).toLocaleDateString()}</span>
                    <span className="flex items-center"><User className="w-3 h-3 mr-1"/> {art.author}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {art.title}
                  </h2>
                  <p className="text-zinc-400 text-sm line-clamp-3 mb-4 flex-1">
                    {art.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                  </p>
                  <div className="text-sm font-semibold text-indigo-400 group-hover:text-indigo-300">
                    Citește mai mult &rarr;
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
