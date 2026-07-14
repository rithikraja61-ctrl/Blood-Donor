function BloodShieldIcon({ className = '' }) {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M32 4L8 14V30C8 44.3594 18.5 57.5 32 60C45.5 57.5 56 44.3594 56 30V14L32 4Z"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="rgba(196,30,58,0.15)"
        />
        <path
          d="M32 20C32 20 24 30 24 38C24 42.4183 27.5817 46 32 46C36.4183 46 40 42.4183 40 38C40 30 32 20 32 20Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  
  export default BloodShieldIcon;
  