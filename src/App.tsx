/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/public/Home';
import PlayerPage from './pages/public/PlayerPage';
import NewsPage from './pages/public/NewsPage';
import ArticlePage from './pages/public/ArticlePage';
import ShowsPage from './pages/public/ShowsPage';
import ShowDetailPage from './pages/public/ShowDetailPage';
import SearchPage from './pages/public/SearchPage';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProgramList from './pages/admin/ProgramList';
import ProgramEditor from './pages/admin/ProgramEditor';
import ArticleList from './pages/admin/ArticleList';
import ArticleEditor from './pages/admin/ArticleEditor';
import ShowList from './pages/admin/ShowList';
import ShowEditor from './pages/admin/ShowEditor';
import EpisodeList from './pages/admin/EpisodeList';
import EpisodeEditor from './pages/admin/EpisodeEditor';
import HomepageSettings from './pages/admin/HomepageSettings';
import CategoryList from './pages/admin/CategoryList';
import CommentModeration from './pages/admin/CommentModeration';
import ScheduleManager from './pages/admin/ScheduleManager';
import SchedulePage from './pages/public/SchedulePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/play/:id" element={<PlayerPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<ArticlePage />} />
          <Route path="/shows" element={<ShowsPage />} />
          <Route path="/shows/:slug" element={<ShowDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          
          <Route path="programs" element={<ProgramList />} />
          <Route path="programs/new" element={<ProgramEditor />} />
          <Route path="programs/:id" element={<ProgramEditor />} />
          
          <Route path="news" element={<ArticleList />} />
          <Route path="news/new" element={<ArticleEditor />} />
          <Route path="news/:id" element={<ArticleEditor />} />

          <Route path="shows" element={<ShowList />} />
          <Route path="shows/new" element={<ShowEditor />} />
          <Route path="shows/:id" element={<ShowEditor />} />
          
          <Route path="shows/:showId/episodes" element={<EpisodeList />} />
          <Route path="shows/:showId/episodes/new" element={<EpisodeEditor />} />
          <Route path="shows/:showId/episodes/:episodeId" element={<EpisodeEditor />} />
          <Route path="settings" element={<HomepageSettings />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="comments" element={<CommentModeration />} />
          <Route path="tv-schedule" element={<ScheduleManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
