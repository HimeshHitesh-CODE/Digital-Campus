/**
 * Samskruti College of Engineering and Technology (College Code: 259)
 * SBTET Diploma PIN Validation Middleware & Utilities
 */

// Matches format: 2-digit batch + 259 + branch + 3-digit roll number (e.g., 24259-AI-025)
export const SAMSKRUTI_PIN_REGEX = /^[0-9]{2}259-(AI|CS|AIML|EC|EE|M|CIV|CSE)-[0-9]{3}$/i;

export const BRANCH_NAMES = {
  AI: 'Artificial Intelligence',
  CS: 'Computer Science & Engineering',
  CSE: 'Computer Science & Engineering',
  AIML: 'Artificial Intelligence & Machine Learning',
  EC: 'Electronics & Communication Engineering',
  EE: 'Electrical & Electronics Engineering',
  M: 'Mechanical Engineering',
  CIV: 'Civil Engineering',
};

/**
 * Validates PIN format against Samskruti College Diploma rules
 * @param {string} pin - Input PIN
 * @returns {{ isValid: boolean, normalizedPin: string, batch?: string, branch?: string, roll?: string, department?: string }}
 */
export const validateSamskrutiPin = (pin) => {
  if (!pin || typeof pin !== 'string') {
    return { isValid: false, normalizedPin: '' };
  }

  const cleanPin = pin.trim().toUpperCase();
  const match = cleanPin.match(SAMSKRUTI_PIN_REGEX);

  if (!match) {
    return { isValid: false, normalizedPin: cleanPin };
  }

  const parts = cleanPin.split('-');
  const batchYear = parts[0].substring(0, 2);
  const branch = parts[1];
  const roll = parts[2];

  return {
    isValid: true,
    normalizedPin: cleanPin,
    batch: `20${batchYear}`,
    curriculum: `C-${batchYear}`,
    branch,
    roll,
    department: BRANCH_NAMES[branch] || 'Engineering',
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
      message: `Invalid Samskruti College PIN format. Expected format: 24259-AI-025 or 24259-CS-025.`,
      example: '24259-AI-025',
    });
  }

  req.validatedPinData = result;
  next();
};
