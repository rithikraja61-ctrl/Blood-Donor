import { useNavigate } from 'react-router-dom';

function SignupPrompt() {
  const navigate = useNavigate();

  return (
    <div className="signup-prompt">
      <div className="signup-prompt__divider" />
      <p className="signup-prompt__text">If you are a new user,</p>
      <button
        type="button"
        className="signup-prompt__btn"
        onClick={() => navigate('/register')}
      >
        Sign Up
      </button>
    </div>
  );
}

export default SignupPrompt;