import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Article, Comment, ArticleCategory } from '../../types';
import Markdown from 'react-markdown';
import { Calendar, User, ArrowLeft, Eye, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const calculateReadingTime = (content: string) => {
  const cleanContent = content ? content.replace(/<[^>]*>?/gm, '').replace(/[#*`_\[\]()\-]/g, '') : '';
  const words = cleanContent.trim().split(/\s+/).filter(Boolean);
  const minutes = Math.max(1, Math.ceil(words.length / 200));
  return `${minutes} min`;
};

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // New Comment state
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      api.getArticle(slug!),
      api.getComments(),
      api.getCategories()
    ]).then(([data, coms, cats]) => {
      setArticle(data);
      if (data) {
        setComments(coms.filter((c: Comment) => c.articleId === data.id && c.approved));
        
        // 1. Dynamic document title
        document.title = `${data.title} - Știri programetv.online`;

        // 2. Clear clean text for description
        const plainTextExcerpt = data.content
          ? data.content.replace(/<[^>]*>?/gm, '').substring(0, 155).trim()
          : '';

        // 3. Structured Data JSON-LD
        const schema = {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": data.title,
          "image": data.coverImage ? [data.coverImage] : [],
          "datePublished": data.publishedAt || new Date().toISOString(),
          "dateModified": data.publishedAt || new Date().toISOString(),
          "author": [{
            "@type": "Person",
            "name": data.author || 'Redactor'
          }],
          "publisher": {
            "@type": "Organization",
            "name": "programetv.online",
            "logo": {
              "@type": "ImageObject",
              "url": "https://images.unsplash.com/photo-1593789382576-54f489cea515?q=80&w=200"
            }
          },
          "description": plainTextExcerpt
        };

        const existingScript = document.getElementById('jsonld-article-schema');
        if (existingScript) existingScript.remove();

        const script = document.createElement('script');
        script.id = 'jsonld-article-schema';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);

        // 4. Update or create Meta Tags
        const updateOrCreateMeta = (nameAttr: string, propertyAttr: string, contentVal: string) => {
          let element = nameAttr 
            ? document.querySelector(`meta[name="${nameAttr}"]`) 
            : document.querySelector(`meta[property="${propertyAttr}"]`);
            
          if (!element) {
            element = document.createElement('meta');
            if (nameAttr) element.setAttribute('name', nameAttr);
            if (propertyAttr) element.setAttribute('property', propertyAttr);
            document.head.appendChild(element);
          }
          element.setAttribute('content', contentVal);
        };

        updateOrCreateMeta('description', '', plainTextExcerpt);
        updateOrCreateMeta('keywords', '', `stiri, tv, live, program, ${data.title.toLowerCase().split(' ').join(', ')}`);
        updateOrCreateMeta('', 'og:title', data.title);
        updateOrCreateMeta('', 'og:description', plainTextExcerpt);
        if (data.coverImage) {
          updateOrCreateMeta('', 'og:image', data.coverImage);
        }
      }
      setCategories(cats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim() || !article) return;
    try {
      await api.createComment({ articleId: article.id, author, content });
      setSubmitMsg('Comentariul a fost trimis spre aprobare!');
      setAuthor('');
      setContent('');
    } catch {
      setSubmitMsg('Eroare la trimiterea comentariului.');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-zinc-500">Încărcare...</div>;
  if (!article || article.status !== 'published') return <div className="h-screen flex items-center justify-center text-rose-500">Articolul nu a fost găsit.</div>;

  const category = categories.find(c => c.id === article.categoryId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[9999] bg-zinc-900/40">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Link to="/news" className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Înapoi la știri
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        {article.isBreakingNews && (
          <div className="inline-flex items-center bg-rose-600/20 text-rose-500 px-3 py-1 rounded border border-rose-500/20 text-sm font-bold mb-6">
            <AlertCircle className="w-4 h-4 mr-2" /> BREAKING NEWS
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-400 mb-6 border-b border-zinc-800 pb-6">
          {category && (
            <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 border border-indigo-500/20 rounded-full font-bold">
              {category.name}
            </span>
          )}
          <span className="flex items-center bg-zinc-900 px-3.5 py-1.5 rounded-full"><Calendar className="w-4 h-4 mr-2 text-indigo-400"/> {new Date(article.publishedAt).toLocaleDateString()}</span>
          <span className="flex items-center bg-zinc-900 px-3.5 py-1.5 rounded-full"><User className="w-4 h-4 mr-2 text-indigo-400"/> {article.author}</span>
          <span className="flex items-center bg-zinc-900 px-3.5 py-1.5 rounded-full"><Eye className="w-4 h-4 mr-2 text-indigo-400"/> {article.views || 0}</span>
          <span className="flex items-center bg-zinc-900 px-3.5 py-1.5 rounded-full"><Clock className="w-4 h-4 mr-2 text-indigo-400"/> {calculateReadingTime(article.content)}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8 leading-tight">
          {article.title}
        </h1>

        {article.coverImage && (
          <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden mb-12 border border-zinc-800 shadow-2xl">
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
          <div className="markdown-body">
            <Markdown>{article.content}</Markdown>
          </div>
        </div>
      </motion.div>

      {/* Comments Section */}
      <div className="mt-16 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
          <MessageSquare className="w-6 h-6 mr-3 text-indigo-500" />
          Comentarii ({comments.length})
        </h2>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-12">
          <h3 className="font-bold text-lg text-white mb-4">Adaugă un comentariu</h3>
          {submitMsg && <div className="p-3 mb-4 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-medium">{submitMsg}</div>}
          <form onSubmit={handleCommentSubmit} className="space-y-4">
             <div>
               <input type="text" value={author} onChange={e => setAuthor(e.target.value)} required placeholder="Numele tău" className="w-full md:w-1/2 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500" />
             </div>
             <div>
               <textarea value={content} onChange={e => setContent(e.target.value)} required placeholder="Comentariul tău..." rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500 text-sm"></textarea>
             </div>
             <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">Trimite Comentariu</button>
          </form>
        </div>

        <div className="space-y-6">
          {comments.map((c) => (
            <div key={c.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-indigo-400">{c.author}</div>
                <div className="text-xs text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</div>
              </div>
              <p className="text-zinc-300 text-sm">{c.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-zinc-500">Fii primul care comentează!</p>}
        </div>
      </div>
    </div>
  );
}
