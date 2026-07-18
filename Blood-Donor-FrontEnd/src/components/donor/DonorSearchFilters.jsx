import SearchInput from '../common/SearchInput';
import FilterSelect from '../common/FilterSelect';
import { BLOOD_GROUPS } from '../../utils/constants';

const AVAILABILITY_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Available', label: 'Available' },
  { value: 'Unavailable', label: 'Unavailable' },
];

const RADIUS_OPTIONS = [
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '25', label: '25 km' },
  { value: '50', label: '50 km' },
];

function DonorSearchFilters({
  search,
  bloodGroup,
  pincode,
  availability,
  radiusKm,
  onSearchChange,
  onBloodGroupChange,
  onPincodeChange,
  onAvailabilityChange,
  onRadiusChange,
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
      <FilterSelect
        label="Search radius"
        value={String(radiusKm)}
        onChange={onRadiusChange}
        options={RADIUS_OPTIONS}
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
