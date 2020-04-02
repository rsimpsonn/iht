const initRequest = payload => {
  const { to, client, subject, session } = payload;
  const start = session.start.toDate();
  const formatted = start.getMonth() + "/" + start.getDate();
  return `
  Dear ${to.firstName}, <br /><br />

${client.firstName} has requested you to tutor them in ${subject} on ${formatted}. &#10; Please accept this request on your dashboard within 24 hours of this email or it will automatically be declined. The request can be found on the "Requested Sessions" panel of your dashboard: <br /><br />

act;;
<br /><br />

Happy Tutoring, <br /><br />
ivybase
<br /><br />

  `;
};

const declinedRequest = payload => {
  const { tutor, to, session } = payload;
  const start = session.start.toDate();
  const formatted = start.getMonth() + "/" + start.getDate();
  return `
  Dear ${to.firstName}, <br /><br />

  Unfortunately, ${tutor.firstName} has declined your session on ${formatted}. Please try requesting another tutor on your dashboard. <br /><br />

  act;;
  <br /><br />

  Best, <br /><br />
  ivybase
  <br /><br />


  `;
};

const acceptedRequest = payload => {
  const { tutor, to, session } = payload;
  const start = session.start.toDate();
  const formatted = start.getMonth() + "/" + start.getDate();
  return `
  Dear ${to.firstName}, <br /><br />

  Your tutoring on ${formatted} has been accepted by ${tutor.firstName}! Please sign into your account at least 5 minutes before the tutoring session begins. <br /><br />

  Best, <br /><br />
  ivybase
  <br /><br />


  `;
};

const cancellation = payload => {
  const { to, cancelledBy, session } = payload;
  const start = session.start.toDate();
  const formatted = start.getMonth() + "/" + start.getDate();
  return `
  Dear ${to.firstName},<br /><br />

  Unfortunately, your upcoming session on ${formatted} with ${cancelledBy.firstName} has been cancelled. Enter your dashboard to schedule a new tutoring session.<br /><br />

  act;;
  <br /><br />

  Best, <br /><br />
  ivybase
  <br /><br />

  `;
};

const clientCancelledWithin24 = payload => {
  const { to, tutor, session, chargeAmount } = payload;
  const start = session.start.toDate();
  const formatted = start.getMonth() + "/" + start.getDate();
  return `
  Dear ${to.firstName}, <br /><br />

  We are sorry you could not attend your session with ${tutor.firstName} on ${formatted}. Unfortunately, you did not cancel the session at least 24 hours in advance. Your account has been charged $${chargeAmount}. Please sign in to your dashboard to schedule a new tutoring session.<br /><br />

  Best, <br /><br />
  ivybase
  <br /><br />


  `;
};

const firstWarning = payload => {
  const { client, to, session } = payload;
  const start = session.start.toDate();
  const formatted = start.getMonth() + "/" + start.getDate();
  return `
  Dear ${to.firstName}, <br /><br />

  We are sorry you could not attend your session with ${client.firstName} on ${formatted}. Unfortunately, you did not cancel the session at least 24 hours in advance. This is your first time not cancelling at least 24 hours in advance. Please remember that after your second time not cancelling at least 24 hours in advance you will not be allowed to tutor with ivybase.<br /><br />

  Best, <br /><br />
  ivybase
  <br /><br />


  `;
};

const termination = payload => {
  const { client, to, session } = payload;
  const start = session.start.toDate();
  const formatted = start.getMonth() + "/" + start.getDate();
  return `
  Dear ${to.firstName}, <br /><br />

  We are sorry you could not attend your session with ${client.firstName} on ${formatted}. Unfortunately, you did not cancel the session at least 24 hours in advance. This is your second time not cancelling at least 24 hours in advance. Unfortunately, you have broken our policy of not cancelling a tutoring session at least 24 hours in advance the maximum number of times. We have permanently shut down your account. <br /><br />

  If you believe this may be a mistake, please contact our customer support at ivybasetutors@gmail.com. <br /><br />

  Best, <br /><br />
  ivybase
  <br /><br />

  `;
};

const completedSessionTutor = payload => {
  const { client, to, session, chargeAmount } = payload;
  const start = session.start.toDate();
  const formatted = start.getMonth() + "/" + start.getDate();
  return `
  Dear ${to.firstName}, <br /><br />

  Thank you for tutoring ${client.firstName} on ${formatted}. We hope you enjoyed the session! You have been transferred $${chargeAmount} for completing this tutoring session. <br /><br />

  Happy Tutoring, <br /><br />
  ivybase
  <br /><br />


  `;
};

const completedSessionClient = payload => {
  const { to, tutor, session, chargeAmount } = payload;
  const start = session.start.toDate();
  const formatted = start.getMonth() + "/" + start.getDate();
  return `
  Dear ${to.firstName}, <br /><br />

  We hope you enjoyed your tutoring session with ${tutor.firstName} on ${formatted}! You were successfully billed $${chargeAmount} for this tutoring session. We love to hear feedback on our tutors, so please rate ${tutor.firstName} at the end of this email. Sign in to your dashboard to schedule another tutoring session. <br /><br />

  act;;
  <br /><br />

  Best, <br /><br />
  ivybase
  <br /><br />

  `;
};

const verified = payload => {
  const { to, type } = payload;
  return `
  Dear ${to.firstName}, <br /><br />

  You have successfully updated your ${type}. If you did not update this information please email ivybasetutors@gmail.com. <br /><br />

  Best, <br /><br />
  ivybase
  <br /><br />

  `;
};

const reviewedTranscript = payload => {
  const { to } = payload;
  return `
  Dear ${to.firstName}, <br /><br />

  We have reviewed and verified the unofficial transcript you submitted. You may have more steps to complete before you can start tutoring with ivybase. These are visible on your dashboard.

  act;;

  Best, <br /><br />
  ivybase
  <br /><br />
  `;
};

const declinedTranscript = payload => {
  const { to, reason } = payload;
  return `
  Dear ${to.firstName}, <br /><br />

  We have reviewed the unofficial transcript you submitted, but could not verify the transcript for the following reason: ${reason}<br /><br />

  You may resubmit another transcript on your dashboard.

  act;;

  Best, <br /><br />
  ivybase
  <br /><br />
  `;
};

const remindAvailability = payload => {
  const { to } = payload;
  return `
  Dear ${to.firstName}, <br /><br />

  Hope you had a wonderful week of tutoring! Please remember to enter your tutoring availability for next week by this Friday at 11:59pm EST. If you do not confirm your availability, you will not be considered available. <br /><br />

  act;;
  <br /><br />

  Happy Tutoring, <br /><br />
  ivybase
  <br /><br />

  `;
};

module.exports = {
  remindAvailability,
  completedSessionTutor,
  completedSessionClient,
  verified,
  termination,
  firstWarning,
  clientCancelledWithin24,
  cancellation,
  acceptedRequest,
  declinedRequest,
  initRequest,
  declinedTranscript,
  reviewedTranscript
};
