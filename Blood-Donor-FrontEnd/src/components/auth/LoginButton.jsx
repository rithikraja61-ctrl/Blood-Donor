function LoginButton({ loading = false }) {
    return (
      <button
        type="submit"
        className="login-btn"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    );
  }
  
  export default LoginButton;