import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import UnifiedWalletProvider from './components/wallet/UnifiedWalletProvider';
import Shell from './components/layout/Shell';

// Lazy load all pages - only load when navigated to
const Dashboard = lazy(() => import('./app/Dashboard'));
const BumpCenter = lazy(() => import('./app/BumpCenter'));
const Portfolio = lazy(() => import('./app/Portfolio'));
const NFTGallery = lazy(() => import('./app/NFTGallery'));
const Activity = lazy(() => import('./app/Activity'));
const Analytics = lazy(() => import('./app/Analytics'));
const Settings = lazy(() => import('./app/Settings'));

// Preload Dashboard immediately (it's the home page)
const dashboardPreload = import('./app/Dashboard');
void dashboardPreload; // Suppress unused warning — preloads in background

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UnifiedWalletProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="/bump" element={
              <Suspense fallback={<PageLoader />}>
                <BumpCenter />
              </Suspense>
            } />
            <Route path="/portfolio" element={
              <Suspense fallback={<PageLoader />}>
                <Portfolio />
              </Suspense>
            } />
            <Route path="/nfts" element={
              <Suspense fallback={<PageLoader />}>
                <NFTGallery />
              </Suspense>
            } />
            <Route path="/activity" element={
              <Suspense fallback={<PageLoader />}>
                <Activity />
              </Suspense>
            } />
            <Route path="/analytics" element={
              <Suspense fallback={<PageLoader />}>
                <Analytics />
              </Suspense>
            } />
            <Route path="/settings" element={
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12121a',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
          },
        }}
      />
    </UnifiedWalletProvider>
  );
}
