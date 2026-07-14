import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import BloodDonorIcon from '../icons/BloodDonorIcon';

function SignupCard() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/register');
  };

  return (
    <GlassCard
      clickable
      onClick={handleClick}
      ariaLabel="Navigate to Sign Up page"
    >
      <BloodDonorIcon className="glass-card__icon" />
      <h2 className="glass-card__heading">Sign Up</h2>
      <p className="glass-card__description">
        New users can register and join our blood donation network.
      </p>
    </GlassCard>
  );
}

export default SignupCard;