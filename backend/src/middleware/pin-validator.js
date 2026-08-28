/**
 * Samskruti College of Engineering and Technology (College Code: 259)
 * SBTET Diploma PIN Validation Middleware & Utilities
 * Supports all 6 branches: CS/CSE, AIML/AI, EC/ECE, EE/EEE, CE/CIV/CIVIL, ME/M/MECH
 */

export const SAMSKRUTI_PIN_REGEX = /^[0-9]{2}259[-.]?(AI|CS|AIML|EC|ECE|EE|EEE|M|ME|MECH|CIV|CE|CIVIL|CSE)[-.]?[0-9]{1,3}$/i;

export const BRANCH_NAMES = {
  AI: 'Artificial Intelligence',
  AIML: 'Artificial Intelligence & Machine Learning',
  CS: 'Computer Science & Engineering',
  CSE: 'Computer Science & Engineering',
  EC: 'Electronics & Communication Engineering',
  ECE: 'Electronics & Communication Engineering',
  EE: 'Electrical & Electronics Engineering',
  EEE: 'Electrical & Electronics Engineering',
  M: 'Mechanical Engineering',
  ME: 'Mechanical Engineering',
  MECH: 'Mechanical Engineering',
  CIV: 'Civil Engineering',
  CE: 'Civil Engineering',
  CIVIL: 'Civil Engineering',
};

export const BRANCH_ALIASES = {
  AI: 'AIML',
  AIML: 'AIML',
  CS: 'CS',
  CSE: 'CS',
  EC: 'EC',
  ECE: 'EC',
  EE: 'EEE',
  EEE: 'EEE',
  M: 'ME',
  ME: 'ME',
  MECH: 'ME',
  CIV: 'CE',
  CE: 'CE',
  CIVIL: 'CE',
};

/**
 * Validates PIN format against Samskruti College Diploma rules
 * @param {string} pin - Input PIN
 * @returns {{ isValid: boolean, normalizedPin: string, batch?: string, branch?: string, roll?: string, department?: string, departmentCode?: string }}
 */
export const validateSamskrutiPin = (pin) => {
  if (!pin || typeof pin !== 'string') {
    return { isValid: false, normalizedPin: '' };
  }

  const raw = pin.trim().toUpperCase();
  const match = raw.match(/^([0-9]{2}259)[-.]?([A-Z]+)[-.]?([0-9]+)$/i);

  if (!match) {
    return { isValid: false, normalizedPin: raw };
  }

  const prefix = match[1];
  const rawBranch = match[2].toUpperCase();
  const rawRoll = match[3];

  if (!BRANCH_NAMES[rawBranch]) {
    return { isValid: false, normalizedPin: raw };
  }

  const batchYear = prefix.substring(0, 2);
  const normalizedRoll = String(parseInt(rawRoll, 10) || 1).padStart(3, '0');
  const standardBranch = BRANCH_ALIASES[rawBranch] || rawBranch;
  const normalizedPin = `${prefix}-${standardBranch}-${normalizedRoll}`;

  return {
    isValid: true,
    normalizedPin,
    batch: `20${batchYear}`,
    curriculum: `C-${batchYear}`,
    branch: standardBranch,
    departmentCode: standardBranch,
    roll: normalizedRoll,
    department: BRANCH_NAMES[rawBranch] || 'Engineering',
    collegeCode: '259',
    collegeName: 'Samskruti College of Engineering and Technology',
  };
};

/**
 * Express Middleware to validate PIN in request body or params
 */
export const validatePinMiddleware = (req, res, next) => {
  const pin = req.body.pin || req.query.pin || req.params.pin;
  if (!pin) {
    return res.status(400).json({
      success: false,
      message: 'Student Diploma PIN is required.',
    });
  }

  const result = validateSamskrutiPin(pin);
  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      message: `Invalid Samskruti College PIN format. Expected format: 24259-CS-025 or 24259-AIML-019.`,
      example: '24259-CS-025',
    });
  }

  req.validatedPinData = result;
  next();
};
