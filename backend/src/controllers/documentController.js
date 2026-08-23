/**
 * Document Logistics Controller
 * Manages certificate applications, HOD approval queues, collection OTPs, and rejection reasons.
 */

// In-memory document requests store
export const documentRequests = [
  {
    id: 'doc_req_101',
    pin: '24259-CS-025',
    studentName: 'K. Himesh',
    branch: 'Computer Science & Engineering',
    docType: 'BONAFIDE',
    docTitle: 'Bonafide Certificate',
    purpose: 'State E-Pass Scholarship Application',
    copies: 2,
    attendancePct: 88.5,
    status: 'PENDING',
    createdAt: '2026-08-21T09:30:00.000Z'
  },
  {
    id: 'doc_req_102',
    pin: '24259-CS-039',
    studentName: 'Kakarla Rakesh',
    branch: 'Computer Science & Engineering',
    docType: 'INTERNSHIP_NOC',
    docTitle: 'Industrial Internship No-Objection Certificate (NOC)',
    purpose: 'Summer Cloud AI Industry Internship at CyberCity Tech Labs',
    copies: 1,
    attendancePct: 26.6,
    status: 'PENDING',
    createdAt: '2026-08-22T14:15:00.000Z'
  },
  {
    id: 'doc_req_103',
    pin: '24259-CS-023',
    studentName: 'P. Shankum (Y. Shanmukh)',
    branch: 'Computer Science & Engineering',
    docType: 'CUSTODIAN',
    docTitle: 'Custodian Certificate (Original Certificates Custody)',
    purpose: 'Passport Office Police Verification & Visa Processing',
    copies: 1,
    attendancePct: 78.4,
    status: 'PENDING',
    createdAt: '2026-08-23T11:00:00.000Z'
  }
];

/**
 * Get active document requests for student
 */
export const getStudentDocRequests = (req, res) => {
  const pin = (req.query.pin || req.user?.sbtetPin || req.user?.rollNumber || '').trim().toUpperCase();
  const requests = pin
    ? documentRequests.filter(d => d.pin.toUpperCase() === pin)
    : documentRequests;

  return res.status(200).json({
    success: true,
    requests
  });
};

/**
 * Get pending documents queue for HOD
 */
export const getPendingHODDocRequests = (req, res) => {
  const pending = documentRequests.filter(d => d.status === 'PENDING');
  return res.status(200).json({
    success: true,
    totalPending: pending.length,
    requests: pending
  });
};

/**
 * Submit new document request (Standard or Custom)
 */
export const submitDocRequest = (req, res) => {
  const { docType, customTitle, customFormat, purpose, copies, studentName, pin, branch } = req.body;

  const activePin = (pin || req.user?.sbtetPin || req.user?.rollNumber || 'STUDENT').trim().toUpperCase();
  const title = docType === 'CUSTOM'
    ? (customTitle || 'Custom Certificate Request')
    : getDocTitle(docType);

  const newDoc = {
    id: `doc_req_${Date.now()}`,
    pin: activePin,
    studentName: studentName || req.user?.name || 'Student',
    branch: branch || req.user?.department || 'Diploma Engineering',
    docType,
    customTitle: docType === 'CUSTOM' ? customTitle : undefined,
    customFormat: docType === 'CUSTOM' ? customFormat : undefined,
    docTitle: title,
    purpose: purpose || 'Official verification',
    copies: parseInt(copies, 10) || 1,
    attendancePct: 75.0,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  documentRequests.unshift(newDoc);

  return res.status(201).json({
    success: true,
    message: 'Document request submitted to HOD approval queue.',
    request: newDoc
  });
};

/**
 * Process HOD Decision: Approve or Reject
 */
export const processDocDecision = (req, res) => {
  const { requestId, id, action, rejectionReason } = req.body;
  const targetId = requestId || id;

  const doc = documentRequests.find(d => d.id === targetId);
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document request not found.' });
  }

  if (action === 'APPROVE') {
    // Generate random 6-digit collection OTP
    const rawOtp = String(Math.floor(100000 + Math.random() * 900000));
    const formattedOtp = `${rawOtp.slice(0, 3)} ${rawOtp.slice(3)}`;

    doc.status = 'APPROVED';
    doc.approvedAt = new Date().toISOString();
    doc.approvedBy = 'Prof. Vamshi Krishna (HOD CS)';
    doc.counterOtp = formattedOtp;
    doc.pickupLocation = 'Administrative Block — Counter #2';

    return res.status(200).json({
      success: true,
      message: `Document request approved for ${doc.pin}. Collection OTP: ${formattedOtp}`,
      request: doc,
      otp: formattedOtp
    });
  } else if (action === 'REJECT') {
    doc.status = 'REJECTED';
    doc.rejectedAt = new Date().toISOString();
    doc.rejectedBy = 'Prof. Vamshi Krishna (HOD CS)';
    doc.rejectionReason = rejectionReason || 'Attendance below mandatory institutional threshold or incomplete supporting credentials.';

    return res.status(200).json({
      success: true,
      message: `Document request rejected for ${doc.pin}.`,
      request: doc,
      reason: doc.rejectionReason
    });
  }

  return res.status(400).json({ success: false, message: 'Invalid action. Must be APPROVE or REJECT.' });
};

function getDocTitle(type) {
  switch (type) {
    case 'BONAFIDE': return 'Bonafide Certificate';
    case 'STUDY_CONDUCT': return 'Study & Conduct Certificate';
    case 'CUSTODIAN': return 'Custodian Certificate';
    case 'TRANSCRIPT': return 'Official Academic Transcript (Consolidated)';
    case 'INTERNSHIP_NOC': return 'Industrial Internship No-Objection Certificate (NOC)';
    case 'FEE_ESTIMATE': return 'Tuition Fee Estimation Letter (Bank Loan)';
    default: return 'Institutional Certificate Request';
  }
}
