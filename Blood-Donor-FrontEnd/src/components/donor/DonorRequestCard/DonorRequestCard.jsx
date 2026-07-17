import './DonorRequestCard.css';

function DonorRequestCard({ request, onAccept, onReject, actionLoadingId }) {
  const isPending = request.status === 'PENDING';
  const isLoading = actionLoadingId === request.id;

  return (
    <article className="donor-request-card">
      <div className="donor-request-card__header">
        <span className={`donor-request-card__status donor-request-card__status--${request.status.toLowerCase()}`}>
          {request.status}
        </span>
        <span className="donor-request-card__emergency">{request.emergencyLevel}</span>
      </div>

      <h3 className="donor-request-card__title">{request.patientName}</h3>
      <p className="donor-request-card__meta">
        {request.requiredBloodGroupDisplay} · {request.unitsOfBloodRequired} unit(s)
      </p>
      <p className="donor-request-card__meta">
        Requester: {request.requesterName} ({request.requesterType})
      </p>
      <p className="donor-request-card__meta">
        Location: {request.requesterAddress}, {request.requesterPinCode}
      </p>
      <p className="donor-request-card__meta">
        Contact: {request.contactPersonName} · {request.contactPhoneNumber}
      </p>
      {request.reasonForBloodRequirement && (
        <p className="donor-request-card__reason">{request.reasonForBloodRequirement}</p>
      )}

      {isPending && (
        <div className="donor-request-card__actions">
          <button
            type="button"
            className="donor-request-card__accept"
            disabled={isLoading}
            onClick={() => onAccept(request.id)}
          >
            {isLoading ? 'Working…' : 'Accept'}
          </button>
          <button
            type="button"
            className="donor-request-card__reject"
            disabled={isLoading}
            onClick={() => onReject(request.id)}
          >
            Reject
          </button>
        </div>
      )}
    </article>
  );
}

export default DonorRequestCard;
