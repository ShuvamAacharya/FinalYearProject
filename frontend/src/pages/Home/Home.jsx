import Hero from '../../components/landing/Hero.jsx';
import Features from '../../components/landing/Features.jsx';
import Roles from '../../components/landing/Roles.jsx';
import Footer from '../../components/landing/Footer.jsx';
import Navbar from "./components/common/Navbar";

const Home = () => {
  return (
    <>
     <Navbar /> 
      <Hero />
      <Features />
      <Roles />
      <Footer />
    </>
  );
};

export default Home;