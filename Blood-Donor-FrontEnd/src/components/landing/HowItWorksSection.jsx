const STEPS = [
    { number: '1', title: 'Register', description: 'Create your account as a donor, patient, hospital, or blood bank.' },
    { number: '2', title: 'Verify', description: 'Complete verification to ensure trusted and secure connections.' },
    { number: '3', title: 'Request or Donate', description: 'Post a blood need or offer to donate when help is required.' },
    { number: '4', title: 'Connect Instantly', description: 'Get matched quickly with the right people during emergencies.' },
  ];
  
  function HowItWorksSection() {
    return (
      <section className="how-it-works section section--alt">
        <div className="container">
          <div className="section-header fade-in">
            <h2 className="section-header__title">How It Works</h2>
            <p className="section-header__subtitle">Four simple steps to save lives</p>
          </div>
          <div className="steps">
            {STEPS.map((step, index) => (
              <div key={step.number} className="steps__wrapper fade-in">
                <div className="step-card">
                  <span className="step-card__number">{step.number}</span>
                  <h3 className="step-card__title">{step.title}</h3>
                  <p className="step-card__desc">{step.description}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="steps__arrow" aria-hidden="true">
                    <span className="steps__arrow-line" />
                    <span className="steps__arrow-head">↓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  export default HowItWorksSection;