import { useRef, useState, useEffect } from 'react';

const ROLES = ['User', 'Donor', 'Hospital', 'Blood Bank'];

function RoleSelector({ activeRole, onRoleChange }) {
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeIndex = ROLES.indexOf(activeRole);
    const buttons = container.querySelectorAll('.role-selector__btn');
    const activeBtn = buttons[activeIndex];

    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      });
    }
  }, [activeRole]);

  return (
    <div className="role-selector">
      <p className="role-selector__label">Select Your Role</p>
      <div className="role-selector__track" ref={containerRef}>
        <span
          className="role-selector__indicator"
          style={{
            transform: `translateX(${indicatorStyle.left}px)`,
            width: `${indicatorStyle.width}px`,
          }}
        />
        {ROLES.map((role) => (
          <button
            key={role}
            type="button"
            className={`role-selector__btn ${
              activeRole === role ? 'role-selector__btn--active' : ''
            }`}
            onClick={() => onRoleChange(role)}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RoleSelector;