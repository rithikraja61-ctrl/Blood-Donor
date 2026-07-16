import { useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DonorSearchFilters from '../../components/donor/DonorSearchFilters';
import DonorList from '../../components/donor/DonorList';
import { DONORS } from './donorsData';
import '../../styles/find-donor.css';

const INITIAL = { search: '', bloodGroup: 'All', pincode: '', availability: 'All' };

function FindDonorPage() {
  const [filters, setFilters] = useState(INITIAL);

  const filteredDonors = useMemo(() => {
    return DONORS.filter((donor) => {
      const matchName = donor.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchBlood = filters.bloodGroup === 'All' || donor.bloodGroup === filters.bloodGroup;
      const matchPincode = !filters.pincode || donor.pincode.includes(filters.pincode);
      const matchAvailability = filters.availability === 'All' || donor.availability === filters.availability;
      return matchName && matchBlood && matchPincode && matchAvailability;
    });
  }, [filters]);

  return (
    <div className="find-donor-page">
      <PageHeader
        title="Find Donor"
        subtitle="Search available donors by blood group, pincode, and availability."
      />

      <DonorSearchFilters
        search={filters.search}
        bloodGroup={filters.bloodGroup}
        pincode={filters.pincode}
        availability={filters.availability}
        onSearchChange={(v) => setFilters((p) => ({ ...p, search: v }))}
        onBloodGroupChange={(v) => setFilters((p) => ({ ...p, bloodGroup: v }))}
        onPincodeChange={(v) => setFilters((p) => ({ ...p, pincode: v.replace(/\D/g, '').slice(0, 6) }))}
        onAvailabilityChange={(v) => setFilters((p) => ({ ...p, availability: v }))}
        onReset={() => setFilters(INITIAL)}
      />

      <p className="find-donor-page__count">{filteredDonors.length} donor(s) found</p>
      <DonorList donors={filteredDonors} />
    </div>
  );
}

export default FindDonorPage;