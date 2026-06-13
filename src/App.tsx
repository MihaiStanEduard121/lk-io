/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import Loading from './components/Loading';
import PresenceTracker from './components/PresenceTracker';
import CookieConsent from './components/CookieConsent';

const Home = lazy(() => import('./pages/public/Home'));
const PlayerPage = lazy(() => import('./pages/public/PlayerPage'));
const NewsPage = lazy(() => import('./pages/public/NewsPage'));
const ArticlePage = lazy(() => import('./pages/public/ArticlePage'));
const ShowsPage = lazy(() => import('./pages/public/ShowsPage'));
const ShowDetailPage = lazy(() => import('./pages/public/ShowDetailPage'));
const SearchPage = lazy(() => import('./pages/public/SearchPage'));
const LegalPage = lazy(() => import('./pages/public/LegalPage'));
const WorldCupPage = lazy(() => import('./pages/public/WorldCupPage'));
const WorldCupMatchDetailPage = lazy(() => import('./pages/public/WorldCupMatchDetailPage'));
const DonationsPage = lazy(() => import('./pages/public/DonationsPage'));
const SchedulePage = lazy(() => import('./pages/public/SchedulePage'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProgramList = lazy(() => import('./pages/admin/ProgramList'));
const ProgramEditor = lazy(() => import('./pages/admin/ProgramEditor'));
const ArticleList = lazy(() => import('./pages/admin/ArticleList'));
const ArticleEditor = lazy(() => import('./pages/admin/ArticleEditor'));
const ShowList = lazy(() => import('./pages/admin/ShowList'));
const ShowEditor = lazy(() => import('./pages/admin/ShowEditor'));
const EpisodeList = lazy(() => import('./pages/admin/EpisodeList'));
const EpisodeEditor = lazy(() => import('./pages/admin/EpisodeEditor'));
const HomepageSettings = lazy(() => import('./pages/admin/HomepageSettings'));
const MediaMetadata = lazy(() => import('./pages/admin/MediaMetadata'));
const CategoryList = lazy(() => import('./pages/admin/CategoryList'));
const CommentModeration = lazy(() => import('./pages/admin/CommentModeration'));
const ScheduleManager = lazy(() => import('./pages/admin/ScheduleManager'));
const ScraperSettings = lazy(() => import('./pages/admin/ScraperSettings'));
const RedirectManager = lazy(() => import('./pages/admin/RedirectManager'));
const LivePresence = lazy(() => import('./pages/admin/LivePresence'));
const WorldCupManager = lazy(() => import('./pages/admin/WorldCupManager'));
const AdRevenueManager = lazy(() => import('./pages/admin/AdRevenueManager'));
const PopupManager = lazy(() => import('./pages/admin/PopupManager'));
const ArticleGenerator = lazy(() => import('./pages/admin/ArticleGenerator'));

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <PresenceTracker />
        <CookieConsent />
        <Suspense fallback={<Loading />}>
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
        </Suspense>
      </BrowserRouter>
  </LanguageProvider>
 );
}
