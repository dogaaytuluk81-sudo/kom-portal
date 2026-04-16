import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ style: { zIndex: 999999 } }} />
      <App />
      <ToastContainer position="bottom-right" theme="colored" autoClose={5000} style={{ zIndex: 999999 }} />
    </BrowserRouter>
  </React.StrictMode>
);
