/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/public/Home';
import PlayerPage from './pages/public/PlayerPage';
import NewsPage from './pages/public/NewsPage';
import ArticlePage from './pages/public/ArticlePage';
import ShowsPage from './pages/public/ShowsPage';
import ShowDetailPage from './pages/public/ShowDetailPage';
import SearchPage from './pages/public/SearchPage';
import LegalPage from './pages/public/LegalPage';
import WorldCupPage from './pages/public/WorldCupPage';
import WorldCupMatchDetailPage from './pages/public/WorldCupMatchDetailPage';
import DonationsPage from './pages/public/DonationsPage';

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
import MediaMetadata from './pages/admin/MediaMetadata';
import CategoryList from './pages/admin/CategoryList';
import CommentModeration from './pages/admin/CommentModeration';
import ScheduleManager from './pages/admin/ScheduleManager';
import ScraperSettings from './pages/admin/ScraperSettings';
import RedirectManager from './pages/admin/RedirectManager';
import LivePresence from './pages/admin/LivePresence';
import WorldCupManager from './pages/admin/WorldCupManager';
import AdRevenueManager from './pages/admin/AdRevenueManager';
import PopupManager from './pages/admin/PopupManager';
import ArticleGenerator from './pages/admin/ArticleGenerator';
import SchedulePage from './pages/public/SchedulePage';
import PresenceTracker from './components/PresenceTracker';
import CookieConsent from './components/CookieConsent';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <PresenceTracker />
        <CookieConsent />
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
          <Route path="/world-cup" element={<WorldCupPage />} />
          <Route path="/world-cup/:id" element={<WorldCupMatchDetailPage />} />
          <Route path="/donations" element={<DonationsPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/privacy-policy" element={<LegalPage />} />
          <Route path="/terms-of-service" element={<LegalPage />} />
          <Route path="/dmca" element={<LegalPage />} />
          <Route path="/copyright" element={<LegalPage />} />
          <Route path="/cookie-policy" element={<LegalPage />} />
          <Route path="/disclaimer" element={<LegalPage />} />
          <Route path="/legal-contact" element={<LegalPage />} />
          <Route path="/delete-my-data" element={<LegalPage />} />
          <Route path="/accessibility" element={<LegalPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/adminadmin" element={<AdminLayout />}>
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
          <Route path="scraper" element={<ScraperSettings />} />
          <Route path="live-presence" element={<LivePresence />} />
          <Route path="redirects" element={<RedirectManager />} />
          <Route path="media" element={<MediaMetadata />} />
          <Route path="settings" element={<HomepageSettings />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="comments" element={<CommentModeration />} />
          <Route path="tv-schedule" element={<ScheduleManager />} />
          <Route path="world-cup" element={<WorldCupManager />} />
          <Route path="ad-revenue" element={<AdRevenueManager />} />
          <Route path="popups" element={<PopupManager />} />
          <Route path="article-generator" element={<ArticleGenerator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </LanguageProvider>
 );
}
