function FilterSelect({ label, value, onChange, options }) {
    return (
      <div className="filter-select">
        {label && <label className="filter-select__label">{label}</label>}
        <select className="filter-select__field" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
      </div>
    );
  }
  
  export default FilterSelect;