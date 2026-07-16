function DonorCard({ donor }) {
    const maskedPhone = donor.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2');
  
    return (
      <article className="donor-card">
        <div className="donor-card__header">
          <div className="donor-card__avatar">{donor.name.charAt(0)}</div>
          <div>
            <h3 className="donor-card__name">{donor.name}</h3>
            <span className="donor-card__blood">{donor.bloodGroup}</span>
          </div>
          <span className={`donor-card__badge donor-card__badge--${donor.availability.toLowerCase()}`}>
            {donor.availability}
          </span>
        </div>
  
        <ul className="donor-card__details">
          <li><strong>City:</strong> {donor.city}</li>
          <li><strong>Pincode:</strong> {donor.pincode}</li>
          <li><strong>Phone:</strong> {maskedPhone}</li>
          <li><strong>Last donation:</strong> {donor.lastDonation}</li>
          <li><strong>Distance:</strong> {donor.distanceKm} km</li>
        </ul>
  
        <button type="button" className="donor-card__btn" disabled={donor.availability === 'Unavailable'}>
          {donor.availability === 'Available' ? 'Request Donor' : 'Not Available'}
        </button>
      </article>
    );
  }
  
  export default DonorCard;