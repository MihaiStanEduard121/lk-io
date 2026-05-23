import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Comment, Article } from '../../types';
import { CheckCircle, Trash2 } from 'lucide-react';

export default function CommentModeration() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  const loadData = () => {
    api.getComments().then(setComments);
    api.getArticles().then(setArticles);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    await api.approveComment(id);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if(confirm('Sigur vrei să ștergi acest comentariu?')) {
      await api.deleteComment(id);
      loadData();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Moderare Comentarii</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/50 text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Articol</th>
              <th className="px-6 py-4 font-medium">Autor</th>
              <th className="px-6 py-4 font-medium">Comentariu</th>
              <th className="px-6 py-4 font-medium">Dată</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {comments.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(c => {
              const art = articles.find(a => a.id === c.articleId);
              return (
              <tr key={c.id} className="hover:bg-zinc-800/20">
                <td className="px-6 py-4">
                  {art ? <span className="font-bold text-indigo-400 truncate max-w-[150px] inline-block">{art.title}</span> : <span className="text-zinc-500">Șters</span>}
                </td>
                <td className="px-6 py-4 font-bold text-white">{c.author}</td>
                <td className="px-6 py-4 text-zinc-300 max-w-xs truncate">{c.content}</td>
                <td className="px-6 py-4 text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {c.approved ? 
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-xs font-bold">Aprobat</span> : 
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-xs font-bold">În așteptare</span>
                  }
                </td>
                <td className="px-6 py-4 text-right flex justify-end space-x-2">
                  {!c.approved && (
                    <button 
                      onClick={() => handleApprove(c.id)}
                      className="inline-flex p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md hover:bg-emerald-500/20"
                      title="Aprobă"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="inline-flex p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md hover:bg-rose-500/20"
                    title="Șterge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        {comments.length === 0 && (
          <div className="p-8 text-center text-zinc-500">Niciun comentariu.</div>
        )}
      </div>
    </div>
  );
}
