const FEATURES = [
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="20" stroke="#c41e3a" strokeWidth="2" fill="#fce8ea" />
          <circle cx="24" cy="20" r="6" stroke="#c41e3a" strokeWidth="2" />
          <path d="M14 38 C14 32 18 28 24 28 C30 28 34 32 34 38" stroke="#c41e3a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="36" cy="16" r="6" fill="#e63946" />
          <path d="M36 13 V19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M33 16 H39" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      title: 'Find Nearby Donors',
      description: 'Locate compatible blood donors in your area during critical emergencies.',
    },
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="8" y="12" width="32" height="28" rx="6" stroke="#c41e3a" strokeWidth="2" fill="#fce8ea" />
          <path d="M24 20 V32" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M18 26 H30" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="36" cy="12" r="6" fill="#e63946" />
        </svg>
      ),
      title: 'Emergency Blood Request',
      description: 'Raise urgent blood requests and get faster responses when every minute counts.',
    },
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 6 L8 14 V24 C8 34 15 42 24 44 C33 42 40 34 40 24 V14 L24 6Z" stroke="#c41e3a" strokeWidth="2" fill="#fce8ea" />
          <path d="M18 24 L22 28 L30 20" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Verified Blood Banks',
      description: 'Access trusted and verified blood banks with accurate availability information.',
    },
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="10" y="16" width="28" height="24" rx="4" stroke="#c41e3a" strokeWidth="2" fill="#fce8ea" />
          <path d="M10 24 H38" stroke="#c41e3a" strokeWidth="2" />
          <rect x="18" y="8" width="12" height="8" rx="2" stroke="#c41e3a" strokeWidth="2" fill="#ffffff" />
          <path d="M24 28 V34" stroke="#e63946" strokeWidth="2" strokeLinecap="round" />
          <path d="M21 31 H27" stroke="#e63946" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      title: 'Hospital Collaboration',
      description: 'Enable hospitals to coordinate blood needs efficiently with donors and banks.',
    },
  ];
  
  function FeaturesSection() {
    return (
      <section id="features" className="features section">
        <div className="container">
          <div className="section-header fade-in">
            <h2 className="section-header__title">Platform Features</h2>
            <p className="section-header__subtitle">
              Everything you need for fast, reliable blood donation support
            </p>
          </div>
          <div className="features__grid">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="feature-card fade-in">
                <div className="feature-card__icon">{feature.icon}</div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__desc">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  export default FeaturesSection;