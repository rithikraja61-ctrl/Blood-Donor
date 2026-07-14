function BloodDropLogo({ className = '' }) {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M32 4C32 4 10 30 10 44C10 54.4934 18.5066 63 29 63H35C45.4934 63 54 54.4934 54 44C54 30 32 4 32 4Z"
          fill="url(#dropGradient)"
        />
        <path
          d="M32 18C32 18 22 32 22 40C22 44.4183 25.5817 48 30 48H34C38.4183 48 42 44.4183 42 40C42 32 32 18 32 18Z"
          fill="rgba(255,255,255,0.25)"
        />
        <defs>
          <linearGradient id="dropGradient" x1="32" y1="4" x2="32" y2="63" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e63946" />
            <stop offset="1" stopColor="#c41e3a" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  
  export default BloodDropLogo;