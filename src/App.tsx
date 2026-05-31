import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';

const Dashboard = lazy(() => import('./app/Dashboard'));
const BumpCenter = lazy(() => import('./app/BumpCenter'));
const Portfolio = lazy(() => import('./app/Portfolio'));
const NFTGallery = lazy(() => import('./app/NFTGallery'));
const Activity = lazy(() => import('./app/Activity'));
const Analytics = lazy(() => import('./app/Analytics'));
const Settings = lazy(() => import('./app/Settings'));

const PageLoader = () => (
  <div className="flex h-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
  </div>
);

export const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="/bump" element={<Suspense fallback={<PageLoader />}><BumpCenter /></Suspense>} />
        <Route path="/portfolio" element={<Suspense fallback={<PageLoader />}><Portfolio /></Suspense>} />
        <Route path="/nfts" element={<Suspense fallback={<PageLoader />}><NFTGallery /></Suspense>} />
        <Route path="/activity" element={<Suspense fallback={<PageLoader />}><Activity /></Suspense>} />
        <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
      </Route>
    </Routes>
  </BrowserRouter>
);
