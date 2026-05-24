import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './pages/Home';
import Results from './pages/Results';
import Pricing from './pages/Pricing';
import Report from './pages/Report';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/report/:id" element={<Report />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
