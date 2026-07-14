import SignupForm from '../../components/auth/SignupForm';
import './RegisterPage.css';

function RegisterPage() {
  return (
    <div className="register-page">
      <div className="register-page__container">
        <header className="register-page__header">
          <h1 className="register-page__title">Blood Donor</h1>
          <p className="register-page__subtitle">Create your account</p>
        </header>

        <div className="register-page__card">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;