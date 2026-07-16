import { useCallback, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DonorSearchFilters from '../../components/donor/DonorSearchFilters';
import DonorList from '../../components/donor/DonorList';
import { searchDonors } from '../../services/donorService';
import { ApiError } from '../../services/apiClient';
import { mapDonorsFromApi } from '../../utils/donorMapper';
import '../../styles/find-donor.css';

const INITIAL = { search: '', bloodGroup: 'O+', pincode: '', availability: 'All' };

function FindDonorPage() {
  const [filters, setFilters] = useState(INITIAL);
  const [donors, setDonors] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async () => {
    setError('');

    if (!filters.bloodGroup || filters.bloodGroup === 'All') {
      setError('Please select a blood group to search.');
      return;
    }

    if (!/^[0-9]{6}$/.test(filters.pincode)) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }

    setLoading(true);

    try {
      const data = await searchDonors(filters.bloodGroup, filters.pincode);
      setDonors(mapDonorsFromApi(data.content));
      setHasSearched(true);
    } catch (err) {
      setDonors([]);
      setHasSearched(true);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch donors. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [filters.bloodGroup, filters.pincode]);

  const filteredDonors = useMemo(() => {
    return donors.filter((donor) => {
      const matchName = donor.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchAvailability =
        filters.availability === 'All' || donor.availability === filters.availability;
      return matchName && matchAvailability;
    });
  }, [donors, filters.search, filters.availability]);

  const handleReset = () => {
    setFilters(INITIAL);
    setDonors([]);
    setHasSearched(false);
    setError('');
  };

  return (
    <div className="find-donor-page">
      <PageHeader
        title="Find Donor"
        subtitle="Search available donors by blood group and pincode from the live database."
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
        onReset={handleReset}
        onSearch={handleSearch}
        loading={loading}
      />

      {error && <p className="find-donor-page__error">{error}</p>}

      {hasSearched && (
        <p className="find-donor-page__count">{filteredDonors.length} donor(s) found</p>
      )}

      {!hasSearched && !loading && (
        <p className="find-donor-page__hint">Select a blood group, enter pincode, and click Search.</p>
      )}

      {loading ? (
        <p className="find-donor-page__loading">Searching donors...</p>
      ) : (
        <DonorList donors={hasSearched ? filteredDonors : []} showEmpty={hasSearched} />
      )}
    </div>
  );
}

export default FindDonorPage;
