import SearchInput from '../common/SearchInput';
import FilterSelect from '../common/FilterSelect';
import { BLOOD_GROUPS } from '../../pages/FindDonor/donorsData';

function DonorSearchFilters({ search, bloodGroup, pincode, availability, onSearchChange, onBloodGroupChange, onPincodeChange, onAvailabilityChange, onReset }) {
  const bloodOptions = BLOOD_GROUPS.map((g) => ({ value: g, label: g }));
  const availabilityOptions = [
    { value: 'All', label: 'All' },
    { value: 'Available', label: 'Available' },
    { value: 'Unavailable', label: 'Unavailable' },
  ];

  return (
    <section className="donor-filters">
      <SearchInput label="Search by name" value={search} onChange={onSearchChange} placeholder="Enter donor name..." />
      <FilterSelect label="Blood group" value={bloodGroup} onChange={onBloodGroupChange} options={bloodOptions} />
      <SearchInput label="Pincode" value={pincode} onChange={onPincodeChange} placeholder="6-digit pincode" />
      <FilterSelect label="Availability" value={availability} onChange={onAvailabilityChange} options={availabilityOptions} />
      <button type="button" className="donor-filters__reset" onClick={onReset}>Reset Filters</button>
    </section>
  );
}

export default DonorSearchFilters;