/**
 * Samskruti College of Engineering & Technology (Institution Code: 259)
 * Multi-Branch Department HOD Master Accounts & Configurations
 */

export const HOD_ACCOUNTS = [
  {
    name: "Prof. Vamshi Krishna",
    username: "Vamshi-CS-HOD",
    aliases: ["VAMSHI-CS-HOD", "HOD-CSE-259", "VAMSHI-HOD"],
    email: "hod.cse@samskruti.ac.in",
    role: "HOD_CS",
    department: "Computer Science & Engineering",
    branchCode: "CS",
    password: "H-Gz25Do",
    fallbackPasswords: ["Vamshi@259", "Password123"],
    themeAccent: "#059669"
  },
  {
    name: "Prof. Padmini",
    username: "Padmini-AIML-HOD",
    aliases: ["PADMINI-AIML-HOD", "HOD-AIML-259", "PADMINI-HOD"],
    email: "hod.aiml@samskruti.ac.in",
    role: "HOD_AIML",
    department: "Artificial Intelligence & Machine Learning",
    branchCode: "AIML",
    password: "Padmini@259",
    fallbackPasswords: ["Password123", "HOD@259"],
    themeAccent: "#059669"
  },
  {
    name: "Prof. K. Satyanarayana",
    username: "Satya-ECE-HOD",
    aliases: ["SATYA-ECE-HOD", "HOD-ECE-259", "SATYANARAYANA-HOD"],
    email: "hod.ece@samskruti.ac.in",
    role: "HOD_EC",
    department: "Electronics & Communication Engineering",
    branchCode: "EC",
    password: "Satya@259",
    fallbackPasswords: ["Password123", "HOD@259"],
    themeAccent: "#059669"
  },
  {
    name: "Prof. M. Ramesh",
    username: "Ramesh-EEE-HOD",
    aliases: ["RAMESH-EEE-HOD", "HOD-EEE-259", "RAMESH-HOD"],
    email: "hod.eee@samskruti.ac.in",
    role: "HOD_EEE",
    department: "Electrical & Electronics Engineering",
    branchCode: "EEE",
    password: "Ramesh@259",
    fallbackPasswords: ["Password123", "HOD@259"],
    themeAccent: "#059669"
  },
  {
    name: "Prof. B. Suresh",
    username: "Suresh-CIVIL-HOD",
    aliases: ["SURESH-CIVIL-HOD", "HOD-CIVIL-259", "SURESH-HOD"],
    email: "hod.civil@samskruti.ac.in",
    role: "HOD_CE",
    department: "Civil Engineering",
    branchCode: "CE",
    password: "Suresh@259",
    fallbackPasswords: ["Password123", "HOD@259"],
    themeAccent: "#059669"
  },
  {
    name: "Prof. G. Venkatesh",
    username: "Venkatesh-MECH-HOD",
    aliases: ["VENKATESH-MECH-HOD", "HOD-MECH-259", "VENKATESH-HOD"],
    email: "hod.mech@samskruti.ac.in",
    role: "HOD_ME",
    department: "Mechanical Engineering",
    branchCode: "ME",
    password: "Venkatesh@259",
    fallbackPasswords: ["Password123", "HOD@259"],
    themeAccent: "#059669"
  }
];

export function findHODAccount(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim().toUpperCase();
  return HOD_ACCOUNTS.find(hod => 
    hod.username.toUpperCase() === clean ||
    hod.email.toUpperCase() === clean ||
    hod.role.toUpperCase() === clean ||
    hod.aliases.some(a => a.toUpperCase() === clean)
  ) || null;
}
