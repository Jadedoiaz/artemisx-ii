import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { Dashboard } from './app/Dashboard'
import { BumpCenter } from './app/BumpCenter'
import { Portfolio } from './app/Portfolio'
import { NFTGallery } from './app/NFTGallery'
import { Activity } from './app/Activity'
import { Analytics } from './app/Analytics'
import { Settings } from './app/Settings'

export const App: React.FC = () => (
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
)
