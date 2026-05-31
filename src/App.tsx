import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import UnifiedWalletProvider from './components/wallet/UnifiedWalletProvider';
import Shell from './components/layout/Shell';
import Dashboard from './app/Dashboard';
import BumpCenter from './app/BumpCenter';
import Portfolio from './app/Portfolio';
import NFTGallery from './app/NFTGallery';
import Activity from './app/Activity';
import Analytics from './app/Analytics';
import Settings from './app/Settings';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UnifiedWalletProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Shell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bump" element={<BumpCenter />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/nfts" element={<NFTGallery />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
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
    </QueryClientProvider>
  );
}
