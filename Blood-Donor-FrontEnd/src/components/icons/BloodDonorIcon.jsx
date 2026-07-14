function BloodDonorIcon({ className = '' }) {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="32" cy="16" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path
          d="M16 56V44C16 38.4772 20.4772 34 26 34H38C43.5228 34 48 38.4772 48 44V56"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M32 34V26"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M32 46C32 46 28 42 28 38"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="32" cy="50" r="3" fill="currentColor" />
      </svg>
    );
  }
  
  export default BloodDonorIcon;