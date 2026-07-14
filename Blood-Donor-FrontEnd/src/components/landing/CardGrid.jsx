import LoginCard from './LoginCard';
import WelcomeCard from './WelcomeCard';
import SignupCard from './SignupCard';

function CardGrid() {
  return (
    <section className="card-grid" aria-label="Platform actions">
      <div className="card-grid__item card-grid__item--login">
        <LoginCard />
      </div>
      <div className="card-grid__item card-grid__item--welcome">
        <WelcomeCard />
      </div>
      <div className="card-grid__item card-grid__item--signup">
        <SignupCard />
      </div>
    </section>
  );
}

export default CardGrid;