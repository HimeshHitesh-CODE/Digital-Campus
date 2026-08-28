/**
 * Samskruti College of Engineering & Technology (Code: 259)
 * Multi-Year & Multi-Branch Student Security Roster Generator
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BRANCHES = [
  { code: 'CS', name: 'Computer Science & Engineering', count: 180 },
  { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', count: 60 },
  { code: 'EC', name: 'Electronics & Communication Engineering', count: 60 },
  { code: 'EEE', name: 'Electrical & Electronics Engineering', count: 60 },
  { code: 'CE', name: 'Civil Engineering', count: 60 },
  { code: 'ME', name: 'Mechanical Engineering', count: 60 }
];

export const YEARS = [
  { year: 1, batchPrefix: '25259', scheme: 'C-24', defaultSem: 1 },
  { year: 2, batchPrefix: '24259', scheme: 'C-24', defaultSem: 3 },
  { year: 3, batchPrefix: '23259', scheme: 'C-21', defaultSem: 5 }
];

export function generateInstitutionalKey(branch, pin) {
  const cleanPin = (pin || '').trim().toUpperCase();
  const cleanBranch = (branch || '').trim().toUpperCase();
  const hash = crypto.createHash('sha256').update(`${cleanBranch}-${cleanPin}-SCET-2026`).digest('hex');
  return `STD-${hash.substring(0, 6).toUpperCase()}`;
}

export function seedFullRoster() {
  const allStudents = [];
  
  YEARS.forEach(y => {
    BRANCHES.forEach(b => {
      for (let i = 1; i <= b.count; i++) {
        const padIndex = String(i).padStart(3, '0');
        const pin = `${y.batchPrefix}-${b.code}-${padIndex}`;
        allStudents.push({
          pin,
          rollNumber: i,
          branch: b.code,
          department: b.name,
          year: y.year,
          scheme: y.scheme,
          semester: y.defaultSem,
          securityKey: generateInstitutionalKey(b.code, pin),
          collegeCode: '259',
          isRegistered: false
        });
      }
    });
  });

  return allStudents;
}

// Run stand-alone if executed directly
if (process.argv[1] === __filename) {
  const roster = seedFullRoster();
  console.log(`Generated ${roster.length} student records across 6 branches and 3 academic years.`);
  const outputPath = path.join(__dirname, '../src/data/fullRoster.json');
  fs.writeFileSync(outputPath, JSON.stringify(roster, null, 2), 'utf-8');
  console.log(`Saved full roster to: ${outputPath}`);
}
