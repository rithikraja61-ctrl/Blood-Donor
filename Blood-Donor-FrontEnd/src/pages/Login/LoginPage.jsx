import LoginForm from '../../components/auth/LoginForm';
import './LoginPage.css';

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-page__container">
        <header className="login-page__header">
          <h1 className="login-page__title">Blood Donor</h1>
          <p className="login-page__subtitle">
            Connecting Blood Donors with Patients.
          </p>
        </header>

        <div className="login-page__card">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;