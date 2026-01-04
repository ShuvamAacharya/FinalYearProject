// import { Outlet } from 'react-router-dom';
// import Navbar from '../components/Navbar.tsx';  // or without .tsx
// import MainLayout from './layouts/MainLayout';

// const MainLayout: React.FC = () => {
//   return (
//     <>
//       <Navbar />
//       <Outlet />  {/* This renders the matched child route (Home, Login, etc.) */}
//     </>
//   );
// };

// export default MainLayout;

import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // .tsx extension optional

const MainLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet /> {/* Renders Home / Login / Register */}
    </>
  );
};

export default MainLayout;
