import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

if (process.env.NODE_ENV === 'production') {
  console.error('❌ Cannot run seed in production!');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Phase 1 database seeding with parameterized quality audits...');

  // Reset database tables
  await prisma.bookmark.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.assessmentInvitation.deleteMany({});
  await prisma.recruiterAssessment.deleteMany({});
  await prisma.recruiterJob.deleteMany({});
  await prisma.roadmapStepCompletion.deleteMany({});
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
  await prisma.dailyChallengeCompletion.deleteMany({});
  await prisma.dailyChallenge.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.companyTag.deleteMany({});
  await prisma.test.deleteMany({});
  await prisma.learningNote.deleteMany({});
  await prisma.skillWeight.deleteMany({});
  await prisma.studentSkillScoreHistory.deleteMany({});
  await prisma.mockInterview.deleteMany({});
  await prisma.codingSubmission.deleteMany({});
  await prisma.codingQuestion.deleteMany({});
  await prisma.studyPlan.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.emailVerificationToken.deleteMany({});
  await prisma.practiceSession.deleteMany({});
  await prisma.userActivity.deleteMany({});
  await prisma.collegePlacementReport.deleteMany({});
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.studentSkillScore.deleteMany({});
  await prisma.onboardingProfile.deleteMany({});
  await prisma.profile.deleteMany({});

  await prisma.college.updateMany({ data: { adminId: null } });
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

  // Create Users
  const passwordHash = bcrypt.hashSync('password123', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);

  const student = await prisma.user.create({
    data: {
      email: 'student@placementhub.com',
      name: 'Brijesh Sharma',
      passwordHash: passwordHash,
      role: 'STUDENT',
      isVerified: true,
      emailVerified: true,
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@placementhub.com',
      name: 'Super Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
      isVerified: true,
      emailVerified: true,
    }
  });

  const recruiter = await prisma.user.create({
    data: {
      email: 'recruiter@placementhub.com',
      name: 'Amazon Talent Acquisition',
      passwordHash: passwordHash,
      role: 'RECRUITER',
      isVerified: true,
      emailVerified: true,
    }
  });

  const collegeAdmin = await prisma.user.create({
    data: {
      email: 'tpo@ldrp.edu.in',
      name: 'Prof. Rajesh Patel (TPO)',
      passwordHash: passwordHash,
      role: 'COLLEGE_ADMIN',
      isVerified: true,
      emailVerified: true,
    }
  });

  await prisma.college.update({
    where: { id: ldrpCollege.id },
    data: { adminId: collegeAdmin.id }
  });

  console.log('Seeded core user roles.');

  // Create Skills
  const skillNames = [
    'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'C++', 'Python', 'Java', 'DBMS', 'OS', 'CN', 'OOP', 'Data Structures & Algorithms'
  ];
  const skillsMap: Record<string, any> = {};
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
      targetCompanies: ['TCS', 'Infosys', 'Amazon'],
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

  // Seed 8 Mock Students to populate leaderboards
  console.log('Seeding 8 mock students for leaderboards...');
  const mockStudentsData = [
    { name: 'Rahul Sen', email: 'rahul@placementhub.com', overall: 94.0, aptitude: 95.0, reasoning: 94.0, verbal: 92.0, dsa: 96.0, dbms: 95.0, os: 90.0, cn: 93.0, oop: 92.0, interview: 95.0 },
    { name: 'Priya Patel', email: 'priya@placementhub.com', overall: 91.0, aptitude: 92.0, reasoning: 93.0, verbal: 90.0, dsa: 93.0, dbms: 88.0, os: 91.0, cn: 89.0, oop: 95.0, interview: 92.0 },
    { name: 'Arjun Mehta', email: 'arjun@placementhub.com', overall: 89.0, aptitude: 90.0, reasoning: 91.0, verbal: 88.0, dsa: 90.0, dbms: 92.0, os: 85.0, cn: 87.0, oop: 88.0, interview: 90.0 },
    { name: 'Sneha Reddy', email: 'sneha@placementhub.com', overall: 85.0, aptitude: 85.0, reasoning: 86.0, verbal: 83.0, dsa: 87.0, dbms: 84.0, os: 88.0, cn: 82.0, oop: 85.0, interview: 86.0 },
    { name: 'Rohan Joshi', email: 'rohan@placementhub.com', overall: 82.0, aptitude: 84.0, reasoning: 83.0, verbal: 81.0, dsa: 80.0, dbms: 85.0, os: 82.0, cn: 80.0, oop: 83.0, interview: 84.0 },
    { name: 'Kiara Kapoor', email: 'kiara@placementhub.com', overall: 79.0, aptitude: 80.0, reasoning: 79.0, verbal: 82.0, dsa: 76.0, dbms: 80.0, os: 78.0, cn: 81.0, oop: 82.0, interview: 80.0 },
    { name: 'Amit Sharma', email: 'amit@placementhub.com', overall: 76.0, aptitude: 77.0, reasoning: 78.0, verbal: 75.0, dsa: 74.0, dbms: 75.0, os: 77.0, cn: 74.0, oop: 78.0, interview: 77.0 },
    { name: 'Divya Nair', email: 'divya@placementhub.com', overall: 73.0, aptitude: 75.0, reasoning: 74.0, verbal: 72.0, dsa: 71.0, dbms: 72.0, os: 73.0, cn: 71.0, oop: 75.0, interview: 74.0 }
  ];

  for (const ms of mockStudentsData) {
    const u = await prisma.user.create({
      data: {
        email: ms.email,
        name: ms.name,
        passwordHash,
        role: 'STUDENT',
        isVerified: true,
        emailVerified: true
      }
    });

    const prof = await prisma.profile.create({
      data: {
        userId: u.id,
        collegeId: ldrpCollege.id,
        branch: 'Computer Engineering',
        gradYear: 2026,
        cgpa: 8.0,
        targetRole: 'SOFTWARE_ENGINEER'
      }
    });

    await prisma.studentSkillScore.create({
      data: {
        profileId: prof.id,
        aptitudeScore: ms.aptitude,
        reasoningScore: ms.reasoning,
        verbalScore: ms.verbal,
        dsaScore: ms.dsa,
        dbmsScore: ms.dbms,
        osScore: ms.os,
        cnScore: ms.cn,
        oopScore: ms.oop,
        interviewScore: ms.interview,
        overallScore: ms.overall
      }
    });
  }

  // Create Badges
  const badgeData = [
    { name: 'First Test Completed', description: 'Awarded for completing your first assessment test.', icon: 'Award' },
    { name: 'Aptitude Master', description: 'Awarded for achieving 85%+ score in any Aptitude mock test.', icon: 'Zap' },
    { name: 'DBMS Expert', description: 'Awarded for scoring 90%+ in the Technical DBMS test.', icon: 'Database' },
    { name: '7 Day Streak', description: 'Maintained a daily practice streak of 7 days.', icon: 'Flame' },
    { name: 'Placement Warrior', description: 'Maintained a daily practice streak of 30 days.', icon: 'Shield' }
  ];
  const badgesMap: Record<string, any> = {};
  for (const b of badgeData) {
    badgesMap[b.name] = await prisma.badge.create({ data: b });
  }

  await prisma.userBadge.create({
    data: {
      profileId: profile.id,
      badgeId: badgesMap['First Test Completed'].id,
    }
  });

  // Create Skill Weights
  const weightData = [
    { role: 'SOFTWARE_ENGINEER', skillName: 'Aptitude', weight: 0.15 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'Reasoning', weight: 0.10 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'Verbal', weight: 0.10 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'DSA', weight: 0.20 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'DBMS', weight: 0.10 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'OS', weight: 0.10 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'CN', weight: 0.10 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'OOP', weight: 0.10 },
    { role: 'SOFTWARE_ENGINEER', skillName: 'Interview', weight: 0.05 },
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

  // Initial student scores
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
      overallScore: 74.0,
    }
  });

  // Create Categories & Subcategories
  const categoriesData = [
    { name: 'Aptitude', subcategories: ['Profit and Loss', 'Percentage', 'Probability', 'Time and Work', 'Time Speed Distance'] },
    { name: 'Reasoning', subcategories: ['Blood Relations', 'Direction', 'Seating Arrangement', 'Coding-Decoding', 'Puzzles'] },
    { name: 'Verbal', subcategories: ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Sentence Correction'] },
    { name: 'Technical', subcategories: ['DBMS', 'OS', 'CN', 'OOP', 'SQL'] },
    { name: 'DSA', subcategories: ['Arrays', 'Strings', 'Linked Lists', 'Stacks and Queues', 'Trees', 'Graphs', 'DP', 'Sorting and Searching'] }
  ];

  const subcatsMap: Record<string, any> = {};
  const categoryMap: Record<string, any> = {};
  for (const catInfo of categoriesData) {
    const cat = await prisma.category.create({ data: { name: catInfo.name } });
    categoryMap[catInfo.name] = cat;
    for (const subName of catInfo.subcategories) {
      subcatsMap[subName] = await prisma.subCategory.create({
        data: { name: subName, categoryId: cat.id }
      });
    }
  }
  console.log('Seeded Categories and Subcategories.');

  // Create 10 Companies
  const companiesList = [
    { name: 'Amazon', logoUrl: '12 - 40 LPA', packageRange: '12 - 40 LPA', difficulty: 'Hard' },
    { name: 'Microsoft', logoUrl: '15 - 45 LPA', packageRange: '15 - 45 LPA', difficulty: 'Hard' },
    { name: 'Google', logoUrl: '18 - 55 LPA', packageRange: '18 - 55 LPA', difficulty: 'Hard' },
    { name: 'TCS', logoUrl: '3.3 - 7.5 LPA', packageRange: '3.3 - 7.5 LPA', difficulty: 'Easy' },
    { name: 'Infosys', logoUrl: '3.6 - 8.0 LPA', packageRange: '3.6 - 8.0 LPA', difficulty: 'Easy' },
    { name: 'Accenture', logoUrl: '4.5 - 9.5 LPA', packageRange: '4.5 - 9.5 LPA', difficulty: 'Medium' },
    { name: 'Capgemini', logoUrl: '4.0 - 8.5 LPA', packageRange: '4.0 - 8.5 LPA', difficulty: 'Medium' },
    { name: 'Cognizant', logoUrl: '4.0 - 8.5 LPA', packageRange: '4.0 - 8.5 LPA', difficulty: 'Medium' },
    { name: 'Deloitte', logoUrl: '6.0 - 12.0 LPA', packageRange: '6.0 - 12.0 LPA', difficulty: 'Medium' },
    { name: 'IBM', logoUrl: '7.0 - 18.0 LPA', packageRange: '7.0 - 18.0 LPA', difficulty: 'Medium' },
  ];

  const companiesMap: Record<string, any> = {};
  for (const c of companiesList) {
    companiesMap[c.name] = await prisma.company.create({
      data: {
        name: c.name,
        logoUrl: c.logoUrl,
        hiringPattern: `### ${c.name} Hiring Outline\n1. Online Assessment (OA)\n2. Technical Rounds\n3. HR & Managerial Rounds`,
        eligibilityCriteria: `Minimum 65% or 6.5 CGPA in graduation, with no active backlogs.`,
      }
    });
  }
  console.log('Seeded 10 Companies.');

  // Programmatic Question Generators (2000 Questions) - FULLY PARAMETERIZED TO PREVENT DUPLICATES
  console.log('Generating 2,000+ distinct mock questions...');
  const allQuestionsPool: any[] = [];

  // 1. Aptitude (400 questions)
  const aptSubcats = categoriesData[0].subcategories;
  for (let i = 0; i < 400; i++) {
    const subcatName = aptSubcats[i % aptSubcats.length];
    const subcat = subcatsMap[subcatName];
    const val1 = 10 + (i * 3) % 40;
    const val2 = 15 + (i * 5) % 45;
    let text = '';
    let options: string[] = [];
    let correctIdx = 0;
    let explanation = '';
    
    if (subcatName === 'Profit and Loss') {
      const items = ['wristwatch', 'smartphone', 'laptop', 'bicycle', 'dining table', 'backpack', 'camera', 'office chair'];
      const item = items[i % items.length];
      const sp = val2 * 10;
      const profitPct = val1;
      const cp = Math.round((sp * 100) / (100 + profitPct));
      
      text = `A trader sells a ${item} for Rs. ${sp} at an estimated profit of ${profitPct}%. What is the cost price? (ID: ${i})`;
      options = [`Rs. ${cp}`, `Rs. ${cp - 20}`, `Rs. ${cp + 25}`, `Rs. ${Math.round(cp * 1.12)}`].sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(`Rs. ${cp}`);
      explanation = `Cost Price (CP) = (Selling Price * 100) / (100 + Profit Percentage) = (${sp} * 100) / (100 + ${profitPct}) = Rs. ${cp}.`;
      
    } else if (subcatName === 'Percentage') {
      const names = ['Rohan', 'Sneha', 'Vikram', 'Meera', 'Aniket', 'Kriti', 'Sanjay', 'Pooja'];
      const name = names[i % names.length];
      const total = 120 + (i * 12) % 480;
      const pct = 35 + (i * 4) % 60;
      const marks = Math.round((total * pct) / 100);
      
      text = `In a placement screening test, ${name} scored ${marks} marks out of a maximum of ${total}. What percentage did they secure? (ID: ${i})`;
      options = [`${pct}%`, `${pct - 5}%`, `${pct + 6}%`, `${(pct * 1.15).toFixed(1)}%`].sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(`${pct}%`);
      explanation = `Percentage = (Scored Marks / Maximum Marks) * 100 = (${marks} / ${total}) * 100 = ${pct}%.`;
      
    } else if (subcatName === 'Probability') {
      const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'orange'];
      const c1 = colors[i % colors.length];
      const c2 = colors[(i + 1) % colors.length];
      const count1 = 3 + (i % 6);
      const count2 = 4 + ((i * 2) % 8);
      const total = count1 + count2;
      
      text = `A container contains ${count1} ${c1} cards and ${count2} ${c2} cards. If one card is drawn at random, what is the probability that it is a ${c1} card? (ID: ${i})`;
      options = [`${count1}/${total}`, `${count1 - 1}/${total}`, `${count1}/${total + 2}`, `1/2`].sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(`${count1}/${total}`);
      explanation = `Probability = Number of Favorable Outcomes / Total Outcomes = ${count1} / (${count1} + ${count2}) = ${count1}/${total}.`;
      
    } else if (subcatName === 'Time and Work') {
      const names = ['Amit', 'Brijesh', 'Chetan', 'Deepak', 'Eshwar', 'Farhan', 'Ganesh', 'Hari'];
      const name1 = names[i % names.length];
      const name2 = names[(i + 1) % names.length];
      const t1 = 6 + (i % 12);
      const t2 = 8 + ((i * 2) % 16);
      const combined = parseFloat(((t1 * t2) / (t1 + t2)).toFixed(2));
      
      text = `If ${name1} can complete a coding module in ${t1} days and ${name2} can complete the same module in ${t2} days, how many days will they take working together? (ID: ${i})`;
      options = [`${combined} days`, `${(combined + 1.2).toFixed(2)} days`, `${(combined - 0.8).toFixed(2)} days`, `${Math.round(combined * 1.3)} days`].sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(`${combined} days`);
      explanation = `Combined Rate = 1/${t1} + 1/${t2} = (${t1} + ${t2}) / (${t1} * ${t2}). Time = ${t1} * ${t2} / (${t1} + ${t2}) = ${combined} days.`;
      
    } else { // Time Speed Distance
      const vehicles = ['train', 'sports car', 'electric scooter', 'delivery van', 'cyclist'];
      const vehicle = vehicles[i % vehicles.length];
      const speed = 25 + (i * 4) % 110;
      const time = 2 + (i % 6);
      const distance = speed * time;
      
      text = `A ${vehicle} travels at a constant average speed of ${speed} km/h for a duration of ${time} hours. Find the total distance covered. (ID: ${i})`;
      options = [`${distance} km`, `${distance - 15} km`, `${distance + 20} km`, `${distance * 1.2} km`].sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(`${distance} km`);
      explanation = `Distance = Speed * Time = ${speed} km/h * ${time} hours = ${distance} km.`;
    }

    allQuestionsPool.push({
      text,
      options,
      correctAnswer: correctIdx,
      explanation,
      difficulty: i % 3 === 0 ? 'EASY' : (i % 3 === 1 ? 'MEDIUM' : 'HARD'),
      subCategoryId: subcat.id,
      frequencyScore: 50 + (i * 11) % 45,
      askedInCompanies: ['TCS', 'Infosys', 'Cognizant', 'Accenture'].slice(0, 1 + (i % 4)),
      estimatedTime: 60 + (i % 3) * 60,
      tags: [subcatName, 'Aptitude']
    });
  }

  // 2. Reasoning (400 questions)
  const reasoningSubcats = categoriesData[1].subcategories;
  for (let i = 0; i < 400; i++) {
    const subcatName = reasoningSubcats[i % reasoningSubcats.length];
    const subcat = subcatsMap[subcatName];
    
    let text = '';
    let options: string[] = [];
    let correctIdx = 0;
    let explanation = '';
    
    if (subcatName === 'Blood Relations') {
      const names = ['Kiran', 'Pooja', 'Vikram', 'Anjali', 'Rohan', 'Sneha', 'Varun', 'Neha'];
      const name = names[i % names.length];
      
      const templates = [
        {
          q: `Pointing to a photograph, ${name} said: "His mother is the only daughter-in-law of my father." How is ${name} related to the person in the photograph? (ID: ${i})`,
          a: 'Father',
          e: `My father's only daughter-in-law is ${name}'s wife. Her son is ${name}'s son. So ${name} is the father.`
        },
        {
          q: `If A is the brother of B, B is the sister of C, and C is the father of D, how is A related to D? (ID: ${i})`,
          a: 'Uncle',
          e: `C is D's father. A is C's brother (since A is B's brother and B is C's sister). Therefore, A is the paternal uncle of D.`
        },
        {
          q: `Pointing to a woman, ${name} said: "She is the mother of my father's only grandchild." How is the woman related to ${name}? (ID: ${i})`,
          a: 'Wife',
          e: `${name}'s father's only grandchild is ${name}'s child. The mother of ${name}'s child is ${name}'s wife.`
        },
        {
          q: `If X is the brother of Y, Y is the daughter of Z, and Z is the wife of W, how is X related to W? (ID: ${i})`,
          a: 'Son',
          e: `Z is W's wife. Y is Z's daughter, meaning Y is W's daughter. X is Y's brother, so X is W's son.`
        }
      ];
      
      const t = templates[i % templates.length];
      text = t.q;
      options = [t.a, 'Brother', 'Uncle', 'Grandfather'].sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(t.a);
      explanation = t.e;
      
    } else if (subcatName === 'Direction') {
      const names = ['Amit', 'Bina', 'Charu', 'Dev', 'Esha'];
      const name = names[i % names.length];
      const d1 = 5 + (i * 4) % 15;
      const d2 = 3 + (i * 3) % 10;
      const d3 = d1;
      
      text = `${name} walks ${d1} meters North, turns right and walks ${d2} meters, then turns right again and walks ${d3} meters. Find the distance and direction from starting point. (ID: ${i})`;
      options = [`${d2} meters East`, `${d2} meters West`, `${d1 + d2} meters North`, `0 meters`].sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(`${d2} meters East`);
      explanation = `The path forms a three-sided rectangle. The distance between starting and ending point is equal to the Eastward segment: ${d2} meters.`;
      
    } else if (subcatName === 'Seating Arrangement') {
      const num = 5 + (i % 4);
      const dir = i % 2 === 0 ? 'facing the center' : 'facing outwards';
      text = `${num} developers sit in a circle ${dir} during a standup. If A sits adjacent to B and 2nd to the left of C, who is adjacent to C? (ID: ${i})`;
      options = ['Cannot be determined', 'A', 'B', 'Both A and B'].sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf('Cannot be determined');
      explanation = `Due to incomplete constraints on the positions of other developers, the exact neighbor cannot be uniquely determined.`;
      
    } else if (subcatName === 'Coding-Decoding') {
      const offset = 1 + (i % 3);
      const words = ['JAVA', 'DBMS', 'CODE', 'NODE', 'HTML', 'LINK', 'TREE', 'HEAP'];
      const word1 = words[i % words.length];
      const word2 = words[(i + 1) % words.length];
      
      const shiftWord = (w: string, off: number) => {
        return w.split('').map(char => String.fromCharCode(char.charCodeAt(0) + off)).join('');
      };
      
      const code1 = shiftWord(word1, offset);
      const code2 = shiftWord(word2, offset);
      
      text = `If the word '${word1}' is encoded as '${code1}' in a certain cipher, how is '${word2}' encoded? (ID: ${i})`;
      options = [code2, shiftWord(word2, offset + 1), shiftWord(word2, offset - 1), 'None of these'].sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(code2);
      explanation = `Each character is shifted forward in the alphabet by +${offset} positions. Shifting '${word2}' by +${offset} yields '${code2}'.`;
      
    } else { // Puzzles
      const val = 10 + (i * 5) % 50;
      text = `Five files have different sizes. File A is twice the size of B. B is ${val} MB larger than C. If C is ${val} MB, what is the size of File A? (ID: ${i})`;
      const sizeC = val;
      const sizeB = sizeC + val;
      const sizeA = sizeB * 2;
      
      options = [`${sizeA} MB`, `${sizeA - 10} MB`, `${sizeB} MB`, `${sizeA + 20} MB`].sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(`${sizeA} MB`);
      explanation = `C = ${sizeC} MB. B = C + ${val} = ${sizeB} MB. A = 2 * B = 2 * ${sizeB} = ${sizeA} MB.`;
    }

    allQuestionsPool.push({
      text,
      options,
      correctAnswer: correctIdx,
      explanation,
      difficulty: i % 3 === 0 ? 'EASY' : (i % 3 === 1 ? 'MEDIUM' : 'HARD'),
      subCategoryId: subcat.id,
      frequencyScore: 50 + (i * 7) % 45,
      askedInCompanies: ['TCS', 'Wipro', 'Capgemini'].slice(0, 1 + (i % 3)),
      estimatedTime: 60 + (i % 2) * 60,
      tags: [subcatName, 'Reasoning']
    });
  }

  // 3. Verbal (400 questions)
  const verbalSubcats = categoriesData[2].subcategories;
  for (let i = 0; i < 400; i++) {
    const subcatName = verbalSubcats[i % verbalSubcats.length];
    const subcat = subcatsMap[subcatName];
    
    let text = '';
    let options: string[] = [];
    let correctIdx = 0;
    let explanation = '';
    
    if (subcatName === 'Grammar') {
      const templates = [
        { q: `Choose the correct verb: "Neither the directors nor the manager _____ present at yesterday's meeting." (ID: ${i})`, a: 'was', opts: ['was', 'were', 'are', 'have been'], e: 'When subjects are joined by "neither... nor", the verb agrees with the closer subject ("manager" which is singular, hence "was").' },
        { q: `Choose the correct form: "Each of the candidates _____ submitted their resume files." (ID: ${i})`, a: 'has', opts: ['has', 'have', 'having', 'were'], e: '"Each" is an indefinite singular pronoun, requiring the singular verb "has".' },
        { q: `Choose the correct pronoun: "Between you and _____, the system design was flawed." (ID: ${i})`, a: 'me', opts: ['me', 'I', 'myself', 'we'], e: 'The preposition "between" requires object pronouns (me), not subject pronouns (I).' },
        { q: `Fill in the blank: "If I _____ in your position, I would accept the software engineer offer." (ID: ${i})`, a: 'were', opts: ['were', 'was', 'am', 'be'], e: 'Subjunctive mood expresses hypothetical situations, requiring the plural verb "were" regardless of subject singular state.' }
      ];
      const t = templates[i % templates.length];
      text = t.q;
      options = t.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(t.a);
      explanation = t.e;
      
    } else if (subcatName === 'Vocabulary') {
      const vocabList = [
        { word: 'EPHEMERAL', syn: 'Transient', opts: ['Transient', 'Permanent', 'Deep', 'Beautiful'], e: 'Ephemeral means lasting for a very short time; transient.' },
        { word: 'METICULOUS', syn: 'Precise', opts: ['Precise', 'Careless', 'Active', 'Huge'], e: 'Meticulous means showing great attention to detail; precise.' },
        { word: 'RECALCITRANT', syn: 'Uncooperative', opts: ['Uncooperative', 'Docile', 'Polite', 'Quick'], e: 'Recalcritant means having an obstinately uncooperative attitude toward authority.' },
        { word: 'LOQUACIOUS', syn: 'Talkative', opts: ['Talkative', 'Silent', 'Smart', 'Sad'], e: 'Loquacious means tending to talk a great deal; talkative.' },
        { word: 'VACILLATE', syn: 'Waver', opts: ['Waver', 'Decide', 'Collect', 'Build'], e: 'Vacillate means to waver between different opinions or actions.' }
      ];
      const v = vocabList[i % vocabList.length];
      text = `Select the synonym closest in meaning to the word: '${v.word}' (ID: ${i})`;
      options = v.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(v.syn);
      explanation = v.e;
      
    } else if (subcatName === 'Reading Comprehension') {
      const passages = [
        { p: 'Continuous deployment allows software to be released to users automatically after passing tests.', q: 'What is the primary benefit of continuous deployment according to the passage?', a: 'Automated release of code', e: 'The passage explicitly states that code is released to users automatically.' },
        { p: 'Subnetting partitions a large network into smaller, logical sub-networks to reduce collision domains.', q: 'What is the primary technical objective of subnetting according to the passage?', a: 'Creating smaller logical networks', e: 'The passage states that subnetting divides a large network into smaller sub-networks.' },
        { p: 'Polymorphism allows objects of different classes to be treated as objects of a common superclass.', q: 'What is the main feature of polymorphism described?', a: 'Uniform interface for different classes', e: 'It allows treating different classes uniformly under a common superclass.' }
      ];
      const p = passages[i % passages.length];
      text = `Passage: "${p.p}"\n\nQuestion: ${p.q} (ID: ${i})`;
      options = [p.a, 'Reducing server costs', 'Eliminating testing stages', 'Increasing code size'].sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(p.a);
      explanation = p.e;
      
    } else { // Sentence Correction
      const sentences = [
        { bad: 'He is one of those employees who always does his best.', good: 'He is one of those employees who always do their best.', opts: ['He is one of those employees who always do their best.', 'He is one of those employees who always does his best.', 'He is one of those employee who always do their best.', 'He is one of those employees who always doing their best.'], e: 'The relative pronoun "who" refers to "employees" (plural), requiring plural verb "do" and pronoun "their".' },
        { bad: 'The recruiter has already scheduled the interviews since two hours.', good: 'The recruiter has already scheduled the interviews for two hours.', opts: ['The recruiter has already scheduled the interviews for two hours.', 'The recruiter has already scheduled the interviews since two hours.', 'The recruiter already scheduled the interviews since two hours.', 'The recruiter has been scheduling the interviews since two hours.'], e: 'For durations of time (two hours), use "for" instead of "since".' }
      ];
      const s = sentences[i % sentences.length];
      text = `Identify the grammatically correct rewrite of: "${s.bad}" (ID: ${i})`;
      options = s.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(s.good);
      explanation = s.e;
    }

    allQuestionsPool.push({
      text,
      options,
      correctAnswer: correctIdx,
      explanation,
      difficulty: i % 3 === 0 ? 'EASY' : (i % 3 === 1 ? 'MEDIUM' : 'HARD'),
      subCategoryId: subcat.id,
      frequencyScore: 40 + (i * 9) % 55,
      askedInCompanies: ['Deloitte', 'IBM', 'Accenture'].slice(0, 1 + (i % 3)),
      estimatedTime: 45 + (i % 2) * 45,
      tags: [subcatName, 'Verbal']
    });
  }

  // 4. Technical (400 questions)
  const techSubcats = categoriesData[3].subcategories;
  for (let i = 0; i < 400; i++) {
    const subcatName = techSubcats[i % techSubcats.length];
    const subcat = subcatsMap[subcatName];
    
    let text = '';
    let options: string[] = [];
    let correctIdx = 0;
    let explanation = '';
    
    if (subcatName === 'DBMS') {
      const concepts = [
        { q: 'Which normal form guarantees the removal of transitive dependencies?', a: '3NF', opts: ['3NF', '2NF', '1NF', 'BCNF'], e: '3NF removes transitive dependency where a non-prime attribute depends transitively on the primary key.' },
        { q: 'In BCNF, for every functional dependency X -> Y, what must X be?', a: 'Super key', opts: ['Super key', 'Prime attribute', 'Candidate key', 'Foreign key'], e: 'BCNF requires that for any dependency X -> Y, X must be a super key.' },
        { q: 'Which ACID property guarantees that all transactions are completed in isolation from each other?', a: 'Isolation', opts: ['Isolation', 'Atomicity', 'Consistency', 'Durability'], e: 'Isolation ensures concurrent transactions do not interfere with each other.' },
        { q: 'Which transaction isolation level prevents dirty reads but allows non-repeatable reads?', a: 'Read Committed', opts: ['Read Committed', 'Read Uncommitted', 'Repeatable Read', 'Serializable'], e: 'Read Committed guarantees no dirty reads but permits non-repeatable reads.' }
      ];
      const c = concepts[i % concepts.length];
      text = `Concept Check: ${c.q} (Ref DBMS-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
      
    } else if (subcatName === 'OS') {
      const qNum = 1 + (i % 10);
      const frames = 3 + (i % 2);
      const concepts = [
        { q: `Under CPU Round Robin scheduling with time quantum q = ${qNum}ms, if a process burst is ${qNum * 2}ms, how many context switches occur?`, a: '1', opts: ['1', '2', '0', '3'], e: `Process runs for ${qNum}ms, gets preempted (1 context switch), and runs the remaining ${qNum}ms.` },
        { q: `What is the frame allocation fault count for LRU page replacement on string "1 2 3 4 1 2" with ${frames} frames?`, a: `${frames + 2}`, opts: [`${frames + 2}`, `${frames}`, `${frames + 1}`, `${frames + 3}`], e: `LRU processes pages and registers page faults for initial loads plus replacements.` },
        { q: 'Which condition is NOT necessary for a deadlock to occur?', a: 'Preemption', opts: ['Preemption', 'Mutual Exclusion', 'Hold and Wait', 'Circular Wait'], e: 'Deadlocks require NO preemption. Allowing preemption resolves the deadlock.' }
      ];
      const c = concepts[i % concepts.length];
      text = `Process Scheduling: ${c.q} (Ref OS-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
      
    } else if (subcatName === 'CN') {
      const hostBits = 4 + (i % 6);
      const submask = 32 - hostBits;
      const totalHosts = Math.pow(2, hostBits) - 2;
      const concepts = [
        { q: `Under CIDR notation prefix /${submask}, how many usable host IP addresses are available in the subnet?`, a: `${totalHosts}`, opts: [`${totalHosts}`, `${totalHosts + 2}`, `${totalHosts - 2}`, `256`], e: `Number of hosts = 2^(32 - ${submask}) - 2 = 2^${hostBits} - 2 = ${totalHosts}.` },
        { q: 'Which OSI layer is responsible for routing packets across multiple hops in the network?', a: 'Network Layer', opts: ['Network Layer', 'Physical Layer', 'Data Link Layer', 'Transport Layer'], e: 'The Network Layer handles logical IP addressing and packet routing.' },
        { q: 'What is the purpose of Address Resolution Protocol (ARP)?', a: 'Resolving IP address to MAC address', opts: ['Resolving IP address to MAC address', 'Translating private IP to public', 'Mapping domain names to IP', 'Filtering network packets'], e: 'ARP maps an IPv4 logical address to a physical MAC hardware address.' }
      ];
      const c = concepts[i % concepts.length];
      text = `Network Protocols: ${c.q} (Ref CN-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
      
    } else if (subcatName === 'OOP') {
      const concepts = [
        { q: 'In C++, how is a class made abstract?', a: 'Declaring at least one pure virtual function', opts: ['Declaring at least one pure virtual function', 'Making all fields private', 'Deriving from multiple base classes', 'Adding virtual keywords to fields'], e: 'Abstract classes are characterized by having at least one pure virtual function (= 0).' },
        { q: 'Which object-oriented principle restricts direct access to an object\'s fields and components?', a: 'Encapsulation', opts: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'], e: 'Encapsulation binds data and code together into a class, hiding inner details.' },
        { q: 'What is runtime polymorphism?', a: 'Overriding virtual functions resolved via vtable', opts: ['Overriding virtual functions resolved via vtable', 'Overloading function signatures', 'Compiling templates at compile-time', 'Creating copy constructors'], e: 'Runtime polymorphism executes subclass methods via virtual table (vtable) lookups at execution time.' }
      ];
      const c = concepts[i % concepts.length];
      text = `OOP Architecture: ${c.q} (Ref OOP-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
      
    } else { // SQL
      const concepts = [
        { q: 'Which SQL keyword filters records returned by a GROUP BY clause after aggregation?', a: 'HAVING', opts: ['HAVING', 'WHERE', 'ORDER BY', 'ON'], e: 'HAVING filters aggregated groups; WHERE filters rows before aggregation.' },
        { q: 'Which join type returns all records from the left table and matching records from the right table?', a: 'LEFT JOIN', opts: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'], e: 'LEFT JOIN yields all rows from the left side, filling right side columns with NULL if no match exists.' },
        { q: 'What does the UNION operator do?', a: 'Combines result sets of two queries removing duplicates', opts: ['Combines result sets of two queries removing duplicates', 'Merges columns of two tables on a key', 'Filters groups using aggregates', 'Creates temporary views'], e: 'UNION aggregates rows of two queries, removing duplicates. UNION ALL retains duplicates.' }
      ];
      const c = concepts[i % concepts.length];
      text = `SQL Execution: ${c.q} (Ref SQL-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
    }

    allQuestionsPool.push({
      text,
      options,
      correctAnswer: correctIdx,
      explanation,
      difficulty: i % 3 === 0 ? 'EASY' : (i % 3 === 1 ? 'MEDIUM' : 'HARD'),
      subCategoryId: subcat.id,
      frequencyScore: 60 + (i * 13) % 40,
      askedInCompanies: ['Microsoft', 'Google', 'IBM', 'Amazon'].slice(0, 1 + (i % 4)),
      estimatedTime: 90 + (i % 2) * 60,
      tags: [subcatName, 'Technical']
    });
  }

  // 5. DSA (400 questions)
  const dsaSubcats = categoriesData[4].subcategories;
  for (let i = 0; i < 400; i++) {
    const subcatName = dsaSubcats[i % dsaSubcats.length];
    const subcat = subcatsMap[subcatName];
    
    let text = '';
    let options: string[] = [];
    let correctIdx = 0;
    let explanation = '';
    
    if (subcatName === 'Arrays') {
      const val = 2 + (i % 6);
      const concepts = [
        { q: `What is the worst-case time complexity of Kadane's algorithm on an array of size N?`, a: 'O(N)', opts: ['O(N)', 'O(N log N)', 'O(N^2)', 'O(1)'], e: 'Kadane\'s algorithm scans the array exactly once, giving O(N) complexity.' },
        { q: `Under two-pointer search on a sorted array of size N, what is the maximum number of comparisons to find a target sum?`, a: 'O(N)', opts: ['O(N)', 'O(log N)', 'O(N log N)', 'O(1)'], e: 'The pointers start at the ends and meet in the middle, running at most N steps.' },
        { q: `If we rotate an array of size N by K positions where K = N + ${val}, how many net shifts occur?`, a: `${val}`, opts: [`${val}`, `${val + 1}`, `0`, `K`], e: `Rotating by N positions results in the same array. Net shifts = K % N = (N + ${val}) % N = ${val}.` }
      ];
      const c = concepts[i % concepts.length];
      text = `Array Algorithms: ${c.q} (Ref Array-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
      
    } else if (subcatName === 'Strings') {
      const concepts = [
        { q: 'Which data structure is optimized to match character prefixes of strings efficiently?', a: 'Trie', opts: ['Trie', 'Binary Search Tree', 'Hash Map', 'Heap'], e: 'Tries store character tokens along path nodes, permitting prefix lookup in O(L) time.' },
        { q: 'What is the time complexity of building a frequency map of characters for an anagram check on string of size N?', a: 'O(N)', opts: ['O(N)', 'O(N log N)', 'O(1)', 'O(N^2)'], e: 'We iterate through the N characters exactly once to populate counts.' },
        { q: 'Which algorithm is optimal for substring pattern matching finding offsets?', a: 'KMP Algorithm', opts: ['KMP Algorithm', 'BFS Traversal', 'Kadane Algorithm', 'Binary Search'], e: 'Knuth-Morris-Pratt (KMP) matches substrings in O(N + M) time using a prefix table.' }
      ];
      const c = concepts[i % concepts.length];
      text = `String Processing: ${c.q} (Ref String-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
      
    } else if (subcatName === 'Linked Lists') {
      const concepts = [
        { q: 'How do you detect a cycle in a singly linked list using O(1) auxiliary space?', a: 'Floyd\'s Cycle Finding (Tortoise & Hare)', opts: ['Floyd\'s Cycle Finding (Tortoise & Hare)', 'Hashing node addresses', 'Recursive traversal depth', 'Binary pointer matching'], e: 'Floyd\'s algorithm uses slow and fast pointers to detect cycles in O(1) space.' },
        { q: 'What is the pointer manipulation complexity to reverse a singly linked list of size N?', a: 'O(N) time, O(1) space', opts: ['O(N) time, O(1) space', 'O(N) time, O(N) space', 'O(N^2) time, O(1) space', 'O(log N) time, O(1) space'], e: 'Reversing is done in a single pass using three pointers (prev, curr, next).' },
        { q: 'To find the middle of a linked list in a single pass, what pointers strategy is used?', a: 'Fast pointer moves twice the speed of slow pointer', opts: ['Fast pointer moves twice the speed of slow pointer', 'Calculate length first, then loop', 'Stack accumulation', 'Two-way links traversal'], e: 'When the fast pointer reaches the end, the slow pointer will be exactly at the middle.' }
      ];
      const c = concepts[i % concepts.length];
      text = `Linked List Operations: ${c.q} (Ref List-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
      
    } else if (subcatName === 'Stacks and Queues') {
      const concepts = [
        { q: 'Which data structure follows the Last-In-First-Out (LIFO) pattern?', a: 'Stack', opts: ['Stack', 'Queue', 'Deque', 'Heap'], e: 'Stacks insert and remove elements from the same end (LIFO).' },
        { q: 'How is a queue implemented using two stacks?', a: 'Pushing to stack1, transferring to stack2 for popping', opts: ['Pushing to stack1, transferring to stack2 for popping', 'Alternating insertions between stacks', 'Linking bottoms of stacks', 'Impossible to implement'], e: 'Enqueue pushes to stack1. Dequeue pops from stack2 (transferring from stack1 first if empty).' },
        { q: 'What is the time complexity of checking if parentheses are balanced in a string using a stack?', a: 'O(N)', opts: ['O(N)', 'O(N log N)', 'O(1)', 'O(N^2)'], e: 'We scan the string once, performing push/pop operations in O(1).' }
      ];
      const c = concepts[i % concepts.length];
      text = `Stack & Queue Operations: ${c.q} (Ref Stack-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
      
    } else if (subcatName === 'Trees') {
      const concepts = [
        { q: 'Which binary tree traversal visits nodes in the order: Left, Right, Root?', a: 'Postorder Traversal', opts: ['Postorder Traversal', 'Preorder Traversal', 'Inorder Traversal', 'Level Order'], e: 'Postorder traversal recursively visits left, right, and then processes the root.' },
        { q: 'In a balanced Binary Search Tree (BST) of size N, what is the search complexity?', a: 'O(log N)', opts: ['O(log N)', 'O(N)', 'O(N log N)', 'O(1)'], e: 'A balanced BST height is bounded by O(log N), keeping searches to O(log N).' },
        { q: 'What is the inorder traversal of a Binary Search Tree (BST) guaranteed to be?', a: 'Sorted in ascending order', opts: ['Sorted in ascending order', 'Sorted in descending order', 'Random list of values', 'Breadth-first values list'], e: 'BST properties specify left < root < right, meaning inorder (left, root, right) yields sorted output.' }
      ];
      const c = concepts[i % concepts.length];
      text = `Tree Structures: ${c.q} (Ref Tree-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
      
    } else if (subcatName === 'Graphs') {
      const concepts = [
        { q: 'Which traversal algorithm uses a queue to explore nodes level-by-level?', a: 'Breadth-First Search (BFS)', opts: ['Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Dijkstra\'s Algorithm', 'Kruskal\'s Algorithm'], e: 'BFS uses a FIFO queue to visit adjacent nodes systematically.' },
        { q: 'What is the time complexity of Dijkstra\'s shortest path algorithm using a min-heap?', a: 'O((V + E) log V)', opts: ['O((V + E) log V)', 'O(V^2)', 'O(E^2)', 'O(V + E)'], e: 'Extracting min node and relaxing neighbors takes O(log V) per vertex and edge.' },
        { q: 'Which algorithm is used to find the Minimum Spanning Tree of a graph by sorting edges first?', a: 'Kruskal\'s Algorithm', opts: ['Kruskal\'s Algorithm', 'Prim\'s Algorithm', 'Dijkstra\'s Algorithm', 'Bellman-Ford'], e: 'Kruskal\'s sorts edges by weight and inserts them using union-find structures.' }
      ];
      const c = concepts[i % concepts.length];
      text = `Graph Traversals: ${c.q} (Ref Graph-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
      
    } else if (subcatName === 'DP') {
      const concepts = [
        { q: 'What is the time complexity of the 0-1 Knapsack problem using dynamic programming with N items and capacity W?', a: 'O(N * W)', opts: ['O(N * W)', 'O(2^N)', 'O(N log N)', 'O(N + W)'], e: 'The DP state matrix has size N * W, and each transition takes O(1).' },
        { q: 'What is the difference between memoization and tabulation in DP?', a: 'Memoization is top-down caching; Tabulation is bottom-up iteration', opts: ['Memoization is top-down caching; Tabulation is bottom-up iteration', 'Tabulation is recursive; Memoization is iterative', 'Memoization uses more time than Tabulation', 'No differences exist'], e: 'Memoization caches recursive states (top-down); tabulation fills table cells sequentially (bottom-up).' },
        { q: 'What is the space complexity of calculating the Nth Fibonacci number using space-optimized DP?', a: 'O(1)', opts: ['O(1)', 'O(N)', 'O(N^2)', 'O(log N)'], e: 'We only need to keep track of the previous two fibonacci values, requiring O(1) space.' }
      ];
      const c = concepts[i % concepts.length];
      text = `Dynamic Programming: ${c.q} (Ref DP-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
      
    } else { // Sorting and Searching
      const concepts = [
        { q: 'Which sorting algorithm has a worst-case time complexity of O(N^2) but average-case of O(N log N)?', a: 'Quick Sort', opts: ['Quick Sort', 'Merge Sort', 'Heap Sort', 'Bubble Sort'], e: 'Quick Sort takes O(N^2) if pivot selections are highly unbalanced (e.g. sorted arrays).' },
        { q: 'Which sorting algorithm guarantees O(N log N) time complexity in all cases and is stable?', a: 'Merge Sort', opts: ['Merge Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'], e: 'Merge Sort uses divide-and-conquer, guaranteeing O(N log N) time, and is stable.' },
        { q: 'What is the minimum number of comparisons needed to search for a value in a sorted array of size N?', a: 'O(log N)', opts: ['O(log N)', 'O(N)', 'O(1)', 'O(N log N)'], e: 'Binary search repeatedly halves the active window, taking O(log N) comparisons.' }
      ];
      const c = concepts[i % concepts.length];
      text = `Sorting & Searching: ${c.q} (Ref Sort-${i})`;
      options = c.opts.sort(() => Math.random() - 0.5);
      correctIdx = options.indexOf(c.a);
      explanation = c.e;
    }

    allQuestionsPool.push({
      text,
      options,
      correctAnswer: correctIdx,
      explanation,
      difficulty: i % 3 === 0 ? 'EASY' : (i % 3 === 1 ? 'MEDIUM' : 'HARD'),
      subCategoryId: subcat.id,
      frequencyScore: 70 + (i * 17) % 30,
      askedInCompanies: ['Amazon', 'Microsoft', 'Google', 'Deloitte'].slice(0, 1 + (i % 4)),
      estimatedTime: 120 + (i % 2) * 60,
      tags: [subcatName, 'DSA']
    });
  }

  // Seed Questions in batches of 100
  console.log(`Pool contains ${allQuestionsPool.length} questions. Seeding to DB...`);
  const seededQuestions: any[] = [];
  const batchSize = 100;
  for (let idx = 0; idx < allQuestionsPool.length; idx += batchSize) {
    const batch = allQuestionsPool.slice(idx, idx + batchSize);
    for (const q of batch) {
      const dbQ = await prisma.question.create({
        data: {
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          subCategoryId: q.subCategoryId,
          frequencyScore: q.frequencyScore,
          askedInCompanies: q.askedInCompanies,
          estimatedTime: q.estimatedTime,
          tags: q.tags,
        }
      });
      seededQuestions.push(dbQ);
    }
  }
  console.log(`Successfully seeded ${seededQuestions.length} Questions.`);

  // Group questions by category
  const questionsByCategory: Record<string, any[]> = {};
  for (const q of seededQuestions) {
    const subcat = await prisma.subCategory.findUnique({ where: { id: q.subCategoryId }, include: { category: true } });
    const catName = subcat!.category.name;
    if (!questionsByCategory[catName]) questionsByCategory[catName] = [];
    questionsByCategory[catName].push(q);
  }

  // Seed 40 TOPIC Tests
  console.log('Seeding 40 Topic Tests...');
  const allSubcatNames = Object.keys(subcatsMap);
  for (let i = 0; i < 40; i++) {
    const subcatName = allSubcatNames[i % allSubcatNames.length];
    const subcatObj = subcatsMap[subcatName];
    const catId = subcatObj.categoryId;
    const testQuestions = seededQuestions.filter(q => q.subCategoryId === subcatObj.id).slice(0, 20);
    if (testQuestions.length < 20) continue;

    const t = await prisma.test.create({
      data: {
        title: `${subcatName} Topic Practice #${1 + Math.floor(i / allSubcatNames.length)}`,
        description: `Deep-dive topic test covering ${subcatName} questions.`,
        duration: 30,
        difficulty: i % 3 === 0 ? 'EASY' : (i % 3 === 1 ? 'MEDIUM' : 'HARD'),
        type: 'TOPIC',
        categoryId: catId,
        createdByUserId: admin.id,
        tags: [subcatName, 'TopicTest']
      }
    });

    for (let j = 0; j < 20; j++) {
      await prisma.testQuestion.create({
        data: { testId: t.id, questionId: testQuestions[j].id, order: j + 1 }
      });
    }
  }

  // Seed 30 SECTIONAL Tests
  console.log('Seeding 30 Sectional Tests...');
  const catNames = Object.keys(categoryMap);
  for (let i = 0; i < 30; i++) {
    const catName = catNames[i % catNames.length];
    const cat = categoryMap[catName];
    const catQs = questionsByCategory[catName].slice(0, 20);

    const t = await prisma.test.create({
      data: {
        title: `${catName} Sectional Test #${1 + Math.floor(i / catNames.length)}`,
        description: `Comprehensive sectional test focusing on multiple topics under ${catName}.`,
        duration: 45,
        difficulty: i % 3 === 0 ? 'EASY' : (i % 3 === 1 ? 'MEDIUM' : 'HARD'),
        type: 'SECTIONAL',
        categoryId: cat.id,
        createdByUserId: admin.id,
        tags: [catName, 'Sectional']
      }
    });

    for (let j = 0; j < 20; j++) {
      await prisma.testQuestion.create({
        data: { testId: t.id, questionId: catQs[j].id, order: j + 1 }
      });
    }
  }

  // Seed 20 MOCK Tests
  console.log('Seeding 20 Full Mock Tests...');
  for (let i = 0; i < 20; i++) {
    const mockQuestions: any[] = [];
    for (const catName of catNames) {
      const qSlice = questionsByCategory[catName].slice(i * 4, (i + 1) * 4);
      mockQuestions.push(...qSlice);
    }

    const t = await prisma.test.create({
      data: {
        title: `Full Placement Mock Exam #${i + 1}`,
        description: `Full-length placement mock simulated exam incorporating Aptitude, Verbal, OS, DBMS, and DSA.`,
        duration: 60,
        difficulty: i % 2 === 0 ? 'MEDIUM' : 'HARD',
        type: 'MOCK',
        categoryId: categoryMap['Technical'].id,
        createdByUserId: admin.id,
        tags: ['Comprehensive', 'PlacementReady']
      }
    });

    for (let j = 0; j < mockQuestions.length; j++) {
      await prisma.testQuestion.create({
        data: { testId: t.id, questionId: mockQuestions[j].id, order: j + 1 }
      });
    }
  }

  // Seed 10 COMPANY Tests (linked to rounds)
  console.log('Seeding 10 Company Assessment Tests...');
  const companyRoundMockIds: Record<string, string> = {};
  const allTenCompanies = ['Amazon', 'Google', 'Microsoft', 'TCS', 'Infosys', 'Accenture', 'Capgemini', 'Cognizant', 'Deloitte', 'IBM'];

  for (let i = 0; i < 10; i++) {
    const compName = allTenCompanies[i];
    const compObj = companiesMap[compName];
    const mockQuestions = questionsByCategory['DSA'].slice(i * 10, i * 10 + 10)
      .concat(questionsByCategory['Technical'].slice(i * 5, i * 5 + 5))
      .concat(questionsByCategory['Aptitude'].slice(i * 5, i * 5 + 5));

    const t = await prisma.test.create({
      data: {
        title: `${compName} Official Online Mock Assessment`,
        description: `Official simulator exam based on previous recruitment rounds for ${compName}.`,
        duration: 90,
        difficulty: compName === 'Google' || compName === 'Microsoft' || compName === 'Amazon' ? 'HARD' : 'MEDIUM',
        type: 'COMPANY',
        categoryId: categoryMap['DSA'].id,
        companyId: compObj.id,
        createdByUserId: admin.id,
        tags: [compName, 'OA', 'Hiring2026']
      }
    });

    for (let j = 0; j < mockQuestions.length; j++) {
      await prisma.testQuestion.create({
        data: { testId: t.id, questionId: mockQuestions[j].id, order: j + 1 }
      });
    }

    companyRoundMockIds[compName] = t.id;
  }

  // Seed 1 BASELINE Assessment
  console.log('Seeding 1 Placement Baseline Assessment...');
  const baselineQs = seededQuestions.slice(0, 20);
  const baselineTest = await prisma.test.create({
    data: {
      title: 'Placement Baseline Assessment',
      description: 'First career diagnostic baseline test to calculate placement readiness.',
      duration: 30,
      difficulty: 'MEDIUM',
      type: 'BASELINE',
      categoryId: categoryMap['Technical'].id,
      createdByUserId: admin.id,
      tags: ['Baseline', 'Diagnostic']
    }
  });
  for (let j = 0; j < 20; j++) {
    await prisma.testQuestion.create({
      data: { testId: baselineTest.id, questionId: baselineQs[j].id, order: j + 1 }
    });
  }

  // Seed 1 OA_TEMPLATE Test
  console.log('Seeding 1 OA_TEMPLATE test...');
  const templateQs = seededQuestions.slice(20, 40);
  const oaTemplate = await prisma.test.create({
    data: {
      title: 'Standard SDE Online Assessment Template',
      description: 'Standard reusable template containing quantitative aptitude, core DBMS/OS, and coding algorithms.',
      duration: 90,
      difficulty: 'MEDIUM',
      type: 'OA_TEMPLATE',
      categoryId: categoryMap['DSA'].id,
      createdByUserId: admin.id,
      tags: ['Template', 'SDE', 'StandardOA']
    }
  });
  for (let j = 0; j < 20; j++) {
    await prisma.testQuestion.create({
      data: { testId: oaTemplate.id, questionId: templateQs[j].id, order: j + 1 }
    });
  }

  // Seed Company Rounds (Linking to seeded tests)
  console.log('Linking Company Rounds to seeded mock tests...');
  for (const compName of Object.keys(companiesMap)) {
    const compObj = companiesMap[compName];
    const testId = companyRoundMockIds[compName] || null;

    if (compName === 'Amazon') {
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 1,
          roundName: 'Online Assessment',
          description: 'First-stage cognitive, aptitude, and programming assessment.',
          difficulty: 'HARD',
          duration: 90,
          passingScore: 70.0,
          topics: ['Arrays', 'Strings', 'Hash Maps', 'Sliding Window', 'OOP Basics'],
          prepTips: `Practice sliding window algorithms, SQL joins, and study standard speed-distance problems.`,
          testId: testId
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 2,
          roundName: 'Technical Interview I',
          description: 'Algorithmic debugging, core data structures, and complexity optimization.',
          difficulty: 'MEDIUM',
          duration: 60,
          passingScore: 70.0,
          topics: ['Arrays', 'Linked Lists', 'Hash Maps', 'Complexity Analysis', 'OOP'],
          prepTips: `Practice standard coding questions like Two Sum, Merge Intervals, and OOP class structures.`
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 3,
          roundName: 'Technical Interview II',
          description: 'Advanced data structures, graphs traversals, and dynamic programming.',
          difficulty: 'HARD',
          duration: 60,
          passingScore: 70.0,
          topics: ['Graphs', 'Trees', 'DP', 'Greedy', 'Backtracking'],
          prepTips: `Master recursion, tree traversals (BFS/DFS), and dynamic programming paradigms.`
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 4,
          roundName: 'System Design',
          description: 'Low-level and high-level software architecture design.',
          difficulty: 'HARD',
          duration: 60,
          passingScore: 65.0,
          topics: ['System Design', 'OOP'],
          prepTips: `Prepare standard design architectures: URL Shortener, Notification System, and Parking Lot.`
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 5,
          roundName: 'HR & Leadership',
          description: 'Compatibility checks and Amazon Leadership Principles evaluation.',
          difficulty: 'MEDIUM',
          duration: 45,
          passingScore: 80.0,
          topics: ['Behavioral', 'Leadership Principles'],
          prepTips: `Align your past project experiences with Leadership Principles (Customer Obsession, Ownership, Bias for Action).`
        }
      });
    } else if (compName === 'Google') {
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 1,
          roundName: 'Online Assessment',
          description: 'Screening round on algorithmic efficiency and data structures.',
          difficulty: 'HARD',
          duration: 90,
          passingScore: 75.0,
          topics: ['Trees', 'Recursion', 'Bitmasking'],
          prepTips: `Revise recursion limits, tree representation in arrays, and standard bit masking hacks.`,
          testId: testId
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 2,
          roundName: 'Coding Interview I',
          description: 'Algorithmic efficiency, complexity limits, and graphs.',
          difficulty: 'HARD',
          duration: 45,
          passingScore: 70.0,
          topics: ['DSA', 'Trees', 'Graphs'],
          prepTips: `Google interviews emphasize space and time optimization. Revise graph traversals.`
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 3,
          roundName: 'Coding Interview II',
          description: 'Advanced data structures and dynamic programming.',
          difficulty: 'HARD',
          duration: 45,
          passingScore: 70.0,
          topics: ['Advanced DSA', 'DP', 'Graphs'],
          prepTips: `Revise multi-dimensional DP, grid traversals, and topological sorting.`
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 4,
          roundName: 'System Design',
          description: 'Scalable cloud infrastructure and low-level design patterns.',
          difficulty: 'HARD',
          duration: 60,
          passingScore: 70.0,
          topics: ['System Design', 'LLD'],
          prepTips: `Understand load balancing, horizontal scalability, caching strategies, and REST protocol.`
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 5,
          roundName: 'Googliness & Leadership',
          description: 'Behavioral screening, cultural check, and fit assessment.',
          difficulty: 'MEDIUM',
          duration: 45,
          passingScore: 80.0,
          topics: ['Behavioral', 'Googliness'],
          prepTips: `Emphasize collaborative spirit, handling ambiguity, and proactive learning.`
        }
      });
    } else if (compName === 'Microsoft') {
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 1,
          roundName: 'Online Assessment',
          description: 'Codility-based coding test covering fundamental data structures.',
          difficulty: 'HARD',
          duration: 90,
          passingScore: 70.0,
          topics: ['Arrays', 'Strings', 'Hash Maps', 'Bit Manipulation'],
          prepTips: `Practice Codility pattern tests. Codility tests run edge-cases rigorously.`,
          testId: testId
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 2,
          roundName: 'Technical Interview I',
          description: 'Basic DSA, linked lists, stack traversals, and arrays.',
          difficulty: 'MEDIUM',
          duration: 60,
          passingScore: 70.0,
          topics: ['Arrays', 'Linked Lists', 'Trees', 'Stacks'],
          prepTips: `Understand pointers, linked list reversals, stack operations, and binary search trees.`
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 3,
          roundName: 'Technical Interview II',
          description: 'Advanced algorithms, dynamic programming, and heaps.',
          difficulty: 'HARD',
          duration: 60,
          passingScore: 70.0,
          topics: ['Graphs', 'DP', 'Heap'],
          prepTips: `Practice standard DP questions (LCS, LIS, Knapsack) and priority queue scheduling.`
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 4,
          roundName: 'LLD & System Design',
          description: 'Object-oriented programming designs and system scalability.',
          difficulty: 'HARD',
          duration: 60,
          passingScore: 65.0,
          topics: ['LLD', 'OOP'],
          prepTips: `Practice design patterns (Singleton, Factory, Observer) and design elevator or parking system.`
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 5,
          roundName: 'HR & Fitment',
          description: 'Resume verification, behavioral check, and conflict resolution.',
          difficulty: 'MEDIUM',
          duration: 45,
          passingScore: 75.0,
          topics: ['Behavioral', 'Resume', 'Projects'],
          prepTips: `Be prepared to discuss your major projects, technical challenges faced, and team management.`
        }
      });
    } else if (compName === 'IBM') {
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 1,
          roundName: 'Online Assessment',
          description: 'Coding test on fundamental data structures and algorithmic puzzles.',
          difficulty: 'MEDIUM',
          duration: 60,
          passingScore: 65.0,
          topics: ['DSA', 'Arrays', 'Strings'],
          prepTips: `Focus on string parsing, basic loops, sorting, and array manipulation.`,
          testId: testId
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 2,
          roundName: 'Technical Interview',
          description: 'Evaluation of computer engineering core fundamentals and coding.',
          difficulty: 'MEDIUM',
          duration: 45,
          passingScore: 65.0,
          topics: ['OOP', 'DBMS', 'OS', 'CN'],
          prepTips: `Revise virtual functions in OOP, normalization, SQL joins, deadlock, and OSI model layers.`
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 3,
          roundName: 'HR / Managerial Interview',
          description: 'Resume review, career goals, behavioral questions.',
          difficulty: 'EASY',
          duration: 30,
          passingScore: 70.0,
          topics: ['Resume', 'Projects', 'Behavioral'],
          prepTips: `Know every line of your resume. Practice general behavioral questions (STAR method).`
        }
      });
    } else {
      // TCS, Infosys, Accenture, Capgemini, Cognizant, Deloitte
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 1,
          roundName: 'Online Assessment',
          description: 'Aptitude, quantitative, reasoning, and basic coding evaluation.',
          difficulty: 'MEDIUM',
          duration: 90,
          passingScore: 60.0,
          topics: ['Aptitude', 'Reasoning', 'Verbal', 'Technical'],
          prepTips: `Practice percentage, blood relations, vocabulary, and basic loop-based dry running.`,
          testId: testId
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 2,
          roundName: 'Technical Interview',
          description: 'Core programming basics, database normalizations, SQL questions.',
          difficulty: 'MEDIUM',
          duration: 45,
          passingScore: 60.0,
          topics: ['OOP', 'DBMS', 'SQL', 'DSA'],
          prepTips: `Prepare OOP concepts (Polymorphism, Encapsulation) and write basic SQL queries.`
        }
      });
      await prisma.companyRound.create({
        data: {
          companyId: compObj.id,
          roundNumber: 3,
          roundName: 'HR Interview',
          description: 'Behavioral, background check, and general compatibility round.',
          difficulty: 'EASY',
          duration: 30,
          passingScore: 70.0,
          topics: ['Behavioral', 'Communication'],
          prepTips: `Be positive, demonstrate excellent communication, and show interest in the company's domain.`
        }
      });
    }
  }

  // Seed ~350 Previous Year Questions (35 per company) - PARAMETERIZED PER COMPANY AND CONCEPT
  console.log('Generating 350+ unique Previous Year Questions (35 per company)...');
  const years = [2023, 2024, 2025, 2026];
  const difficultiesList = ['EASY', 'MEDIUM', 'HARD'];

  const pyqTopics = [
    { cat: 'Aptitude', sub: 'Profit and Loss', q: 'A seller sells an item at a markup. If sold for more, profit increases.', a: 'Rs. 480', e: 'Difference in percentages resolves to Cost Price.' },
    { cat: 'Aptitude', sub: 'Percentage', q: 'Failure rates in English vs Mathematics in recruitment tests.', a: '40%', e: 'Apply set theory: Total Passed = 100% - (FailA + FailB - FailBoth).' },
    { cat: 'Aptitude', sub: 'Probability', q: 'Drawing colored cards from candidate folders.', a: '5/12', e: 'Probability = Favorable folder counts / Total candidate count.' },
    { cat: 'Aptitude', sub: 'Time and Work', q: 'Software developers scheduling project components.', a: '30 hours', e: 'Combined execution speed = 1 / (Rate1 + Rate2).' },
    { cat: 'Reasoning', sub: 'Blood Relations', q: 'Family relation query during verification.', a: 'Cousin', e: 'Relative mapping identifies cousin relationship.' },
    { cat: 'Reasoning', sub: 'Coding-Decoding', q: 'Encrypting files codes.', a: 'HBNF', e: 'Varies by alphanumeric character shifts.' },
    { cat: 'Reasoning', sub: 'Seating Arrangement', q: 'Row alignment puzzles.', a: 'B sits adjacent to C', e: 'Determine ordering boundaries systematically.' },
    { cat: 'Verbal', sub: 'Grammar', q: 'Noun verb agreement in candidate proposals.', a: 'singular form has', e: 'Indefinite singular pronouns require singular verbs.' },
    { cat: 'Verbal', sub: 'Sentence Correction', q: 'Duration prepositions checks.', a: 'use for instead of since', e: 'Durations require "for"; points of origin require "since".' },
    { cat: 'Technical', sub: 'DBMS', q: 'Foreign key referential integrity.', a: 'Referential integrity link', e: 'Ensures linked row mappings remain valid across relations.' },
    { cat: 'Technical', sub: 'OS', q: 'Virtual memory paging swaps.', a: 'RAM extension on disk', e: 'Exchanges inactive memory pages to disk storage.' },
    { cat: 'Technical', sub: 'CN', q: 'Transport layer packets control.', a: 'Process-to-process delivery', e: 'Ensures reliability and socket connections control.' },
    { cat: 'Technical', sub: 'OOP', q: 'Encapsulating classes methods.', a: 'Binding data and methods', e: 'Restricts external tampering of class variables.' },
    { cat: 'Technical', sub: 'SQL', q: 'Second highest salary records.', a: 'Subquery maximum evaluation', e: 'Filters records strictly lower than absolute max.' },
    { cat: 'DSA', sub: 'Arrays', q: 'Finding missing index values.', a: 'Sum subtraction', e: 'Sum of 1..N minus array elements sum.' },
    { cat: 'DSA', sub: 'Linked Lists', q: 'Singly linked list middle lookup.', a: 'Slow and fast pointer collision', e: 'Fast pointer reaches end when slow reaches middle.' },
    { cat: 'DSA', sub: 'Strings', q: 'String palindrome check.', a: 'Two-pointer check from ends', e: 'Checks symmetrical character offsets.' },
    { cat: 'DSA', sub: 'DP', q: 'Memoization caching behaviors.', a: 'Top-down caching method', e: 'Saves computed recursive results in a grid map.' },
    { cat: 'DSA', sub: 'Graphs', q: 'Graph traversals comparisons.', a: 'Queue level-by-level traversal', e: 'BFS explores neighbors level-by-level using queues.' }
  ];

  for (const compName of Object.keys(companiesMap)) {
    const compObj = companiesMap[compName];
    for (let i = 0; i < 35; i++) {
      const topicInfo = pyqTopics[i % pyqTopics.length];
      let roundName = 'Online Assessment';
      if (i % 5 === 1) roundName = 'Technical Round 1';
      else if (i % 5 === 2) roundName = 'Technical Round 2';
      else if (i % 5 === 3) roundName = 'System Design / LLD';
      else if (i % 5 === 4) roundName = 'HR Interview';

      const year = years[i % years.length];
      const diff = difficultiesList[i % difficultiesList.length] as any;
      const role = compName === 'Google' || compName === 'Microsoft' || compName === 'Amazon' ? 'SDE-1' : 'Graduate Engineer Trainee';

      let qText = '';
      let qAns = '';
      let qExpl = '';

      if (topicInfo.cat === 'Aptitude') {
        const val1 = 5 + (compName.length * 3 + i * 7) % 25;
        const val2 = 10 + (compName.length * 5 + i * 11) % 40;
        
        if (topicInfo.sub === 'Profit and Loss') {
          const sp = val2 * 10;
          const cp = Math.round((sp * 100) / (100 + val1));
          qText = `A candidate bought a promotional voucher for ${compName} training at Rs. ${sp} containing a ${val1}% premium markup. What was the base cost of the voucher? (ID: ${compName.slice(0, 2)}-${i})`;
          qAns = `Rs. ${cp}`;
          qExpl = `Base Cost = (Total Price * 100) / (100 + Markup%) = (${sp} * 100) / (100 + ${val1}) = Rs. ${cp}.`;
        } else if (topicInfo.sub === 'Percentage') {
          const total = 100 + (compName.length * 12 + i * 9) % 300;
          const marks = Math.round((total * val1) / 100);
          qText = `In a ${compName} cognitive screening exam, a student scored ${marks} marks out of a total of ${total}. What percentage did the student achieve? (ID: ${compName.slice(0, 2)}-${i})`;
          qAns = `${val1}%`;
          qExpl = `Percentage = (Marks / Total) * 100 = (${marks} / ${total}) * 100 = ${val1}%.`;
        } else {
          const distance = val2 * 8;
          const speed = val1 + 20;
          const time = (distance / speed).toFixed(2);
          qText = `A transit vehicle at the ${compName} campus covers a distance of ${distance} km at an average speed of ${speed} km/h. How long does the trip take? (ID: ${compName.slice(0, 2)}-${i})`;
          qAns = `${time} hours`;
          qExpl = `Time = Distance / Speed = ${distance} / ${speed} = ${time} hours.`;
        }
      } else if (topicInfo.cat === 'Technical') {
        qText = `Explain the systems configuration for ${compName} operations under: ${topicInfo.q} (Ref: ${compName.slice(0, 2)}-Tech-${i})`;
        qAns = topicInfo.a;
        qExpl = `Under ${compName} infrastructure setups: ${topicInfo.e}`;
      } else if (topicInfo.cat === 'DSA') {
        const arraySize = 5 + (compName.length + i) % 8;
        const arrVals = Array.from({ length: arraySize }, (_, idx) => 1 + (idx * 3 + compName.length) % 15);
        qText = `Given the array input [${arrVals.join(', ')}] in a ${compName} coding interview, resolve for: ${topicInfo.q} (Ref: ${compName.slice(0, 2)}-DSA-${i})`;
        qAns = topicInfo.a;
        qExpl = `Running the algorithm on [${arrVals.join(', ')}] returns the correct result: ${topicInfo.e}`;
      } else {
        qText = `Identify the best approach in a ${compName} behavioral round for: ${topicInfo.q} (Ref: ${compName.slice(0, 2)}-HR-${i})`;
        qAns = topicInfo.a;
        qExpl = `Following ${compName} values and principles: ${topicInfo.e}`;
      }

      await prisma.previousYearQuestion.create({
        data: {
          companyId: compObj.id,
          year,
          role,
          round: roundName,
          question: qText,
          answer: qAns,
          explanation: qExpl,
          difficulty: diff,
          topic: topicInfo.sub
        }
      });
    }
  }
  console.log('Successfully seeded Previous Year Questions.');

  // Seed Interview Experiences
  console.log('Seeding 3 Interview Experiences per company...');
  for (const compName of Object.keys(companiesMap)) {
    const compObj = companiesMap[compName];
    
    await prisma.interviewExperience.create({
      data: {
        userId: student.id,
        companyId: compObj.id,
        role: compName === 'Google' || compName === 'Microsoft' || compName === 'Amazon' ? 'Software Engineer' : 'System Engineer',
        questionsAsked: `1. Coding: Implement Kadane\'s algorithm for maximum subarray sum.\n2. SQL: Write a query to perform a self-join to find employees earning more than their managers.`,
        experience: `Very positive experience. The interviewers focused on core computer engineering subjects and algorithmic logic.`,
        difficulty: compName === 'Google' || compName === 'Amazon' ? 'HARD' : 'MEDIUM',
        selected: true,
        status: 'APPROVED',
        packageText: compName === 'Google' || compName === 'Amazon' ? '25 LPA' : '7.5 LPA',
        year: 2026,
        roundsText: 'Coding, Technical, HR',
        prepTips: `Solve previous year questions on PlacementHub and review SQL join types.`,
        isAnonymous: false,
        upvoteCount: 15
      }
    });

    await prisma.interviewExperience.create({
      data: {
        userId: student.id,
        companyId: compObj.id,
        role: compName === 'Google' || compName === 'Microsoft' || compName === 'Amazon' ? 'Software Engineer Intern' : 'Graduate Trainee',
        questionsAsked: `1. Coding: Implement an LRU Cache.\n2. DBMS: Explain the difference between B-Trees and Hash indexes.`,
        experience: `Extremely tough technical rounds. The interviewer was looking for optimal memory optimizations in my solutions.`,
        difficulty: 'HARD',
        selected: false,
        status: 'APPROVED',
        packageText: null,
        year: 2025,
        roundsText: 'OA, Coding, Tech 2',
        prepTips: `Master pointer manipulations and memory complexity.`,
        isAnonymous: true,
        upvoteCount: 8
      }
    });

    await prisma.interviewExperience.create({
      data: {
        userId: student.id,
        companyId: compObj.id,
        role: 'SDE Intern',
        questionsAsked: `1. Behavioral: Describe a time you went above and beyond for a customer.\n2. OOP: Explain dynamic binding vs static binding in C++.`,
        experience: `Great discussion. The final round checked my alignment with the leadership values of the company.`,
        difficulty: 'MEDIUM',
        selected: true,
        status: 'APPROVED',
        packageText: compName === 'Microsoft' ? '18 LPA' : '6.0 LPA',
        year: 2026,
        roundsText: 'Aptitude, Technical, HR',
        prepTips: `Prepare leadership principles thoroughly. Be structured in your answers.`,
        isAnonymous: false,
        upvoteCount: 20
      }
    });
  }

  // Create learning notes for weak area recommendations
  console.log('Seeding Learning Notes...');
  const notesData = [
    { title: 'DBMS Normalization Rules', category: 'DBMS', content: 'Detailed normalization forms: 1NF, 2NF, 3NF and BCNF.', subcat: 'DBMS' },
    { title: 'Operating Systems Deadlocks', category: 'OS', content: 'Detailed analysis of Coffman conditions and banker algorithm.', subcat: 'OS' },
    { title: 'TCP Sliding Window Protocol', category: 'CN', content: 'Explanation of sliding window protocols, flow control, and packet structure.', subcat: 'CN' },
    { title: 'Object Oriented Principles', category: 'OOP', content: 'Abstract classes, runtime polymorphism, and inheritance.', subcat: 'OOP' },
    { title: 'SQL Joins Explained', category: 'SQL', content: 'Left, Right, Inner, and Full Outer Joins in SQL databases.', subcat: 'SQL' },
    { title: 'Kadane\'s Algorithm Guide', category: 'DSA', content: 'How to calculate maximum contiguous subarray sums in O(N).', subcat: 'Arrays' }
  ];

  for (const n of notesData) {
    const subcat = subcatsMap[n.subcat] || null;
    await prisma.learningNote.create({
      data: {
        title: n.title,
        category: n.category,
        content: n.content,
        isPublished: true,
        createdByUserId: admin.id,
        subCategoryId: subcat ? subcat.id : null
      }
    });
  }

  // Seed Attempts and Results
  console.log('Seeding sample attempt and result analytics...');
  const sampleTest = await prisma.test.findFirst({ where: { type: 'MOCK' } });
  if (sampleTest) {
    const attempt = await prisma.attempt.create({
      data: {
        userId: student.id,
        testId: sampleTest.id,
        score: 15,
        maxScore: 20,
        percentage: 75.0,
        correctAnswers: 15,
        incorrectAnswers: 5,
        status: 'SUBMITTED',
        startedAt: new Date(Date.now() - 2000 * 1000),
        submittedAt: new Date(),
      }
    });

    await prisma.result.create({
      data: {
        attemptId: attempt.id,
        rank: 3,
        accuracy: 75.0,
        topicAnalysis: { 'DBMS': 80.0, 'Arrays': 40.0, 'Grammar': 100.0 },
        recommendations: [
          {
            topic: 'Arrays',
            score: 40.0,
            recommendedTests: [
              { id: companyRoundMockIds['Amazon'] || '', title: 'Amazon Official Online Mock Assessment' }
            ],
            recommendedNotes: [
              { id: 'some-note-id', title: 'Kadane\'s Algorithm Guide' }
            ],
            prioritizedPath: [
              '1. Read Kadane\'s Algorithm Guide notes',
              '2. Try the Amazon Online Mock Assessment to practice Array sliding windows'
            ]
          }
        ]
      }
    });

    await prisma.test.update({
      where: { id: sampleTest.id },
      data: {
        attemptCount: 1,
        averageScore: 75.0
      }
    });
  }

  console.log('Database Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
