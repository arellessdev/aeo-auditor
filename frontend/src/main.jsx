import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';

const style = document.createElement('style');
style.textContent = 
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080c14; color: #e0e8ff; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  button { transition: all 0.2s; }
  button:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  input:focus { outline: none; border-color: #00e5ff !important; }
;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results/:id" element={<Results />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
