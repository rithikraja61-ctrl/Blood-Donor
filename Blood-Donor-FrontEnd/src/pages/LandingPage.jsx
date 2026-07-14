import '../styles/landing.css';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import AboutSection from '../components/landing/AboutSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

function LandingPage() {
  return (
    <div className="landing">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;