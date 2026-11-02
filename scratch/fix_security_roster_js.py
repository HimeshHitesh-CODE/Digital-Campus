path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\security-roster.js"

with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# Replace loadDepartmentRoster
old_load = """function loadDepartmentRoster(dept) {
  activeDepartment = dept;
  if (dept === 'AIML' || dept === 'CS') {
    localStorage.setItem('hod_active_dept', dept);
  }

  const aimlStudents = (typeof window.CampusAimlRoster !== 'undefined') ? 
                       window.CampusAimlRoster.getAll() : [];
  const csStudents = (typeof window.CampusRoster !== 'undefined') ? 
                     window.CampusRoster.getAll() : [];

  if (dept === 'AIML') {
    currentRosterList = [...aimlStudents];
  } else if (dept === 'CS') {
    currentRosterList = [...csStudents];
  } else {
    // All
    currentRosterList = [...aimlStudents, ...csStudents];
  }

  updateHeaderUI();
  updatePillsUI();
  filterRoster();
}"""

new_load = """async function loadDepartmentRoster(dept) {
  activeDepartment = dept;
  if (dept === 'AIML' || dept === 'CS') {
    localStorage.setItem('hod_active_dept', dept);
  }

  try {
    const res = await fetch(`/api/v1/hod/security-roster?branch=${encodeURIComponent(dept)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.roster) {
        currentRosterList = data.roster.map(r => ({
          roll: r.rollNumber || r.roll || 1,
          pin: r.pin,
          name: r.name,
          branch: r.branch || dept,
          securityKey: r.secretKey || r.key || 'STD-KEYGEN',
          is_registered: r.is_registered
        }));
      }
    }
  } catch (err) {
    console.error('Failed to load security roster from API:', err);
  }

  updateHeaderUI();
  updatePillsUI();
  filterRoster();
}"""

assert old_load in code, "old_load not found in security-roster.js"
code = code.replace(old_load, new_load, 1)

# Fix dotClass bug in renderRosterRows
code = code.replace("const dotClass = isActivated ? '${dotClass}' : 'bg-amber-500';", "const dotClass = isActivated ? 'bg-emerald-600' : 'bg-amber-500';")
code = code.replace("const secKey = s.securityKey || 'STD-KEYGEN';", "const secKey = s.securityKey || s.secretKey || s.key || 'STD-KEYGEN';")

with open(path, "w", encoding="utf-8") as f:
    f.write(code)

print("Successfully updated security-roster.js!")
