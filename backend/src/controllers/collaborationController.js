/**
 * Collaboration Controller
 * Handles real-time student skill showcases, peer-to-peer collaboration requests, and messaging threads.
 */

// In-memory data stores (Clean state: populated dynamically by real registered student sessions)
const studentSkillsStore = new Map();

// Collaboration Requests Store
const collaborationRequests = [];

// Messages Thread Store
const chatThreads = new Map();

/**
 * Get all peer skill profiles
 */
export const getAllPeerSkills = (req, res) => {
  const peers = Array.from(studentSkillsStore.values());
  return res.status(200).json({
    success: true,
    peers
  });
};

/**
 * Get current user's skills
 */
export const getMySkills = (req, res) => {
  const pin = req.query.pin || req.user?.sbtetPin || req.user?.rollNumber;
  if (!pin) {
    return res.status(200).json({ success: true, skills: [] });
  }
  const profile = studentSkillsStore.get(pin) || { skills: [] };
  return res.status(200).json({
    success: true,
    skills: profile.skills || []
  });
};

/**
 * Update or publish student skills
 */
export const updateMySkills = (req, res) => {
  const pin = req.body.pin || req.user?.sbtetPin || req.user?.rollNumber;
  const skills = req.body.skills || [];
  const name = req.body.name || req.user?.name || 'Student';
  const branch = req.body.branch || req.user?.department || 'Engineering Student';

  if (!pin) {
    return res.status(400).json({ success: false, message: 'Student PIN is required.' });
  }

  const existing = studentSkillsStore.get(pin) || {
    name,
    pin,
    branch,
    year: 'Diploma C-24',
    status: 'Available for Projects'
  };

  existing.skills = skills;
  existing.name = name;
  existing.branch = branch;

  studentSkillsStore.set(pin, existing);

  return res.status(200).json({
    success: true,
    message: 'Skills published successfully.',
    skills
  });
};

/**
 * Send collaboration request
 */
export const sendCollaborationRequest = (req, res) => {
  const { recipientPin, recipientName, projectTitle, message, senderName, senderPin, senderBranch } = req.body;

  const newRequest = {
    id: `req_${Date.now()}`,
    senderPin: senderPin || req.user?.sbtetPin || 'Student',
    senderName: senderName || req.user?.name || 'Student',
    senderBranch: senderBranch || 'Engineering',
    recipientPin,
    recipientName,
    projectTitle,
    message,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  collaborationRequests.unshift(newRequest);

  return res.status(201).json({
    success: true,
    message: 'Collaboration request sent successfully.',
    request: newRequest
  });
};

/**
 * Get collaboration requests for active user
 */
export const getCollaborationRequests = (req, res) => {
  const pin = req.query.pin || req.user?.sbtetPin || req.user?.rollNumber;
  const requests = pin
    ? collaborationRequests.filter(r => r.recipientPin === pin || r.senderPin === pin)
    : collaborationRequests;

  return res.status(200).json({
    success: true,
    requests
  });
};

/**
 * Respond to collaboration request (Accept / Decline)
 */
export const respondToCollaboration = (req, res) => {
  const { requestId, status } = req.body;
  const request = collaborationRequests.find(r => r.id === requestId);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }

  request.status = status;

  if (status === 'ACCEPTED' && !chatThreads.has(requestId)) {
    chatThreads.set(requestId, [
      {
        senderPin: request.senderPin,
        senderName: request.senderName,
        text: `Hi! Thanks for accepting my invite for "${request.projectTitle}". Excited to collaborate!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }

  return res.status(200).json({
    success: true,
    message: `Request ${status.toLowerCase()} successfully.`,
    request
  });
};

/**
 * Get messages for a thread
 */
export const getThreadMessages = (req, res) => {
  const threadId = req.query.threadId;
  const messages = threadId ? (chatThreads.get(threadId) || []) : [];

  return res.status(200).json({
    success: true,
    messages
  });
};

/**
 * Post a new message in thread
 */
export const postThreadMessage = (req, res) => {
  const { threadId, text, senderPin, senderName } = req.body;
  if (!threadId || !text) {
    return res.status(400).json({ success: false, message: 'threadId and text are required.' });
  }

  const msg = {
    senderPin: senderPin || req.user?.sbtetPin || 'Student',
    senderName: senderName || req.user?.name || 'Student',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  if (!chatThreads.has(threadId)) {
    chatThreads.set(threadId, []);
  }

  chatThreads.get(threadId).push(msg);

  return res.status(201).json({
    success: true,
    message: 'Message sent.',
    msg
  });
};
