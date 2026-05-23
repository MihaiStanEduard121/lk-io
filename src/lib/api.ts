export const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('admin_token');

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Request failed');
  }
  
  return res.json();
};

export const api = {
  login: (username: string, password: string) => 
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }).then(res => {
      if(!res.ok) throw new Error("Autentificare eșuată");
      return res.json();
    }),
    
  // Live Programs
  getPrograms: () => fetch(`${API_BASE}/programs`).then(res => res.json()),
  getProgram: (id: string) => fetch(`${API_BASE}/programs/${id}`).then(res => res.json()),
  createProgram: (data: any) => fetchWithAuth(`/programs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateProgram: (id: string, data: any) => fetchWithAuth(`/programs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteProgram: (id: string) => fetchWithAuth(`/programs/${id}`, { method: 'DELETE' }),
  
  // Articles
  getArticles: () => fetch(`${API_BASE}/articles`).then(res => res.json()),
  getArticle: (id: string) => fetch(`${API_BASE}/articles/${id}`).then(res => res.json()),
  createArticle: (data: any) => fetchWithAuth(`/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateArticle: (id: string, data: any) => fetchWithAuth(`/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteArticle: (id: string) => fetchWithAuth(`/articles/${id}`, { method: 'DELETE' }),

  // Shows
  getShows: () => fetch(`${API_BASE}/shows`).then(res => res.json()),
  getShow: (id: string) => fetch(`${API_BASE}/shows/${id}`).then(res => res.json()),
  createShow: (data: any) => fetchWithAuth(`/shows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateShow: (id: string, data: any) => fetchWithAuth(`/shows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteShow: (id: string) => fetchWithAuth(`/shows/${id}`, { method: 'DELETE' }),

  // Episodes
  getEpisodes: (showId: string) => fetch(`${API_BASE}/shows/${showId}/episodes`).then(res => res.json()),
  getEpisode: (id: string) => fetch(`${API_BASE}/episodes/${id}`).then(res => res.json()),
  createEpisode: (showId: string, data: any) => fetchWithAuth(`/shows/${showId}/episodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateEpisode: (id: string, data: any) => fetchWithAuth(`/episodes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteEpisode: (id: string) => fetchWithAuth(`/episodes/${id}`, { method: 'DELETE' }),

  // Comments
  getComments: () => fetch(`${API_BASE}/comments`).then(res => res.json()),
  createComment: (data: any) => fetch(`${API_BASE}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  approveComment: (id: string) => fetchWithAuth(`/comments/${id}/approve`, { method: 'PUT' }),
  deleteComment: (id: string) => fetchWithAuth(`/comments/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => fetch(`${API_BASE}/categories`).then(res => res.json()),
  createCategory: (data: any) => fetchWithAuth(`/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteCategory: (id: string) => fetchWithAuth(`/categories/${id}`, { method: 'DELETE' }),

  // TV Schedule
  getSchedule: () => fetch(`${API_BASE}/schedule`).then(res => res.json()),
  createScheduleItem: (data: any) => fetchWithAuth(`/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteScheduleItem: (id: string) => fetchWithAuth(`/schedule/${id}`, { method: 'DELETE' }),

  // Homepage Config
  getHomepageConfig: () => fetch(`${API_BASE}/homepage`).then(res => res.json()),
  updateHomepageConfig: (data: any) => fetchWithAuth(`/homepage`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Search
  search: (query: string) => fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`).then(res => res.json()),

  getStats: () => fetchWithAuth(`/stats`),
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchWithAuth(`/upload`, {
      method: 'POST',
      body: formData
    });
  }
};
