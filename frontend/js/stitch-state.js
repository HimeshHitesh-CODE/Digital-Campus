/**
 * Stitch Campus Connect — Unified Dynamic State & Live Data Service
 * Provides rich fallback seed data and dynamic bindings across all 7 screens
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StitchState = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEYS = {
    USER: 'stitch_user_profile',
    ATTENDANCE: 'stitch_attendance_data',
    MARKS: 'stitch_marks_data',
    MARKETPLACE: 'stitch_marketplace_items',
    IDEA_HUB_PEERS: 'stitch_idea_hub_peers',
    IDEA_HUB_PROFILE: 'stitch_idea_hub_profile',
    REQUESTS: 'stitch_cert_requests',
    MESSAGES: 'stitch_messages_threads'
  };

  // 1. Initial Rich Seed Student Profile
  const DEFAULT_USER = {
    name: 'Karnati Himesh',
    pin: '24259-CS-025',
    collegeCode: '259',
    collegeName: 'Samskruti College of Engineering & Technology',
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    semester: '4th Semester CSE',
    scheme: 'Scheme C-24',
    academicYear: 'AY 2024-25',
    avatarInitials: 'KH',
    shortPin: 'CS-25',
    role: 'STUDENT',
    advisor: 'Dr. S. K. Murthy, Ph.D.',
    advisorCabin: 'Cabin B-204',
    advisorHours: '03:00 PM - 04:30 PM'
  };

  // 2. Attendance Telemetry Data
  const DEFAULT_ATTENDANCE = {
    overallRate: 27.78,
    deficit: -47.22,
    statutoryThreshold: 75.00,
    condonationThreshold: 65.00,
    status: 'Critical Detainment Alert (<65%)',
    recordedPresent: 50,
    totalSessions: 180,
    workingDays: 180,
    absentSessions: 130,
    remainingDays: 8,
    consecutiveNeeded: 33,
    lastPunch: 'Today, 09:12 AM (Device #Bio-CSE-04)',
    statusBadge: 'INELIGIBLE',
    activeMonth: 'Oct 2024',
    monthRate: 22.7,
    monthPresent: 5,
    monthTotal: 22,
    subjects: [
      { code: 'CS-401', title: 'Database Management Systems', faculty: 'Dr. V. Murali (Cabin 204)', conducted: 42, attended: 12, rate: 28.5, status: 'DETAINED' },
      { code: 'CS-402', title: 'Design & Analysis of Algorithms', faculty: 'Prof. K. Ramesh (Cabin 209)', conducted: 40, attended: 10, rate: 25.0, status: 'DETAINED' },
      { code: 'CS-403', title: 'Operating Systems', faculty: 'S. Anitha Devi (Cabin 212)', conducted: 38, attended: 12, rate: 31.6, status: 'DETAINED' },
      { code: 'CS-408', title: 'Database Management Systems Lab', faculty: 'Lab 3 (Systems Block)', conducted: 30, attended: 8, rate: 26.7, status: 'DETAINED' },
      { code: 'CS-409', title: 'Web Technologies Lab', faculty: 'Lab 1 (Computing Block)', conducted: 30, attended: 20, rate: 66.7, status: 'CONDONABLE' }
    ]
  };

  // 3. SBTET Marks & Examination Results
  const DEFAULT_MARKS = {
    cgpa: 9.11,
    securedCredits: 80.0,
    prescribedCredits: 80.0,
    activeBacklogs: 0,
    academicStanding: 'Promoted · All Cleared',
    currentSemSgpa: 9.35,
    sgpaTrajectory: [
      { sem: 'Sem 1', sgpa: 8.85 },
      { sem: 'Sem 2', sgpa: 9.05 },
      { sem: 'Sem 3', sgpa: 9.18 },
      { sem: 'Sem 4', sgpa: 9.35 }
    ],
    semesters: {
      '4': {
        name: '4th Sem (Active Memo)',
        sgpa: 9.35,
        status: 'PASS - ALL CLEARED',
        credits: 22.5,
        totalMarks: 851,
        maxMarks: 1000,
        aggregate: '85.10%',
        hash: '917b...318e',
        subjects: [
          { code: 'SC-401', desc: 'Advanced Engineering Mathematics', cat: 'Theory (Core)', internal: 22, endSem: 43, total: 65, gradePoint: 7.0, letter: 'B+', status: 'PASS' },
          { code: 'CS-402', desc: 'Java Programming & OOP Concepts', cat: 'Theory (Major)', internal: 26, endSem: 53, total: 79, gradePoint: 8.0, letter: 'A', status: 'PASS' },
          { code: 'CS-403', desc: 'Python for Data Analysis', cat: 'Theory (Major)', internal: 27, endSem: 54, total: 81, gradePoint: 9.0, letter: 'A', status: 'PASS' },
          { code: 'CS-404', desc: 'Relational Database Management Systems', cat: 'Theory (Core)', internal: 24, endSem: 48, total: 72, gradePoint: 8.0, letter: 'B+', status: 'PASS' },
          { code: 'CS-405', desc: 'Applied Cryptography & Network Security', cat: 'Theory (Specialization)', internal: 23, endSem: 45, total: 68, gradePoint: 7.0, letter: 'B+', status: 'PASS' },
          { code: 'CS-406', desc: 'Operating Systems Internals', cat: 'Theory (Core)', internal: 27, endSem: 54, total: 81, gradePoint: 9.0, letter: 'A+', status: 'PASS' },
          { code: 'CS-407', desc: 'Java Programming Practical Lab', cat: 'Practical (Lab)', internal: 30, endSem: 68, total: 98, gradePoint: 10.0, letter: 'A+', status: 'PASS' },
          { code: 'CS-408', desc: 'Python Applications Lab', cat: 'Practical (Lab)', internal: 30, endSem: 69, total: 99, gradePoint: 10.0, letter: 'A+', status: 'PASS' },
          { code: 'CS-409', desc: 'RDBMS Implementation & SQL Lab', cat: 'Practical (Lab)', internal: 30, endSem: 70, total: 100, gradePoint: 10.0, letter: 'A+', status: 'PASS' },
          { code: 'HU-410', desc: 'Employability & Life Skills', cat: 'Humanities / Viva', internal: 28, endSem: 60, total: 88, gradePoint: 9.0, letter: 'A', status: 'PASS' }
        ]
      },
      '3': {
        name: '3rd Sem (C-24)',
        sgpa: 9.18,
        status: 'PASS - ALL CLEARED',
        credits: 20.0,
        totalMarks: 815,
        maxMarks: 950,
        aggregate: '85.78%',
        hash: '724a...890f',
        subjects: [
          { code: 'CS-301', desc: 'Data Structures using C++', cat: 'Theory (Core)', internal: 25, endSem: 52, total: 77, gradePoint: 8.5, letter: 'A', status: 'PASS' },
          { code: 'CS-302', desc: 'Digital Logic & Computer Design', cat: 'Theory (Core)', internal: 24, endSem: 50, total: 74, gradePoint: 8.0, letter: 'B+', status: 'PASS' },
          { code: 'CS-303', desc: 'Computer Organization & Architecture', cat: 'Theory (Core)', internal: 26, endSem: 55, total: 81, gradePoint: 9.0, letter: 'A', status: 'PASS' },
          { code: 'CS-307', desc: 'Data Structures Lab', cat: 'Practical (Lab)', internal: 29, endSem: 67, total: 96, gradePoint: 10.0, letter: 'A+', status: 'PASS' },
          { code: 'CS-308', desc: 'Digital Electronics Lab', cat: 'Practical (Lab)', internal: 28, endSem: 65, total: 93, gradePoint: 9.5, letter: 'A+', status: 'PASS' }
        ]
      },
      '2': {
        name: '2nd Sem (C-24)',
        sgpa: 9.05,
        status: 'PASS - ALL CLEARED',
        credits: 19.5,
        totalMarks: 780,
        maxMarks: 900,
        aggregate: '86.66%',
        hash: '516c...432b',
        subjects: [
          { code: 'BS-201', desc: 'Engineering Physics & Chemistry', cat: 'Basic Science', internal: 23, endSem: 47, total: 70, gradePoint: 7.5, letter: 'B+', status: 'PASS' },
          { code: 'MA-202', desc: 'Linear Algebra & Calculus', cat: 'Mathematics', internal: 28, endSem: 58, total: 86, gradePoint: 9.0, letter: 'A', status: 'PASS' },
          { code: 'CS-203', desc: 'Programming in C', cat: 'Theory (Major)', internal: 27, endSem: 56, total: 83, gradePoint: 9.0, letter: 'A', status: 'PASS' },
          { code: 'CS-207', desc: 'C Programming Lab', cat: 'Practical (Lab)', internal: 30, endSem: 68, total: 98, gradePoint: 10.0, letter: 'A+', status: 'PASS' }
        ]
      },
      '1': {
        name: '1st Sem (C-24)',
        sgpa: 8.85,
        status: 'PASS - ALL CLEARED',
        credits: 18.0,
        totalMarks: 720,
        maxMarks: 850,
        aggregate: '84.70%',
        hash: '398d...119a',
        subjects: [
          { code: 'MA-101', desc: 'Engineering Mathematics - I', cat: 'Mathematics', internal: 24, endSem: 50, total: 74, gradePoint: 8.0, letter: 'B+', status: 'PASS' },
          { code: 'EN-102', desc: 'Technical English Communication', cat: 'Humanities', internal: 26, endSem: 52, total: 78, gradePoint: 8.0, letter: 'A', status: 'PASS' },
          { code: 'CS-103', desc: 'Fundamentals of Computing', cat: 'Theory (Core)', internal: 27, endSem: 55, total: 82, gradePoint: 9.0, letter: 'A', status: 'PASS' },
          { code: 'ME-108', desc: 'Engineering Workshop & Drafting', cat: 'Practical', internal: 29, endSem: 66, total: 95, gradePoint: 10.0, letter: 'A+', status: 'PASS' }
        ]
      }
    }
  };

  // 4. Initial Marketplace Seed Listings
  const DEFAULT_MARKETPLACE = [
    {
      id: 'm-01',
      ref: 'Ref 24259-M01',
      title: 'SCET Official White Lab Coat',
      category: 'Lab Coats & Aprons',
      categoryKey: 'lab-coats',
      price: 180,
      priceLabel: '₹180',
      badge: 'Academic Gear',
      condition: 'Good',
      detailMeta: 'Size 38 / M',
      desc: 'Official institutional cotton coat with deep pocket slits, mandatory for Chem & Workshop Labs.',
      sellerName: 'Yendakurthi Shanmukh',
      sellerPin: '24259-EC-041',
      sellerDept: 'ECE Dept',
      sellerInitials: 'YS',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'm-02',
      ref: 'Ref 24259-M02',
      title: 'Casio fx-991EX Scientific Calculator',
      category: 'Calculators',
      categoryKey: 'calculators',
      price: 600,
      priceLabel: '₹600',
      badge: 'Calculator',
      condition: 'Good',
      detailMeta: 'ClassWiz Edition',
      desc: 'Natural textbook display, 552 functions. Original hard cover included with zero LCD bleed.',
      sellerName: 'Gona Laxmi N. Swami',
      sellerPin: '24259-CS-018',
      sellerDept: 'CSE Dept',
      sellerInitials: 'GL',
      image: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'm-03',
      ref: 'Ref 24259-M03',
      title: 'AI & Deep Learning Mathematics Guide',
      category: 'Textbooks & Notes',
      categoryKey: 'textbooks',
      price: 400,
      priceLabel: '₹400',
      badge: 'Academic Gear',
      condition: 'Like New',
      detailMeta: 'Hardcover · 4th Ed',
      desc: 'Linear algebra, multivariate calculus and probability foundations. Clean pages with no ink markings.',
      sellerName: 'Karnati Hitesh',
      sellerPin: '24259-AI-012',
      sellerDept: 'AIML Dept',
      sellerInitials: 'KH',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'm-04',
      ref: 'Ref 24259-M04',
      title: 'Omega Engineering Mini Drafter',
      category: 'Mini Drafters & Kits',
      categoryKey: 'drafters',
      price: 350,
      priceLabel: '₹350',
      badge: 'Mini Drafter',
      condition: 'Good',
      detailMeta: 'Steel Rods + Case',
      desc: 'Unbreakable scales, frictionless clamp lock. Smooth movement calibrated for Engineering Graphics.',
      sellerName: 'Dulipudi Tarun',
      sellerPin: '24259-ME-029',
      sellerDept: 'MECH Dept',
      sellerInitials: 'DT',
      image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'm-05',
      ref: 'Ref 24259-M05',
      title: 'Arduino Uno R3 + Sensor Starter Pack',
      category: 'Dev Boards & Arduinos',
      categoryKey: 'dev-boards',
      price: 550,
      priceLabel: '₹550',
      badge: 'Dev Boards',
      condition: 'Good',
      detailMeta: 'Complete Kit',
      desc: 'Genuine ATmega328P microcontroller with breadboard, DHT11 temp sensor, ultrasonic HC-SR04.',
      sellerName: 'Chaganti Srija',
      sellerPin: '24259-EC-054',
      sellerDept: 'IoT Lab',
      sellerInitials: 'CS',
      image: 'https://images.unsplash.com/photo-1517055729441-3749789d6611?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'm-06',
      ref: 'Ref 24259-M06',
      title: 'Data Structures using C (Oxford)',
      category: 'Textbooks & Notes',
      categoryKey: 'textbooks',
      price: 220,
      priceLabel: '₹220',
      badge: 'Textbooks',
      condition: 'Good',
      detailMeta: 'Oxford Press · 2nd Ed',
      desc: 'Authored by Reema Thareja. Covers stacks, linked lists, binary search trees, and dynamic arrays.',
      sellerName: 'Anaboina Dilip',
      sellerPin: '24259-CS-007',
      sellerDept: 'CSE Dept',
      sellerInitials: 'AD',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'
    }
  ];

  // 5. Initial Idea Hub Collaborators & User Profile
  const DEFAULT_IDEA_HUB_PROFILE = {
    isAvailable: true,
    squadsCount: 2,
    invitesCount: 5,
    responseRate: '98%',
    skills: ['Python', 'Web Development (HTML/CSS/JS)', 'FastAPI', 'UI/UX Sprint']
  };

  const DEFAULT_IDEA_HUB_PEERS = [
    {
      id: 'peer-1',
      name: 'Gona Laxmi Narasimha Swami',
      initials: 'GL',
      status: 'Online',
      statusClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      role: 'CSE · Yr 2 · Rank #4',
      bio: 'Focused on scalable microservices and async data pipelines. Eager to collaborate on state-level hackathons.',
      skills: ['Python', 'FastAPI', 'Backend Arch', 'Web Development'],
      invited: false
    },
    {
      id: 'peer-2',
      name: 'Dulipudi Tarun',
      initials: 'DT',
      status: 'Offline 2h ago',
      statusClass: 'text-stone-600 bg-stone-100 border-stone-200',
      role: 'CSE · Creative Lead',
      bio: 'Specialized in human-centered component design, interactive prototyping, and collegiate branding.',
      skills: ['UI/UX Design', 'Figma', 'Poster Design', 'PPT Making'],
      invited: false
    },
    {
      id: 'peer-3',
      name: 'Anaboina Dilip',
      initials: 'AD',
      status: 'Online',
      statusClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      role: 'CSE · Academic Orator',
      bio: 'State-level paper presentation delegate. Experienced in academic documentation, IEEE formatting and tech slides.',
      skills: ['PPT Making', 'Technical Writing', 'LaTeX', 'Poster Design'],
      invited: false
    },
    {
      id: 'peer-4',
      name: 'Pittala Bhavya',
      initials: 'PB',
      status: 'Online',
      statusClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      role: 'CSE · Full-Stack',
      bio: 'Building responsive client platforms and relational database modeling. Passionate about green-tech apps.',
      skills: ['React/Next.js', 'Web Dev', 'SQL', 'Web Development'],
      invited: false
    },
    {
      id: 'peer-5',
      name: 'Chaganti Srija',
      initials: 'CS',
      status: 'In Lab Session',
      statusClass: 'text-amber-800 bg-amber-50 border-amber-200',
      role: 'ECE/CSE · Hardware Lead',
      bio: 'Prototyping microcontrollers, sensor nodes, and real-time firmware telemetry for automated IoT setups.',
      skills: ['Arduino/IoT', 'Circuit Design', 'Embedded C', 'Python'],
      invited: false
    },
    {
      id: 'peer-6',
      name: 'Bolloju Satya Pavani',
      initials: 'BS',
      status: 'Online',
      statusClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      role: 'CSE · ML Enthusiast',
      bio: 'Exploratory data analysis, statistical classification, and predictive modeling for collegiate projects.',
      skills: ['AI/ML', 'Python', 'Data Analytics', 'Video Editing'],
      invited: false
    }
  ];

  // 6. Initial Certificate & Bonafide Requests
  const DEFAULT_REQUESTS = [
    {
      id: 'req-082',
      ref: '#REQ-24259-082',
      title: 'Bonafide & Custodian Certificate',
      date: 'Issued Today, 09:40 AM',
      purpose: 'Official Passport verification at RPO Hyderabad',
      status: 'APPROVED',
      statusBadge: 'APPROVED',
      statusColor: 'emerald',
      attendanceSnapshot: '38.64%',
      condonationCleared: true,
      signOff: 'Dr. K. Srinivas (HOD)',
      dispatch: 'Counter Desk',
      otp: '5 8 4 3 8 6',
      counterNumber: 'Counter 2 (Academic Section)',
      fileName: 'SCET-BONAFIDE-24259025.pdf',
      fileSize: '1.4 MB'
    },
    {
      id: 'req-094',
      ref: '#REQ-24259-094',
      title: 'State Bus Pass Recommendation Memo',
      date: 'Submitted Yesterday, 04:15 PM',
      purpose: 'Route: ECIL X Roads → Samskruti Campus (Ghatkesar) • Pass Type: Student Monthly Ordinary / Metro Express',
      status: 'PENDING HOD SIGN-OFF',
      statusBadge: 'PENDING HOD SIGN-OFF',
      statusColor: 'amber',
      queuePosition: 'Queue Position #3',
      step: 2,
      stepLabel: 'Step 2 of 3 (HOD Desk)',
      progressPct: 66
    }
  ];

  // 7. Initial Campus Messages Threads
  const DEFAULT_THREADS = [
    {
      id: 'thread-gl',
      name: 'GONA LAXMI NARASIMHA SWAMI',
      pin: '24259-CS-001',
      initials: 'GL',
      role: 'Idea Hub Collab',
      tagType: 'Idea Hub',
      online: true,
      time: '08:51 AM',
      unread: false,
      messages: [
        { sender: 'them', time: '08:49 AM', text: 'Hey Himesh, did you check the SBTET attendance portal update today?' },
        { sender: 'me', time: '08:50 AM', text: 'Yeah, attendance dropped to 27.78% deficit... need condonation sign-off from HOD Dr. Vamshi Krishna.', isCondonationCard: true },
        { sender: 'them', time: '08:51 AM', text: 'Don\'t worry, submit the bonafide request in the Requests tab and get the OTP for counter pickup!' }
      ]
    },
    {
      id: 'thread-vk',
      name: 'Dr. J. Vamshi Krishna',
      pin: 'HOD CSE Dept',
      initials: 'VK',
      role: 'HOD',
      tagType: 'Direct & HOD',
      online: true,
      time: 'Yesterday',
      unread: true,
      messages: [
        { sender: 'them', time: 'Yesterday, 04:30 PM', text: 'Student KARNATI HIMESH: For formal leave app condonation, ensure medical documentation is countersigned before Friday.' }
      ]
    },
    {
      id: 'thread-dt',
      name: 'Dulipudi Tarun',
      pin: '24259-CS-002',
      initials: 'DT',
      role: 'Idea Hub UI/UX',
      tagType: 'Idea Hub',
      online: false,
      time: '23 Feb',
      unread: true,
      messages: [
        { sender: 'them', time: '23 Feb, 02:15 PM', text: 'Shared the Figma wireframes for the project portal dashboard. Let me know when you can review.' }
      ]
    },
    {
      id: 'thread-ys',
      name: 'Yendakurthi Shanmukh',
      pin: '24259-CS-023',
      initials: 'YS',
      role: 'Marketplace Item',
      tagType: 'Marketplace',
      online: false,
      time: '20 Feb',
      unread: true,
      messages: [
        { sender: 'them', time: '20 Feb, 11:20 AM', text: 'Is the Lab Coat still available for engineering chemistry lab?' }
      ]
    }
  ];

  // Store helpers with localStorage persistence
  function load(key, defaultVal) {
    try {
      const s = localStorage.getItem(key);
      if (s) return JSON.parse(s);
    } catch (e) {
      console.warn('StitchState parse error for', key, e);
    }
    return JSON.parse(JSON.stringify(defaultVal));
  }

  function save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('StitchState save error for', key, e);
    }
  }

  return {
    getUser() {
      // Synchronize with existing dc_user if available
      try {
        const existing = localStorage.getItem('dc_user');
        if (existing) {
          const u = JSON.parse(existing);
          if (u && (u.name || u.pin)) {
            return Object.assign({}, DEFAULT_USER, u);
          }
        }
      } catch (e) {}
      return load(STORAGE_KEYS.USER, DEFAULT_USER);
    },

    setUser(userObj) {
      const updated = Object.assign({}, this.getUser(), userObj);
      save(STORAGE_KEYS.USER, updated);
      window.dispatchEvent(new CustomEvent('stitch-user-updated', { detail: updated }));
      return updated;
    },

    getAttendance() {
      return load(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE);
    },

    setAttendance(att) {
      save(STORAGE_KEYS.ATTENDANCE, att);
      window.dispatchEvent(new CustomEvent('stitch-attendance-updated', { detail: att }));
      return att;
    },

    getMarks() {
      return load(STORAGE_KEYS.MARKS, DEFAULT_MARKS);
    },

    getMarketplace() {
      return load(STORAGE_KEYS.MARKETPLACE, DEFAULT_MARKETPLACE);
    },

    addMarketplaceItem(item) {
      const list = this.getMarketplace();
      list.unshift(item);
      save(STORAGE_KEYS.MARKETPLACE, list);
      window.dispatchEvent(new CustomEvent('stitch-marketplace-updated', { detail: list }));
      return list;
    },

    getIdeaHubProfile() {
      return load(STORAGE_KEYS.IDEA_HUB_PROFILE, DEFAULT_IDEA_HUB_PROFILE);
    },

    setIdeaHubProfile(p) {
      save(STORAGE_KEYS.IDEA_HUB_PROFILE, p);
      window.dispatchEvent(new CustomEvent('stitch-ideahub-profile-updated', { detail: p }));
      return p;
    },

    getIdeaHubPeers() {
      return load(STORAGE_KEYS.IDEA_HUB_PEERS, DEFAULT_IDEA_HUB_PEERS);
    },

    setIdeaHubPeers(peers) {
      save(STORAGE_KEYS.IDEA_HUB_PEERS, peers);
      window.dispatchEvent(new CustomEvent('stitch-ideahub-peers-updated', { detail: peers }));
      return peers;
    },

    getRequests() {
      return load(STORAGE_KEYS.REQUESTS, DEFAULT_REQUESTS);
    },

    addRequest(req) {
      const list = this.getRequests();
      list.unshift(req);
      save(STORAGE_KEYS.REQUESTS, list);
      window.dispatchEvent(new CustomEvent('stitch-requests-updated', { detail: list }));
      return list;
    },

    getThreads() {
      return load(STORAGE_KEYS.MESSAGES, DEFAULT_THREADS);
    },

    addMessage(threadId, msg) {
      const threads = this.getThreads();
      const t = threads.find(x => x.id === threadId);
      if (t) {
        t.messages.push(msg);
        t.time = msg.time || 'Just now';
        save(STORAGE_KEYS.MESSAGES, threads);
        window.dispatchEvent(new CustomEvent('stitch-messages-updated', { detail: { threadId, msg } }));
      }
      return threads;
    }
  };
});
