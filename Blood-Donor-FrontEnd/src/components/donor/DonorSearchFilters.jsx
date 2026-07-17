import SearchInput from '../common/SearchInput';
import FilterSelect from '../common/FilterSelect';
import { BLOOD_GROUPS } from '../../utils/constants';

const AVAILABILITY_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Available', label: 'Available' },
  { value: 'Unavailable', label: 'Unavailable' },
];

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
  return (
    <section className="donor-filters" aria-label="Donor search filters">
      <SearchInput
        label="Search by name"
        value={search}
        onChange={onSearchChange}
        placeholder="Donor name"
      />
      <FilterSelect
        label="Blood group"
        value={bloodGroup}
        onChange={onBloodGroupChange}
        options={BLOOD_GROUPS.map((g) => ({ value: g, label: g }))}
      />
      <SearchInput
        label="PIN code"
        value={pincode}
        onChange={onPincodeChange}
        placeholder="6-digit PIN"
        inputMode="numeric"
      />
      <FilterSelect
        label="Availability"
        value={availability}
        onChange={onAvailabilityChange}
        options={AVAILABILITY_OPTIONS}
      />
      <button type="button" className="donor-filters__reset" onClick={onReset}>
        Reset
      </button>
      <button
        type="button"
        className="donor-filters__search"
        onClick={onSearch}
        disabled={loading}
      >
        {loading ? 'Searching…' : 'Search donors'}
      </button>
    </section>
  );
}

export default DonorSearchFilters;
