import { useNavigate } from 'react-router-dom';
import HeroIllustration from './HeroIllustration';

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="home" className="hero">
      <div className="hero__bg-pattern" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__content fade-in">
          <h1 className="hero__title">
            Connecting Blood Donors with Lives That Need Them
          </h1>
          <p className="hero__text">
            Blood Donor helps patients, hospitals, blood banks and voluntary
            donors connect quickly during emergencies.
          </p>
          <div className="hero__buttons">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
          </div>
        </div>
        <div className="hero__visual fade-in fade-in--delay">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;