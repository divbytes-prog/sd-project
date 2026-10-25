// Confirmed is a legacy spelling of Approved; existing places remain valid.
export const registrationStatus=r=>r.status==='Confirmed'?'Approved':r.status;
export const isApprovedRegistration=r=>registrationStatus(r)==='Approved';
export const isActiveRegistration=r=>['Pending','Approved'].includes(registrationStatus(r));
export const isReviewableRole=role=>['Approver','Administrator'].includes(role);
