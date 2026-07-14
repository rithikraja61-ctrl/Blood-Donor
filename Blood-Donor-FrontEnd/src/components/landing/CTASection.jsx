import { useNavigate } from 'react-router-dom';

function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="cta section">
      <div className="container">
        <div className="cta__card fade-in">
          <h2 className="cta__title">Be Someone&apos;s Lifeline Today</h2>
          <p className="cta__text">
            Join thousands of donors and healthcare partners making a real difference.
          </p>
          <div className="cta__buttons">
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={() => navigate('/register')}
            >
              Become Donor
            </button>
            <button
              type="button"
              className="btn btn--white btn--lg"
              onClick={() => navigate('/register')}
            >
              Register Hospital
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;