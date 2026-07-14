import CommonInput from './CommonInput';

function PasswordInput({ id, label, name, value, onChange, error, placeholder, autoComplete }) {
  return (
    <CommonInput
      id={id}
      label={label}
      name={name}
      type="password"
      value={value}
      onChange={onChange}
      error={error}
      placeholder={placeholder}
      autoComplete={autoComplete}
    />
  );
}

export default PasswordInput;