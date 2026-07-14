import GlassCard from './GlassCard';

function WelcomeCard() {
  return (
    <GlassCard className="welcome-card">
      <h2 className="welcome-card__heading">Welcome to Blood Donor</h2>
      <div className="welcome-card__description">
        <p>
          Connecting blood donors, hospitals, blood banks, and patients using
          intelligent AI technology.
        </p>
        <p>
          Our platform helps people find compatible blood donors faster during
          emergencies.
        </p>
        <p>Every donation saves lives.</p>
        <p>Together we can build a healthier tomorrow.</p>
      </div>
      <button type="button" className="welcome-card__btn">
        Learn More
      </button>
    </GlassCard>
  );
}

export default WelcomeCard;