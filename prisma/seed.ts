import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Phase 3 database seeding...');

  // Reset database tables
  await prisma.bookmark.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.assessmentInvitation.deleteMany({});
  await prisma.recruiterAssessment.deleteMany({});
  await prisma.recruiterJob.deleteMany({});
  await prisma.roadmapProgress.deleteMany({});
  await prisma.roadmapStep.deleteMany({});
  await prisma.roadmap.deleteMany({});
  await prisma.interviewExperienceVote.deleteMany({});
  await prisma.interviewExperience.deleteMany({});
  await prisma.previousYearQuestion.deleteMany({});
  await prisma.companyFaq.deleteMany({});
  await prisma.companyRound.deleteMany({});
  await prisma.testQuestion.deleteMany({});
  await prisma.answer.deleteMany({});
  await prisma.attempt.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.companyTag.deleteMany({});
  await prisma.test.deleteMany({});
  await prisma.learningNote.deleteMany({});
  await prisma.skillWeight.deleteMany({});
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.studentSkillScore.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.college.deleteMany({});
  await prisma.subCategory.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleaned old database records.');

  // Create Colleges
  const ldrpCollege = await prisma.college.create({
    data: { name: 'LDRP Institute of Technology and Research', location: 'Gandhinagar, Gujarat' }
  });
  const nirmaCollege = await prisma.college.create({
    data: { name: 'Nirma University', location: 'Ahmedabad, Gujarat' }
  });

  // Create Users
  const passwordHash = bcrypt.hashSync('password123', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);

  // Student
  const student = await prisma.user.create({
    data: {
      email: 'student@placementhub.com',
      name: 'Brijesh Sharma',
      passwordHash: passwordHash,
      role: 'STUDENT',
    }
  });

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@placementhub.com',
      name: 'Super Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
    }
  });

  // Recruiter
  const recruiter = await prisma.user.create({
    data: {
      email: 'recruiter@placementhub.com',
      name: 'Amazon Talent Acquisition',
      passwordHash: passwordHash,
      role: 'RECRUITER',
    }
  });

  // College Admin (Placement Officer)
  const collegeAdmin = await prisma.user.create({
    data: {
      email: 'tpo@ldrp.edu.in',
      name: 'Prof. Rajesh Patel (TPO)',
      passwordHash: passwordHash,
      role: 'COLLEGE_ADMIN',
    }
  });

  // Link College Admin to College
  await prisma.college.update({
    where: { id: ldrpCollege.id },
    data: { adminId: collegeAdmin.id }
  });

  console.log('Seeded User Roles: STUDENT, ADMIN, RECRUITER, COLLEGE_ADMIN');

  // Create Skills
  const skillNames = [
    'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'C++', 'Python', 'Java', 'DBMS', 'OS', 'CN', 'OOP', 'Data Structures & Algorithms'
  ];
  const skillsMap: { [key: string]: any } = {};
  for (const name of skillNames) {
    skillsMap[name] = await prisma.skill.create({ data: { name } });
  }

  // Create Profile for Student
  const profile = await prisma.profile.create({
    data: {
      userId: student.id,
      collegeId: ldrpCollege.id,
      branch: 'Computer Engineering',
      gradYear: 2026,
      cgpa: 8.45,
      linkedinUrl: 'https://linkedin.com/in/brijesh-sharma',
      githubUrl: 'https://github.com/brijesh-sharma',
      targetRole: 'SOFTWARE_ENGINEER',
      skills: {
        connect: [
          { id: skillsMap['React'].id },
          { id: skillsMap['JavaScript'].id },
          { id: skillsMap['SQL'].id },
          { id: skillsMap['C++'].id }
        ]
      }
    }
  });

  await prisma.onboardingProfile.create({
    data: {
      profileId: profile.id,
      targetRole: 'SOFTWARE_ENGINEER',
      academicStage: '4th Year',
      timeline: 'Within 3 Months',
      objective: 'Placement Preparation',
      targetCompanies: 'TCS, Infosys, Amazon',
      confidenceAptitude: 8,
      confidenceReasoning: 7,
      confidenceVerbal: 7,
      confidenceDsa: 6,
      confidenceDbms: 9,
      confidenceOs: 6,
      confidenceCn: 5,
      confidenceOop: 8,
      confidenceSql: 9,
      confidenceCommunication: 8,
      completedOnboarding: true,
      completedBaselineAssessment: true,
    }
  });

  // Create Badges
  const badgeData = [
    { name: 'First Test Completed', description: 'Awarded for completing your first assessment test.', icon: 'Award' },
    { name: 'Aptitude Master', description: 'Awarded for achieving 85%+ score in any Aptitude mock test.', icon: 'Zap' },
    { name: 'DBMS Expert', description: 'Awarded for scoring 90%+ in the Technical DBMS test.', icon: 'Database' },
    { name: '7 Day Streak', description: 'Maintained a daily practice streak of 7 days.', icon: 'Flame' },
    { name: 'Placement Warrior', description: 'Maintained a daily practice streak of 30 days.', icon: 'Shield' }
  ];
  const badgesMap: { [key: string]: any } = {};
  for (const b of badgeData) {
    badgesMap[b.name] = await prisma.badge.create({ data: b });
  }

  // Award 'First Test Completed' to student profile
  await prisma.userBadge.create({
    data: {
      profileId: profile.id,
      badgeId: badgesMap['First Test Completed'].id,
    }
  });

  // Create Skill Weights for Student Readiness Score calculations
  const weightData = [
    // Software Engineer role weights
    { role: 'SOFTWARE_ENGINEER', skillName: 'Aptitude', weight: 0.15 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'Reasoning', weight: 0.10 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'Verbal', weight: 0.10 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'DSA', weight: 0.20 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'DBMS', weight: 0.10 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'OS', weight: 0.10 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'CN', weight: 0.10 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'OOP', weight: 0.10 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'Interview', weight: 0.05 },

    // Frontend Developer role weights
    { role: 'FRONTEND_DEVELOPER', skillName: 'Aptitude', weight: 0.10 },
    { role: 'FRONTEND_DEVELOPER', skillName: 'Reasoning', weight: 0.10 },
    { role: 'FRONTEND_DEVELOPER', skillName: 'Verbal', weight: 0.10 },
    { role: 'FRONTEND_DEVELOPER', skillName: 'DSA', weight: 0.15 },
    { role: 'FRONTEND_DEVELOPER', skillName: 'HTML', weight: 0.20 },
    { role: 'FRONTEND_DEVELOPER', skillName: 'React', weight: 0.20 },
    { role: 'FRONTEND_DEVELOPER', skillName: 'OOP', weight: 0.10 },
    { role: 'FRONTEND_DEVELOPER', skillName: 'Interview', weight: 0.05 },
  ];

  for (const w of weightData) {
    await prisma.skillWeight.create({
      data: {
        role: w.role as any,
        skillName: w.skillName,
        weight: w.weight,
      }
    });
  }

  // Set default initial Readiness Score for Student
  await prisma.studentSkillScore.create({
    data: {
      profileId: profile.id,
      aptitudeScore: 80.0,
      reasoningScore: 75.0,
      verbalScore: 70.0,
      dsaScore: 65.0,
      dbmsScore: 90.0,
      osScore: 60.0,
      cnScore: 55.0,
      oopScore: 85.0,
      interviewScore: 72.0,
      overallScore: 74.0, // calculated from weights
    }
  });

  // Create Categories & Subcategories
  const categoriesData = [
    { name: 'Aptitude', subcategories: ['Profit and Loss', 'Percentage', 'Probability', 'Time and Work', 'Time Speed Distance'] },
    { name: 'Reasoning', subcategories: ['Blood Relations', 'Direction', 'Seating Arrangement'] },
    { name: 'Verbal', subcategories: ['Grammar', 'Vocabulary'] },
    { name: 'Technical', subcategories: ['DSA', 'DBMS', 'OS', 'CN', 'OOP', 'SQL'] }
  ];

  const subcatsMap: { [key: string]: any } = {};
  for (const catInfo of categoriesData) {
    const cat = await prisma.category.create({ data: { name: catInfo.name } });
    for (const subName of catInfo.subcategories) {
      subcatsMap[subName] = await prisma.subCategory.create({
        data: { name: subName, categoryId: cat.id }
      });
    }
  }

  // Create Companies
  const tcs = await prisma.company.create({
    data: {
      name: 'TCS',
      logoUrl: '/images/tcs-logo.png',
      hiringPattern: `### TCS NQT Hiring Scheme 2026
Recruitment splits into two entry-level roles:
- **TCS Ninja**: Core developer tasks (3.36 LPA)
- **TCS Digital**: Advanced development, ML, and cloud applications (7.0 LPA)`,
      eligibilityCriteria: `Minimum 6.0 CGPA and 60% in 10th and 12th. Maximum 1 active backlog.`,
    }
  });

  const amazon = await prisma.company.create({
    data: {
      name: 'Amazon',
      logoUrl: '/images/amazon-logo.png',
      hiringPattern: `### Amazon SDE Recruitment Pattern
Focused heavily on Data Structures, Algorithms, System Design, and Amazon's 16 Leadership Principles.`,
      eligibilityCriteria: `No active backlogs. Strong grasp of coding, algorithms and system designs.`,
    }
  });

  const infosys = await prisma.company.create({
    data: {
      name: 'Infosys',
      logoUrl: '/images/infosys-logo.png',
      hiringPattern: `### Infosys SP & DSE Hiring Pattern
- **System Engineer (SE)**: 3.6 LPA
- **Differential System Engineer (DSE)**: 6.25 LPA
- **Specialist Programmer (SP)**: 9.5 LPA`,
      eligibilityCriteria: `Minimum 65% aggregate throughout academics.`,
    }
  });

  console.log('Seeded Companies: TCS, Amazon, Infosys');

  // Create Company Rounds
  const companyRounds = [
    // TCS
    { companyId: tcs.id, roundNumber: 1, roundName: 'Aptitude Round', description: 'Quantitative, logical reasoning, and English vocabulary test.', difficulty: 'MEDIUM', duration: 60, passingScore: 70.0 },
    { companyId: tcs.id, roundNumber: 2, roundName: 'Advanced Coding', description: 'Solve 2 programming problems in C++/Java/Python.', difficulty: 'HARD', duration: 45, passingScore: 50.0 },
    { companyId: tcs.id, roundNumber: 3, roundName: 'Technical Interview', description: 'Basic OOP, DBMS Normalization, OS memory layout, and projects.', difficulty: 'MEDIUM', duration: 30, passingScore: 60.0 },

    // Amazon
    { companyId: amazon.id, roundNumber: 1, roundName: 'Online Assessment', description: '2 Coding questions + Work Style simulation.', difficulty: 'HARD', duration: 90, passingScore: 75.0 },
    { companyId: amazon.id, roundNumber: 2, roundName: 'Technical Round 1', description: 'DSA, system structure, arrays and trees.', difficulty: 'HARD', duration: 60, passingScore: 70.0 },
  ];

  for (const cr of companyRounds) {
    await prisma.companyRound.create({ data: cr as any });
  }

  // Seed Previous Year Questions (PYQs)
  const pyqs = [
    {
      companyId: amazon.id,
      year: 2025,
      role: 'SDE Intern',
      round: 'Coding Round',
      question: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
      answer: 'Use a Hash Map to store indices of visited numbers. Compiles in O(N) time.',
      explanation: 'For each number, check if target - number is in the hash map. If yes, return indices.',
      difficulty: 'EASY',
      topic: 'Arrays',
    },
    {
      companyId: tcs.id,
      year: 2025,
      role: 'Software Engineer',
      round: 'Aptitude Round',
      question: 'A train crosses a pole in 9 seconds running at 60 km/hr. What is the length of the train?',
      answer: '150 meters',
      explanation: 'Speed = 60 * 5/18 = 50/3 m/s. Distance = Speed * Time = 50/3 * 9 = 150m.',
      difficulty: 'EASY',
      topic: 'Probability',
    }
  ];

  for (const pyq of pyqs) {
    await prisma.previousYearQuestion.create({ data: pyq as any });
  }

  console.log('Seeded Company Rounds & Previous Year Questions (PYQs)');

  // Create Company Tags
  const tcsTag = await prisma.companyTag.create({ data: { name: 'TCS' } });
  const amazonTag = await prisma.companyTag.create({ data: { name: 'Amazon' } });

  // Create Questions
  const q1 = await prisma.question.create({
    data: {
      text: 'What is a Deadlock in Operating Systems?',
      options: JSON.stringify([
        'Processes waiting indefinitely for memory that is full',
        'A situation where a set of processes are blocked because each holds a resource and waits for another resource held by another process',
        'A system crash causing disk failures',
        'A compilation link error'
      ]),
      correctAnswer: 1,
      explanation: 'Deadlock requires 4 conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
      difficulty: 'MEDIUM',
      subCategoryId: subcatsMap['OS'].id,
      createdByUserId: admin.id,
    }
  });
  await prisma.question.update({
    where: { id: q1.id },
    data: { companyTags: { connect: [{ id: tcsTag.id }] } }
  });

  const q2 = await prisma.question.create({
    data: {
      text: 'Which SQL join returns all records when there is a match in either left or right table?',
      options: JSON.stringify(['LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'INNER JOIN']),
      correctAnswer: 2,
      explanation: 'FULL OUTER JOIN combines left and right outer joins.',
      difficulty: 'EASY',
      subCategoryId: subcatsMap['SQL'].id,
      createdByUserId: admin.id,
    }
  });

  // --- SEED PLACEMENT BASELINE ASSESSMENT ---
  console.log('Seeding Placement Baseline Assessment...');
  const baselineQuestionsData = [
    {
      text: "If a book is sold at a profit of 20%, what is the ratio of cost price to selling price?",
      options: ['5:6', '6:5', '4:5', '5:4'],
      correctAnswer: 0,
      explanation: "Let CP = 100. Profit = 20%, so SP = 120. Ratio CP:SP = 100:120 = 5:6.",
      difficulty: "EASY",
      subcat: 'Profit and Loss'
    },
    {
      text: "A number is first increased by 10% and then decreased by 10%. What is the net percentage change?",
      options: ['1% increase', '1% decrease', 'No change', '2% decrease'],
      correctAnswer: 1,
      explanation: "Net change = x + y + xy/100 = 10 - 10 - 100/100 = -1%. Hence, 1% decrease.",
      difficulty: "EASY",
      subcat: 'Percentage'
    },
    {
      text: "Two unbiased dice are thrown. What is the probability that the sum of the numbers is 7?",
      options: ['1/6', '1/12', '5/36', '1/9'],
      correctAnswer: 0,
      explanation: "Favorable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1). Total outcomes = 36. Probability = 6/36 = 1/6.",
      difficulty: "MEDIUM",
      subcat: 'Probability'
    },
    {
      text: "A can do a piece of work in 10 days and B in 15 days. How long will they take working together?",
      options: ['5 days', '6 days', '8 days', '12 days'],
      correctAnswer: 1,
      explanation: "One day work = 1/10 + 1/15 = 5/30 = 1/6. So they take 6 days together.",
      difficulty: "EASY",
      subcat: 'Time and Work'
    },
    {
      text: "A car travels at 60 km/h. How much distance does it cover in 15 minutes?",
      options: ['10 km', '12 km', '15 km', '20 km'],
      correctAnswer: 2,
      explanation: "15 minutes = 15/60 = 0.25 hours. Distance = Speed * Time = 60 * 0.25 = 15 km.",
      difficulty: "EASY",
      subcat: 'Time Speed Distance'
    },
    {
      text: "A container contains 40 litres of milk. From this, 4 litres of milk was taken out and replaced by water. This process was repeated further two times. How much milk is now contained?",
      options: ['29.16 litres', '30.5 litres', '32.4 litres', '28 litres'],
      correctAnswer: 0,
      explanation: "Remaining milk = 40 * (1 - 4/40)^3 = 40 * (0.9)^3 = 40 * 0.729 = 29.16 litres.",
      difficulty: "HARD",
      subcat: 'Profit and Loss'
    },
    {
      text: "Pointing to a man, a woman says, 'His mother is the only daughter of my mother.' How is the woman related to the man?",
      options: ['Mother', 'Sister', 'Grandmother', 'Aunt'],
      correctAnswer: 0,
      explanation: "The only daughter of the woman's mother is the woman herself. So, the man's mother is the woman herself.",
      difficulty: "MEDIUM",
      subcat: 'Blood Relations'
    },
    {
      text: "A person walks 10m North, turns Right and walks 5m, then turns Right and walks 10m. How far and in which direction is he from the starting point?",
      options: ['5m East', '5m West', '10m North', '0m'],
      correctAnswer: 0,
      explanation: "The path forms a rectangle. He is 5m East from the starting point.",
      difficulty: "EASY",
      subcat: 'Direction'
    },
    {
      text: "A, B, C, D, E are sitting in a row facing North. C is in the middle. A is next to B and D is next to E. Who is sitting on the extreme left?",
      options: ['A or B', 'C', 'D or E', 'Cannot be determined'],
      correctAnswer: 3,
      explanation: "Without additional constraint, the absolute placement of A, B, D, E cannot be determined.",
      difficulty: "MEDIUM",
      subcat: 'Seating Arrangement'
    },
    {
      text: "If 'TIGER' is coded as 'SUHJFHDFQS', what is the code for 'CAT'?",
      options: ['BDZBSU', 'BDFSZBSU', 'BDFHJZSU', 'BDBSU'],
      correctAnswer: 0,
      explanation: "Each letter is replaced by its preceding and succeeding letter: C -> B,D; A -> Z,B; T -> S,U. BDZBSU.",
      difficulty: "MEDIUM",
      subcat: 'Blood Relations'
    },
    {
      text: "A man walks 6 km South, turns Left and walks 4 km, then turns Left and walks 5 km. Which direction is he facing now?",
      options: ['North', 'South', 'East', 'West'],
      correctAnswer: 0,
      explanation: "Walking South then turning Left twice means he is walking North now.",
      difficulty: "EASY",
      subcat: 'Direction'
    },
    {
      text: "Six friends P, Q, R, S, T, U are sitting in a circle facing the center. P is opposite to Q, R is between P and S. Who is opposite to S if T is between Q and U?",
      options: ['U', 'T', 'R', 'P'],
      correctAnswer: 0,
      explanation: "Draw circle: R sits between P and S. P opposite Q. T between Q and U. S will be opposite U.",
      difficulty: "HARD",
      subcat: 'Seating Arrangement'
    },
    {
      text: "Choose the correct spelling from the options below:",
      options: ['Accommodate', 'Acommodate', 'Accomodate', 'Acomodate'],
      correctAnswer: 0,
      explanation: "Accommodate has double 'c' and double 'm'.",
      difficulty: "EASY",
      subcat: 'Grammar'
    },
    {
      text: "What is the synonym of 'Ephemeral'?",
      options: ['Short-lived', 'Permanent', 'Beautiful', 'Weak'],
      correctAnswer: 0,
      explanation: "Ephemeral means lasting for a very short time.",
      difficulty: "MEDIUM",
      subcat: 'Vocabulary'
    },
    {
      text: "Select the word that is opposite in meaning to 'Mitigate':",
      options: ['Aggravate', 'Relieve', 'Alleviate', 'Diminish'],
      correctAnswer: 0,
      explanation: "Mitigate means to make less severe; Aggravate means to make worse.",
      difficulty: "MEDIUM",
      subcat: 'Vocabulary'
    },
    {
      text: "Fill in the blank with the correct verb: 'Neither of the two candidates _____ selected.'",
      options: ['was', 'were', 'have been', 'are'],
      correctAnswer: 0,
      explanation: "'Neither' is singular and requires a singular verb, so 'was' is correct.",
      difficulty: "EASY",
      subcat: 'Grammar'
    },
    {
      text: "Identify the grammatical error: 'He has been working here since five years.'",
      options: ['He has', 'been working', 'since five years', 'No error'],
      correctAnswer: 2,
      explanation: "'since' is used for point of time; 'for' should be used for duration (five years).",
      difficulty: "EASY",
      subcat: 'Grammar'
    },
    {
      text: "What is the antonym of 'Benevolent'?",
      options: ['Malevolent', 'Generous', 'Kind', 'Friendly'],
      correctAnswer: 0,
      explanation: "Benevolent means well-meaning/kind; Malevolent means wishing evil to others.",
      difficulty: "EASY",
      subcat: 'Vocabulary'
    },
    {
      text: "What is the worst-case time complexity of searching in a Binary Search Tree (BST)?",
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      correctAnswer: 2,
      explanation: "Worst case is when the BST is skewed, degrading search to O(N).",
      difficulty: "MEDIUM",
      subcat: 'DSA'
    },
    {
      text: "Which data structure operates on a Last In First Out (LIFO) basis?",
      options: ['Queue', 'Stack', 'Linked List', 'Heap'],
      correctAnswer: 1,
      explanation: "Stack elements are inserted and removed in LIFO order.",
      difficulty: "EASY",
      subcat: 'DSA'
    },
    {
      text: "What is the time complexity of Quick Sort in the worst case?",
      options: ['O(N log N)', 'O(N^2)', 'O(N)', 'O(log N)'],
      correctAnswer: 1,
      explanation: "Worst case occurs when pivot divides elements unbalanced (e.g., already sorted), resulting in O(N^2).",
      difficulty: "MEDIUM",
      subcat: 'DSA'
    },
    {
      text: "Which algorithm is used to find the shortest path in a weighted graph with non-negative edge weights?",
      options: ['Kruskal\'s Algorithm', 'Dijkstra\'s Algorithm', 'Prim\'s Algorithm', 'DFS'],
      correctAnswer: 1,
      explanation: "Dijkstra's finds single-source shortest path. Kruskal's/Prim's find MST.",
      difficulty: "MEDIUM",
      subcat: 'DSA'
    },
    {
      text: "A queue can be efficiently implemented using which of the following?",
      options: ['Singly Linked List with rear pointer', 'Array with shift operations', 'Stack', 'BST'],
      correctAnswer: 0,
      explanation: "With rear pointer, enqueue is O(1) at tail, and dequeue is O(1) at head.",
      difficulty: "EASY",
      subcat: 'DSA'
    },
    {
      text: "Which traversal of a Binary Search Tree yields elements in sorted ascending order?",
      options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
      correctAnswer: 1,
      explanation: "In-order traversal visits (Left, Root, Right), which outputs BST in sorted order.",
      difficulty: "EASY",
      subcat: 'DSA'
    },
    {
      text: "Which normal form deals with removing partial dependency of non-prime attributes?",
      options: ['1NF', '2NF', '3NF', 'BCNF'],
      correctAnswer: 1,
      explanation: "2NF requires 1NF and no partial dependencies.",
      difficulty: "MEDIUM",
      subcat: 'DBMS'
    },
    {
      text: "What is a deadlock in Operating Systems?",
      options: ['Processes waiting indefinitely for resource release in circular chain', 'System execution speed slowing down', 'Memory leaks causing stack overflow', 'Thread terminating unexpectedly'],
      correctAnswer: 0,
      explanation: "A deadlock occurs when a set of processes are blocked, each holding a resource and waiting for another resource held by another process.",
      difficulty: "EASY",
      subcat: 'OS'
    },
    {
      text: "Which protocol operates at the Application Layer of the OSI model?",
      options: ['TCP', 'IP', 'HTTP', 'UDP'],
      correctAnswer: 2,
      explanation: "HTTP is Application layer, TCP/UDP are Transport, IP is Network.",
      difficulty: "EASY",
      subcat: 'CN'
    },
    {
      text: "Which OOP concept allows a subclass to provide a specific implementation of a method already defined in its superclass?",
      options: ['Method Overriding', 'Method Overloading', 'Encapsulation', 'Abstraction'],
      correctAnswer: 0,
      explanation: "Method Overriding is runtime polymorphism where subclass overrides parent method.",
      difficulty: "EASY",
      subcat: 'OOP'
    },
    {
      text: "Which SQL statement is used to remove all rows from a table without logging individual row deletions?",
      options: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'],
      correctAnswer: 2,
      explanation: "TRUNCATE is DDL, deallocates pages, and is faster than DELETE since it is not fully logged.",
      difficulty: "MEDIUM",
      subcat: 'SQL'
    },
    {
      text: "What is the size of IPv4 and IPv6 addresses respectively?",
      options: ['32 bits and 128 bits', '64 bits and 128 bits', '32 bits and 64 bits', '16 bits and 32 bits'],
      correctAnswer: 0,
      explanation: "IPv4 addresses are 32-bit (4 bytes) and IPv6 are 128-bit (16 bytes).",
      difficulty: "EASY",
      subcat: 'CN'
    }
  ];

  const baselineTest = await prisma.test.create({
    data: {
      title: 'Placement Baseline Assessment',
      description: 'First career diagnostic baseline test to calculate placement readiness.',
      duration: 30,
      categoryId: (await prisma.category.findUnique({ where: { name: 'Technical' } }))!.id,
      createdByUserId: admin.id,
    }
  });

  for (let i = 0; i < baselineQuestionsData.length; i++) {
    const qData = baselineQuestionsData[i];
    const q = await prisma.question.create({
      data: {
        text: qData.text,
        options: JSON.stringify(qData.options),
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation,
        difficulty: qData.difficulty as any,
        subCategoryId: subcatsMap[qData.subcat].id,
        createdByUserId: admin.id,
      }
    });
    await prisma.testQuestion.create({
      data: {
        testId: baselineTest.id,
        questionId: q.id,
        order: i + 1,
      }
    });
  }

  // Create Test Mock
  const aptCategoryId = (await prisma.category.findUnique({ where: { name: 'Technical' } }))!.id;
  const mockTest = await prisma.test.create({
    data: {
      title: 'TCS Foundation Mock Test',
      description: 'Simulated assessment.',
      duration: 30,
      categoryId: aptCategoryId,
      companyId: tcs.id,
      createdByUserId: admin.id,
    }
  });

  await prisma.testQuestion.create({
    data: { testId: mockTest.id, questionId: q1.id, order: 1 }
  });
  await prisma.testQuestion.create({
    data: { testId: mockTest.id, questionId: q2.id, order: 2 }
  });

  // Create Attempt and Result
  const attempt = await prisma.attempt.create({
    data: {
      userId: student.id,
      testId: mockTest.id,
      score: 2,
      maxScore: 2,
      percentage: 100.0,
      correctAnswers: 2,
      incorrectAnswers: 0,
      status: 'SUBMITTED',
      startedAt: new Date(Date.now() - 1800 * 1000),
      submittedAt: new Date(),
    }
  });

  await prisma.result.create({
    data: {
      attemptId: attempt.id,
      rank: 1,
      accuracy: 100.0,
      topicAnalysis: JSON.stringify({ 'OS': 100.0, 'SQL': 100.0 })
    }
  });

  // Create Roadmaps & RoadmapProgress
  const sdeRoadmap = await prisma.roadmap.create({
    data: {
      title: 'Software Developer Roadmap',
      description: 'Career path guide to landing SDE jobs.'
    }
  });

  const rStep1 = await prisma.roadmapStep.create({
    data: { roadmapId: sdeRoadmap.id, order: 1, title: 'OOP & Programming', description: 'Basics.', topics: 'Classes, Objects, Polymorphism' }
  });
  const rStep2 = await prisma.roadmapStep.create({
    data: { roadmapId: sdeRoadmap.id, order: 2, title: 'Data Structures', description: 'Advanced.', topics: 'Arrays, Trees, Graphs' }
  });

  // Seed progress (Completed 1 step)
  await prisma.roadmapProgress.create({
    data: {
      profileId: profile.id,
      roadmapId: sdeRoadmap.id,
      completedSteps: rStep1.id,
      percentageCompleted: 50.0,
    }
  });

  // Create Interview Experiences with Moderation status
  await prisma.interviewExperience.create({
    data: {
      userId: student.id,
      companyId: tcs.id,
      role: 'Ninja Developer',
      questionsAsked: 'Method Overloading vs Overriding. SQL Joins.',
      experience: 'Good experience. F2F technical interview.',
      difficulty: 'MEDIUM',
      selected: true,
      status: 'APPROVED',
      packageText: '3.6 LPA',
      year: 2025,
      roundsText: 'Aptitude, Tech Interview',
      prepTips: 'Prepare OOP and DBMS.',
      upvoteCount: 12,
    }
  });

  // Create Learning Notes
  await prisma.learningNote.create({
    data: {
      title: 'DBMS Normalization Notes',
      category: 'DBMS',
      content: '### Normalization Rules\nDetailed overview of 1NF, 2NF, 3NF and BCNF.',
      examples: 'Student ID | Subject | Instructor',
      isPublished: true,
      createdByUserId: admin.id,
    }
  });

  // Create Notifications
  await prisma.notification.create({
    data: {
      userId: student.id,
      title: 'Assessment Invitation',
      message: 'Amazon invited you to take the SDE Intern Online Coding Assessment.',
      type: 'INVITE',
    }
  });

  // Seed Recruiter Jobs & Candidate shortlists
  const job = await prisma.recruiterJob.create({
    data: {
      recruiterId: recruiter.id,
      title: 'SDE Intern',
      company: 'Amazon',
      description: 'Work on scaling cloud databases and backend systems.',
      location: 'Bangalore, India',
      salary: '80,000 / month',
      jobType: 'Internship',
      requiredSkills: 'C++, Java, SQL, DSA',
      experienceLevel: 'Entry Level',
      cgpaCutoff: 8.0,
      readinessCutoff: 70.0,
    }
  });

  const recruiterAssessment = await prisma.recruiterAssessment.create({
    data: {
      jobId: job.id,
      testId: mockTest.id,
    }
  });

  await prisma.assessmentInvitation.create({
    data: {
      assessmentId: recruiterAssessment.id,
      studentId: student.id,
      status: 'INVITED',
    }
  });

  console.log('Seeded Recruiter Job & Student Assessment Invitation successfully!');
  console.log('Database Seeding finished completed!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
