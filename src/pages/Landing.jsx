import Navbar from '../components/Navbar';
import { Home } from '../components/Home.jsx';
import { Services } from '../components/Services.jsx';
import Payment from '../components/Payment.jsx';
import Gallery from '../components/Gallery.jsx';
import About from '../components/About';
import Footer from '../components/Footer.jsx';


export function Landing() {
  return (
    <>

      <Navbar />
      <Home />
      <Services />
      <Payment />
      <Gallery />
      <About />
      <Footer />

    </>
  );
}
