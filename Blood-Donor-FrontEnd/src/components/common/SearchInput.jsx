function SearchInput({ label, value, onChange, placeholder, type = 'text', inputMode }) {
  return (
    <div className="search-input">
      {label && <label className="search-input__label">{label}</label>}
      <input
        type={type}
        inputMode={inputMode}
        className="search-input__field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default SearchInput;