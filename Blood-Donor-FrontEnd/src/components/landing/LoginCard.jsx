import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import BloodShieldIcon from '../icons/BloodShieldIcon';

function LoginCard() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/login');
  };

  return (
    <GlassCard
      clickable
      onClick={handleClick}
      ariaLabel="Navigate to Login page"
    >
      <BloodShieldIcon className="glass-card__icon" />
      <h2 className="glass-card__heading">Login</h2>
      <p className="glass-card__description">
        Existing members sign in to continue.
      </p>
    </GlassCard>
  );
}

export default LoginCard;