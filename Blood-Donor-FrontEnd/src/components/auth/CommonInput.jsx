function CommonInput({
    id,
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    options,
  }) {
    const errorClass = error ? 'auth-form__input--error' : '';
  
    if (type === 'select') {
      return (
        <div className="auth-form__field">
          <label htmlFor={id} className="auth-form__label">{label}</label>
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            className={`auth-form__select ${errorClass}`}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {error && <span className="auth-form__error">{error}</span>}
        </div>
      );
    }
  
    return (
      <div className="auth-form__field">
        <label htmlFor={id} className="auth-form__label">{label}</label>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`auth-form__input ${errorClass}`}
        />
        {error && <span className="auth-form__error">{error}</span>}
      </div>
    );
  }
  
  export default CommonInput;