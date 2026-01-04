// import { Routes, Route } from 'react-router-dom';
// import MainLayout from './layouts/MainLayout.tsx';     // ← Add .tsx
// import Home from './pages/Home.tsx';                   // ← Add .tsx
// import Login from './pages/Login.tsx';                 // ← Add .tsx
// import Register from './pages/Register.tsx';           // ← Add .tsx
// import ProtectedRoute from './components/ProtectedRoute.tsx'; // ← Add .tsx

// const App = () => (
//   <Routes>
//     <Route element={<MainLayout />}>
//       <Route path="/" element={<Home />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />

//       {/* Protected example */}
//       <Route element={<ProtectedRoute />}>
//         <Route path="/dashboard" element={<div>User Dashboard</div>} />
//       </Route>

//       {/* Admin example */}
//       <Route element={<ProtectedRoute adminOnly />}>
//         <Route path="/admin" element={<div>Admin Panel</div>} />
//       </Route>
//     </Route>
//   </Routes>
// );

// export default App;

import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';

const App = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Route>
  </Routes>
);

export default App;