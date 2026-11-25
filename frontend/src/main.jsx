import React from 'react';
import { createRoot } from 'react-dom/client';
import 'highlight.js/styles/github-dark.css';
import './styles/index.css';
import App from './App.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
createRoot(document.getElementById('root')).render(<SettingsProvider><App /></SettingsProvider>);
