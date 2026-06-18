import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// import './index.css'
import App from './App.jsx'
// import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React from "react";
import ReactDOM from "react-dom/client";


const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexAuthProvider>
   </React.StrictMode>
)
