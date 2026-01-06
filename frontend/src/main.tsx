// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.tsx';
// import './index.css';  // if you have this
// import { AuthProvider } from './context/AuthContext.tsx';
// import { BrowserRouter } from 'react-router-dom';  // ← Add this import

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <BrowserRouter>  {/* ← Wrap everything in BrowserRouter */}
//       <AuthProvider>
//         <App />
//       </AuthProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';  // ← Keep this

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>  {/* ← Only one BrowserRouter, here */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);