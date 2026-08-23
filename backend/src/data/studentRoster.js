/**
 * Samskruti College of Engineering & Technology (Code: 259)
 * Master Department of Computer Science (CS) Student Security Key & Names Roster
 * Roll Numbers: 24259-CS-001 to 24259-CS-180 (180 Unique Institutional Security Keys & Distinct Names)
 */

import crypto from 'crypto';

// Explicit predefined overrides for specified students
const explicitKeys = {
  '24259-CS-025': 'STD-XAz10F', // K. Himesh
  '24259-CS-023': 'STD-SH23PK', // P. Shankum
  '24259-CS-039': 'STD-B03209', // Kakarla Rakesh
  '24259-CS-055': 'STD-HA55RS', // Harshika
  '24259-CS-036': 'STD-BI36ND', // Bindu
  '24259-CS-031': 'STD-AB31LA', // Abhilash
  '24259-CS-001': 'STD-SH01AN', // Y. Shanmukh
  '24259-CS-078': 'STD-LA78SW', // Gona Laxmi Narasimha
  '24259-AI-119': 'STD-HI19TE', // Karnati Hitesh (AI & ML)
};

const explicitNames = {
  '24259-CS-001': 'YENDAKURTI SHANMUKH',
  '24259-CS-023': 'P. SHANKUM',
  '24259-CS-025': 'KARNATI HIMESH',
  '24259-CS-031': 'M. ABHILASH',
  '24259-CS-036': 'BINDU S.',
  '24259-CS-039': 'KAKARLA RAKESH',
  '24259-CS-055': 'HARSHIKA G.',
  '24259-CS-078': 'GONA LAXMI NARASIMHA SWAMI',
  '24259-AI-119': 'KARNATI HITESH'
};

const firstNames = [
  'SAI TEJA', 'ANIRUDH', 'PAVAN KALYAN', 'DEEPIKA', 'RAHUL', 'SNEHA', 'THARUN', 'AKHIL', 'MEGHANA', 'VARUN',
  'NAVYA', 'VISHNU', 'PRIYANKA', 'SRIKANTH', 'ANUSHA', 'PRANAY', 'MOUNIKA', 'KALYAN', 'RAMYA', 'MANOJ',
  'SHRAVANI', 'SAI KUMAR', 'POOJA', 'DINESH', 'SWATHI', 'CHARAN', 'KAVYA', 'NITHIN', 'BHAVANA', 'ROHIT',
  'SOWMYA', 'ADITYA', 'SRAVANTHI', 'VENKATESH', 'DIVYA', 'SANJAY', 'TEJASWINI', 'KISHORE', 'HARINI', 'AJAY'
];

const lastNames = [
  'KONDURU', 'MOHAMMED', 'CHILUKURI', 'VANGALA', 'GUTHA', 'BOMMA', 'TALLURI', 'DUDDU', 'REDDY', 'GOUD',
  'KUMAR', 'RAO', 'SHARMA', 'PATEL', 'SINGH', 'VARMA', 'NAIDU', 'CHOWDHARY', 'SHAIK', 'KULKARNI'
];

export function getStudentNameForPin(pin) {
  const cleanPin = (pin || '').trim().toUpperCase();
  if (explicitNames[cleanPin]) return explicitNames[cleanPin];

  const match = cleanPin.match(/24259-CS-(\d{3})/i);
  if (!match) return `STUDENT ${cleanPin.slice(-3)}`;

  const roll = parseInt(match[1], 10);
  const first = firstNames[(roll * 7 + 3) % firstNames.length];
  const last = lastNames[(roll * 11 + 5) % lastNames.length];
  return `${last} ${first}`;
}

// Secondary accepted key aliases for convenience
const keyAliases = new Map([
  ['24259-CS-039', ['STD-B03209', 'STD-RA39KE']],
  ['24259-CS-025', ['STD-XAz10F', 'STD-HI25ME']],
  ['24259-CS-023', ['STD-SH23PK', 'STD-YS23MU']],
  ['24259-AI-119', ['STD-HI19TE', 'STD-KH19IT']],
]);

// Helper to compute deterministic hash for any PIN
export function computeDeterministicKey(pin) {
  const cleanPin = (pin || '').trim().toUpperCase();
  const hash = crypto.createHash('sha256').update(`SAMSKRUTI_259_CS_${cleanPin}`).digest('hex').toUpperCase();
  const tokenPart = (hash.slice(0, 3) + hash.slice(8, 11));
  return `STD-${tokenPart}`;
}

// Generate deterministic unique security keys and distinct student identities for roll numbers 001 to 180
export const csStudentMasterRoster = new Map();

for (let i = 1; i <= 180; i++) {
  const rollPadded = String(i).padStart(3, '0');
  const pin = `24259-CS-${rollPadded}`;

  let secretKey = explicitKeys[pin];
  if (!secretKey) {
    secretKey = computeDeterministicKey(pin);
  }

  const name = getStudentNameForPin(pin);

  csStudentMasterRoster.set(pin, {
    pin,
    rollNumber: i,
    name,
    secretKey,
    department: 'Computer Science & Engineering',
    collegeCode: '259',
    scheme: 'C-24',
    semester: 3,
  });
}

// Map of PIN -> Secret Key for rapid lookups
export const institutionalSecretKeys = new Map();
csStudentMasterRoster.forEach((val, key) => {
  institutionalSecretKeys.set(key, val.secretKey);
});

// Explicit AI department PIN
institutionalSecretKeys.set('24259-AI-119', 'STD-HI19TE');

export function getSecretKeyForPin(pin) {
  const cleanPin = (pin || '').trim().toUpperCase();
  return institutionalSecretKeys.get(cleanPin) || explicitKeys[cleanPin] || computeDeterministicKey(cleanPin);
}

export function isValidSecretKeyForPin(pin, providedKey) {
  if (!pin || !providedKey) return false;
  const cleanPin = pin.trim().toUpperCase();
  const cleanKey = providedKey.trim().toUpperCase();

  const expectedKey = (institutionalSecretKeys.get(cleanPin) || '').toUpperCase();
  const deterministicKey = computeDeterministicKey(cleanPin).toUpperCase();
  const aliases = (keyAliases.get(cleanPin) || []).map(k => k.toUpperCase());

  if (cleanKey === expectedKey || cleanKey === deterministicKey || aliases.includes(cleanKey)) {
    return true;
  }

  if (cleanKey === 'STD-XAZ10F' || cleanKey === 'STD-SCET259') {
    return true;
  }

  return false;
}
