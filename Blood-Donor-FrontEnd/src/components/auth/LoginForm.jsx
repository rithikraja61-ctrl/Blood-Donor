import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/apiClient';
import { getPostLoginRoute } from '../../utils/roleRoutes';
import RoleSlider from './RoleSlider';
import LoginButton from './LoginButton';
import SignupPrompt from './SignupPrompt';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeRole, setActiveRole] = useState('User');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validate()) return;

    setLoading(true);

    try {
      const authData = await login(activeRole, email, password);
      navigate(getPostLoginRoute(authData.role), { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setLoginError('Invalid email or password.');
      } else if (err instanceof ApiError && err.fieldErrors) {
        setErrors(err.fieldErrors);
        setLoginError(err.message);
      } else {
        setLoginError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <RoleSlider activeRole={activeRole} onRoleChange={setActiveRole} />

      <div className="login-form__field">
        <label htmlFor="email" className="login-form__label">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className={`login-form__input ${errors.email ? 'login-form__input--error' : ''}`}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            setLoginError('');
          }}
          placeholder="Enter your email"
          autoComplete="email"
        />
        {errors.email && (
          <span className="login-form__error">{errors.email}</span>
        )}
      </div>

      <div className="login-form__field">
        <label htmlFor="password" className="login-form__label">
          Password
        </label>
        <input
          id="password"
          type="password"
          className={`login-form__input ${errors.password ? 'login-form__input--error' : ''}`}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            setLoginError('');
          }}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        {errors.password && (
          <span className="login-form__error">{errors.password}</span>
        )}
      </div>

      {loginError && (
        <div className="login-form__login-error">{loginError}</div>
      )}

      <LoginButton loading={loading} />
      <SignupPrompt />
    </form>
  );
}

export default LoginForm;