import SearchInput from '../common/SearchInput';
import FilterSelect from '../common/FilterSelect';
import { BLOOD_GROUPS } from '../../utils/constants';

function DonorSearchFilters({
  search,
  bloodGroup,
  pincode,
  availability,
  onSearchChange,
  onBloodGroupChange,
  onPincodeChange,
  onAvailabilityChange,
  onReset,
  onSearch,
  loading = false,
}) {
  const bloodOptions = BLOOD_GROUPS.map((g) => ({ value: g, label: g }));
  const availabilityOptions = [
    { value: 'All', label: 'All' },
    { value: 'Available', label: 'Available' },
    { value: 'Unavailable', label: 'Unavailable' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form className="donor-filters" onSubmit={handleSubmit}>
      <SearchInput
        label="Search by name"
        value={search}
        onChange={onSearchChange}
        placeholder="Filter results by name..."
      />
      <FilterSelect
        label="Blood group"
        value={bloodGroup}
        onChange={onBloodGroupChange}
        options={bloodOptions}
      />
      <SearchInput
        label="Pincode"
        value={pincode}
        onChange={onPincodeChange}
        placeholder="6-digit pincode"
        type="tel"
        inputMode="numeric"
      />
      <FilterSelect
        label="Availability"
        value={availability}
        onChange={onAvailabilityChange}
        options={availabilityOptions}
      />
      <button type="submit" className="donor-filters__search" disabled={loading}>
        {loading ? 'Searching...' : 'Search Donors'}
      </button>
      <button type="button" className="donor-filters__reset" onClick={onReset}>
        Reset Filters
      </button>
    </form>
  );
}

export default DonorSearchFilters;
