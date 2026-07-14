function GlassCard({ children, className = '', clickable = false, onClick, ariaLabel }) {
    const cardClass = [
      'glass-card',
      clickable ? 'glass-card--clickable' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
  
    if (clickable) {
      return (
        <div
          className={cardClass}
          onClick={onClick}
          role="link"
          tabIndex={0}
          aria-label={ariaLabel}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick?.();
            }
          }}
        >
          {children}
        </div>
      );
    }
  
    return <div className={cardClass}>{children}</div>;
  }
  
  export default GlassCard;