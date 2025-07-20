import React from 'react';
import { createRoot } from 'react-dom/client';

import { BrowserRouter } from "react-router-dom"
import './index.css';
import App from './App';
import ModalContextProvider from './Contexts/ModalContext.js'
import DictionaryContextProvider from './Contexts/DictionaryContext.js'
import reportWebVitals from './reportWebVitals';

// Create a root using the new createRoot API
const container = document.getElementById('root');
const root = createRoot(container);

// Render your app using the root
root.render(
  <React.StrictMode>
   <BrowserRouter>
     <ModalContextProvider>
       <DictionaryContextProvider>
        <App />
       </DictionaryContextProvider>
     </ModalContextProvider>
   </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
