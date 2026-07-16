import DonorCard from './DonorCard';
import EmptyState from '../common/EmptyState';

function DonorList({ donors }) {
  if (donors.length === 0) {
    return <EmptyState message="No donors found. Try changing your filters." />;
  }

  return (
    <div className="donor-list">
      {donors.map((donor) => (
        <DonorCard key={donor.id} donor={donor} />
      ))}
    </div>
  );
}

export default DonorList;