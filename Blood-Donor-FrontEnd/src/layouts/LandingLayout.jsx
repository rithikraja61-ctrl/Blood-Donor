import '../styles/landing.css';

function LandingLayout({ children }) {
  return (
    <div className="landing-layout">
      <div className="landing-layout__bg" aria-hidden="true" />
      <div className="landing-layout__overlay" aria-hidden="true" />
      <div className="landing-layout__content">{children}</div>
    </div>
  );
}

export default LandingLayout;