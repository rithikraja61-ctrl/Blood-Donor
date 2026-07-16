function SearchInput({ label, value, onChange, placeholder }) {
    return (
      <div className="search-input">
        {label && <label className="search-input__label">{label}</label>}
        <input
          type="text"
          className="search-input__field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  }
  
  export default SearchInput;