import { DoubtRecord, AnalyzedNoteRecord, NewsArticle, StudentNotebookNote } from '../types';

export const INITIAL_DOUBTS: DoubtRecord[] = [
  {
    id: 'doubt-1',
    question: 'How do you find the maximum height of a projectile launched at angle θ with initial velocity v₀?',
    subject: 'Physics',
    timestamp: 'Today at 09:15 AM',
    solution: {
      mainContext: 'In two-dimensional kinematic projectile motion, motion along the vertical (y) axis is decoupled from horizontal (x) motion, acting under constant downward gravitational acceleration (g).',
      mainPoints: [
        'Vertical component of initial velocity is v_{0y} = v₀ · sin(θ).',
        'At peak trajectory (maximum height H), the vertical velocity momentarily reaches zero (v_y = 0).',
        'Air resistance is neglected in standard introductory kinematics.'
      ],
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Resolve the Velocity into Vertical Component',
          explanation: 'Identify the vertical vector component responsible for upward movement against gravitational acceleration.',
          mathOrCode: 'v_{0y} = v_0 \\sin(\\theta)'
        },
        {
          stepNumber: 2,
          title: 'Apply the Kinematic Equation for Vertical Velocity',
          explanation: 'Use the kinematic relationship connecting initial velocity, final velocity, acceleration, and vertical displacement: v_y² = v_{0y}² - 2gH.',
          mathOrCode: '0 = (v_0 \\sin\\theta)^2 - 2gH'
        },
        {
          stepNumber: 3,
          title: 'Isolate Maximum Height (H)',
          explanation: 'Rearrange the expression algebraically to solve for H.',
          mathOrCode: 'H = \\frac{v_0^2 \\sin^2(\\theta)}{2g}'
        }
      ],
      finalAnswer: 'Maximum height H = (v₀² · sin²θ) / (2g). Peak altitude occurs precisely when the vertical velocity vector crosses zero.',
      quickSummary: 'To find maximum height, set vertical velocity v_y = 0 in v_y² = v_{0y}² - 2gH and solve for H.'
    }
  },
  {
    id: 'doubt-2',
    question: 'Why does ice float on water when most solids are denser than their liquid phase?',
    subject: 'Chemistry',
    timestamp: 'Yesterday at 4:30 PM',
    solution: {
      mainContext: 'Water exhibits an anomalous density property due to hydrogen bonding dynamics that uniquely reorganize molecules as liquid cools toward freezing.',
      mainPoints: [
        'Liquid water molecules are held by transient hydrogen bonds that constantly break and reform.',
        'Below 4°C, hydrogen bonds stabilize into a rigid hexagonal crystalline lattice.',
        'This open lattice forces water molecules farther apart, increasing volume and reducing density.'
      ],
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Analyze Molecular Hydrogen Bonding',
          explanation: 'In liquid water, kinetic energy allows molecules to pack relatively close together, reaching maximum density at 3.98°C.',
          mathOrCode: 'Liquid density ≈ 1.000 g/cm³ at 4°C'
        },
        {
          stepNumber: 2,
          title: 'Crystal Lattice Formation at 0°C',
          explanation: 'As thermal motion decreases, each oxygen atom coordinates with four neighboring hydrogens in tetrahedral geometry.',
          mathOrCode: 'Hexagonal open cages create extra void space'
        },
        {
          stepNumber: 3,
          title: 'Calculate Density Discrepancy',
          explanation: 'Because mass remains constant while volume increases by ~9%, solid ice is less dense than liquid water.',
          mathOrCode: 'Ice density ≈ 0.917 g/cm³ < Water density ≈ 1.000 g/cm³'
        }
      ],
      finalAnswer: 'Ice floats because solid water forms an open hexagonal crystal lattice via rigid hydrogen bonds, making ice approximately 9% less dense than liquid water.',
      quickSummary: 'Hydrogen bonding creates an open hexagonal lattice in ice with greater empty volume, reducing density below that of liquid water.'
    }
  }
];

export const INITIAL_AI_NOTES: AnalyzedNoteRecord[] = [
  {
    id: 'note-1',
    title: 'Photosynthesis & Cellular Respiration Pathways',
    subject: 'Biology',
    createdAt: 'Sep 2, 2026',
    summary: 'Comprehensive dual-phase breakdown of chloroplast light reactions, Calvin cycle, and mitochondrial ATP synthesis.',
    data: {
      topic: 'Photosynthesis & Cellular Respiration Energy Cycles',
      importantConcepts: [
        { concept: 'Light-Dependent Reactions', description: 'Photolysis of water in thylakoid membranes generating ATP and NADPH via electron transport chains.' },
        { concept: 'Calvin Cycle (Light-Independent)', description: 'Carbon fixation driven by enzyme RuBisCO in the stroma synthesizing G3P sugars.' },
        { concept: 'Cellular Aerobic Respiration', description: 'Catabolic breakdown of glucose via glycolysis, Krebs cycle, and oxidative phosphorylation.' }
      ],
      definitions: [
        { term: 'RuBisCO', definition: 'Ribulose-1,5-bisphosphate carboxylase-oxygenase, the catalytic enzyme responsible for fixing atmospheric CO₂ into organic 3-PGA molecules.' },
        { term: 'Chemiosmosis', definition: 'The movement of hydrogen ions across a semipermeable membrane down an electrochemical gradient to power ATP synthase.' }
      ],
      formulas: [
        { name: 'Photosynthesis Overall Reaction', formula: '6 CO₂ + 6 H₂O + light → C₆H₁₂O₆ + 6 O₂', explanation: 'Converts solar electromagnetic energy into stable biochemical chemical bonds.' },
        { name: 'Aerobic Respiration Overall Reaction', formula: 'C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + ~30-32 ATP', explanation: 'Extracts metabolic chemical energy with oxygen serving as the final terminal electron acceptor.' }
      ],
      keyPoints: [
        'Photosynthesis is an anabolic, endergonic process occurring inside chloroplasts.',
        'Cellular respiration is a catabolic, exergonic pathway housed primarily in mitochondria.',
        'Oxygen released in photosynthesis derives exclusively from the splitting of H₂O, not CO₂.'
      ],
      examples: [
        { problem: 'If a plant is exposed to radioactive ¹⁸O labeled H₂O, where will the labeled oxygen atoms be detected?', solution: 'The labeled ¹⁸O will appear in the released atmospheric O₂ gas, proving water oxidation is the exclusive source of photosynthetic oxygen.' }
      ],
      importantQuestions: [
        {
          question: 'Why do high temperatures cause photorespiration in C3 plants?',
          hint: 'Consider how heat impacts RuBisCO enzyme specificity between CO₂ and O₂.',
          answer: 'At high temperatures, stomata close to conserve water, lowering internal CO₂ while RuBisCO’s affinity for O₂ increases, triggering wasteful photorespiration.'
        }
      ],
      quickRevision: [
        'Chloroplast = Thylakoids (Light reactions) + Stroma (Calvin cycle).',
        'Mitochondria = Matrix (Krebs cycle) + Inner Membrane (Electron transport).',
        'Net theoretical yield: ~30-32 ATP per oxidized glucose molecule.'
      ]
    }
  },
  {
    id: 'note-2',
    title: 'Newtonian Dynamics & Conservation Laws',
    subject: 'Physics',
    createdAt: 'Aug 29, 2026',
    summary: 'Formulas, free-body diagram procedures, impulse-momentum theorem, and mechanical energy conservation.',
    data: {
      topic: 'Classical Mechanics: Forces, Momentum, and Energy',
      importantConcepts: [
        { concept: 'Inertial Reference Frames', description: 'Frames in which Newton’s first law holds true without requiring fictitious centrifugal or Coriolis forces.' },
        { concept: 'Impulse-Momentum Theorem', description: 'The integral of force over time equals the net change in linear momentum: J = ∫ F dt = Δp.' }
      ],
      definitions: [
        { term: 'Conservative Force', definition: 'A force where the work done moving a particle between two points is strictly independent of the trajectory path taken (e.g. gravity, spring force).' },
        { term: 'Coefficient of Restitution (e)', definition: 'The ratio of relative separation speed to relative approach speed after a collision.' }
      ],
      formulas: [
        { name: 'Newton’s 2nd Law (General)', formula: 'F_{net} = \\frac{dp}{dt} = m \\cdot a \\text{ (for constant mass)}', explanation: 'Relates net applied vector force to rate of change of momentum.' },
        { name: 'Conservation of Linear Momentum', formula: '\\sum p_{initial} = \\sum p_{final}', explanation: 'Holds true whenever net external force on the system equals zero.' }
      ],
      keyPoints: [
        'Action and reaction forces act on distinct bodies and never cancel each other out.',
        'Kinetic energy is conserved only in perfectly elastic collisions; momentum is conserved in all isolated collisions.',
        'Always draw isolated Free Body Diagrams (FBDs) before writing equations of motion.'
      ],
      examples: [
        { problem: 'A 2 kg cart moving at 4 m/s strikes and sticks to a stationary 2 kg cart. What is the final velocity?', solution: 'Using inelastic momentum conservation: (2 kg)(4 m/s) + 0 = (2 + 2 kg)·v_f → 8 = 4·v_f → v_f = 2 m/s.' }
      ],
      importantQuestions: [
        {
          question: 'Can an object have zero acceleration while experiencing multiple applied forces?',
          hint: 'Think about vector sum equilibrium.',
          answer: 'Yes, if the vector sum of all external forces is zero (Σ F = 0), the object is in dynamic or static equilibrium with zero acceleration.'
        }
      ],
      quickRevision: [
        'F_net = m·a; W = ∫ F · dr; K = 1/2 m v².',
        'Total Mechanical Energy is conserved when only conservative forces do work.',
        'Momentum is always conserved in closed, isolated systems.'
      ]
    }
  }
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Breakthrough in Room-Temperature Superconducting Thin Films Verified by International Labs',
    category: 'Science & Tech',
    source: 'Nature Physics & Global Science Wire',
    date: 'Sep 2, 2026',
    readTime: '4 min read',
    featured: true,
    badge: 'Trending Discovery',
    summary: 'A consortium of university physics laboratories has independently verified low-pressure superconductivity in synthetic nickelate superlattices, opening massive implications for power grids and quantum processors.',
    content: [
      'In what physicists are describing as one of the most exciting experimental milestones of the decade, researchers across four continents have replicated zero electrical resistance in engineered layered nickelate structures operating near ambient room temperatures.',
      'Unlike previous controversial high-pressure experiments requiring diamond anvil cells exceeding hundreds of gigapascals, this novel thin-film lattice maintains Cooper-pair coherence at mild ambient pressures using epitaxial compressive strain.',
      'For high school and university STEM students, this breakthrough directly validates theoretical predictions in condensed matter physics that were previously only explored computationally. The technology promises near-zero energy transmission loss and ultra-compact particle accelerators.'
    ],
    studentTakeaway: 'Understanding electronic band structures and lattice strain is becoming essential for future materials science and energy engineering careers.',
    quizPrompt: 'What phenomenon causes electrons to pair up without electrical resistance in a superconductor?'
  },
  {
    id: 'news-2',
    title: 'NASA & ESA Confirm Artemis Lunar Base Sub-Surface Water Ice Map Completed',
    category: 'Space',
    source: 'Aerospace Science Journal',
    date: 'Sep 1, 2026',
    readTime: '3 min read',
    summary: 'High-resolution radar imaging from lunar polar orbiters has revealed extensive regolith water-ice reserves in permanently shadowed craters at the Moon’s South Pole, solidifying plans for sustainable habitat life support.',
    content: [
      'The Lunar Reconnaissance team, partnered with international space agencies, has published the most detailed geographic atlas of polar water ice deposits to date. The maps identify crater basins containing accessible water ice within 1.5 meters of surface regolith.',
      'These reserves will provide vital drinking water, oxygen generation through water electrolysis, and liquid hydrogen/oxygen rocket propellant for forward expeditions toward Mars.',
      'Student space clubs and collegiate robotics teams are invited to participate in the upcoming Lunar Excavator and In-Situ Resource Utilization (ISRU) Design Challenge launched alongside the discovery.'
    ],
    studentTakeaway: 'In-situ resource utilization (ISRU) drastically reduces launch payloads, making multi-planetary exploration economically and logistically feasible.',
    quizPrompt: 'Which chemical process will astronauts use to split lunar water into breathable oxygen and rocket fuel?'
  },
  {
    id: 'news-3',
    title: 'Next-Generation Reasoning AI Assists Students with Personalized Socratic Pedagogy',
    category: 'AI & Tech',
    source: 'Educational Technology Review',
    date: 'Aug 31, 2026',
    readTime: '5 min read',
    summary: 'Studies across 50 school districts show that AI tutors that guide through Socratic questioning—rather than handing out direct answers—double student conceptual retention in calculus and physics.',
    content: [
      'A comprehensive 18-month educational study conducted with over 25,000 students has revealed clear data on AI in learning: when AI mentors prompt students to articulate their reasoning step-by-step, exam performance improves by 22% compared to passive reading.',
      'Researchers emphasize that the goal of modern AI in education is cognitive amplification, teaching students how to deconstruct difficult multi-step problems, identify their own cognitive biases, and think like researchers.',
      'The study also highlighted the vital role of human mentors and classroom discussions in synthesizing creative debate and ethical decision-making that complement AI study companions.'
    ],
    studentTakeaway: 'Active recall and Socratic dialogue build permanent neural pathways far faster than passive memorization.',
    quizPrompt: 'How does the Socratic method differ from rote memorization?'
  },
  {
    id: 'news-4',
    title: 'Global Youth Science & Innovation Olympiad 2026 Registration Opens with $2M in Grants',
    category: 'Opportunities',
    source: 'International Youth Science Foundation',
    date: 'Aug 30, 2026',
    readTime: '3 min read',
    summary: 'High school and undergraduate students worldwide can now submit research proposals in clean energy, biotechnology, climate engineering, and computational mathematics for competitive project grants.',
    content: [
      'The International Youth Science Foundation has officially opened portal applications for the 2026 Global Olympiad. Finalists will receive fully funded travel to the Zurich World Summit, lab mentorship from leading researchers, and seed grants.',
      'Categories include Sustainable Agri-Tech, Quantum Algorithms, Molecular Medicine, and Autonomous Robotics. Projects may be individual or team-based with up to 3 members.',
      'Early bird review closes November 15, 2026. Applicants must submit a 5-page research abstract, problem statement, and experimental design prototype.'
    ],
    studentTakeaway: 'Participation in international research olympiads builds invaluable portfolio experience and direct mentorship networks.',
    quizPrompt: 'What key section of a scientific research paper outlines the experimental procedure and variable controls?'
  },
  {
    id: 'news-5',
    title: 'Standardized Exam Boards Adopt Adaptive Multi-Modal Testing for 2027 Syllabus',
    category: 'Exams & Updates',
    source: 'Higher Education Academic Board',
    date: 'Aug 28, 2026',
    readTime: '4 min read',
    summary: 'Major college entrance examinations are shifting toward computerized adaptive assessments that evaluate real-time data analysis, critical problem synthesis, and experimental simulation capabilities.',
    content: [
      'Exam boards have announced the next phase of standardized academic testing. Rather than static multiple-choice formats, upcoming exams will incorporate interactive laboratory simulations, where students manipulate variables on screen to test scientific hypotheses.',
      'Adaptive algorithms will calibrate question difficulty dynamically based on student mastery, eliminating test fatigue and measuring depth of conceptual comprehension.',
      'Educators recommend practicing interactive visualization tools, graph interpretation, and cross-disciplinary reasoning to prepare for the modernized testing format.'
    ],
    studentTakeaway: 'Focus your revision on understanding "why" formulas work and how systems react when initial conditions change, rather than formulaic memorization.',
    quizPrompt: 'What is the key advantage of computer adaptive testing over traditional paper-based exams?'
  },
  {
    id: 'news-6',
    title: 'Deep-Sea Geothermal Vents Reveal Novel Enzymes Capable of Rapid Plastic Degradation',
    category: 'Discoveries',
    source: 'Marine Biology & Bioengineering Quarterly',
    date: 'Aug 26, 2026',
    readTime: '4 min read',
    summary: 'Biologists exploring hydrothermal vents along the Mid-Atlantic Ridge have isolated extremophile bacteria with novel esterase enzymes that break down PET plastics in under 48 hours without high heat.',
    content: [
      'Extremophilic organisms inhabiting volcanic vents survive in high-salinity, mineral-rich environments by producing exceptionally resilient enzymatic catalysts. Genetic sequencing of a newly discovered strain revealed a variant of PETase that hydrolyzes microplastics into bio-safe terephthalic acid.',
      'Bioengineers are now synthesizing these enzymes using harmless yeast cultures, presenting an eco-friendly biological solution for global plastic recycling facilities.',
      'High school biochemistry students are currently modeling this enzyme in computational molecular docking competitions worldwide.'
    ],
    studentTakeaway: 'Natural biodiversity holds untapped biochemical solutions for humanity’s most pressing environmental challenges.',
    quizPrompt: 'What class of biological catalysts accelerate chemical reactions by lowering activation energy?'
  }
];

export const INITIAL_STUDENT_NOTES: StudentNotebookNote[] = [
  {
    id: 'note-math-1',
    title: 'Calculus: Derivatives & Chain Rule Master Notes',
    subject: 'Mathematics',
    folder: 'Calculus',
    createdAt: 'Sep 1, 2026',
    updatedAt: 'Today at 10:45 AM',
    textContent: `# Calculus: Differentiation & The Chain Rule

### Fundamental Definition of Derivative
The derivative represents the instantaneous rate of change of a function with respect to its variable:
f'(x) = lim_{h -> 0} [f(x + h) - f(x)] / h

### The Chain Rule for Composite Functions
When y = f(g(x)):
dy/dx = f'(g(x)) * g'(x)

### Example Walkthrough
Differentiate y = (3x² - 5x + 4)⁵
1. Outer function: u⁵ -> derivative is 5u⁴
2. Inner function: u = 3x² - 5x + 4 -> derivative is 6x - 5
3. Product: dy/dx = 5(3x² - 5x + 4)⁴ * (6x - 5)

### Common Mistakes to Avoid
- Forgetting to multiply by the derivative of the inner function.
- Confusing the Power Rule with Exponential differentiation (d/dx [e^x] = e^x vs d/dx [x^n] = n*x^{n-1}).`,
    visualGraph: {
      title: 'Chain Rule Logic Decomposition',
      type: 'flowchart',
      description: 'Step-by-step structural decomposition of composite differentiation',
      nodes: [
        { id: '1', label: 'Composite y = f(g(x))', category: 'primary', x: 250, y: 80 },
        { id: '2', label: 'Identify Inner g(x)', category: 'concept', x: 140, y: 180 },
        { id: '3', label: 'Identify Outer f(u)', category: 'concept', x: 360, y: 180 },
        { id: '4', label: 'Inner Derivative g\'(x)', category: 'formula', x: 140, y: 280 },
        { id: '5', label: 'Outer Derivative f\'(u)', category: 'formula', x: 360, y: 280 },
        { id: '6', label: 'Multiply: f\'(g(x)) · g\'(x)', category: 'outcome', x: 250, y: 370 }
      ],
      links: [
        { from: '1', to: '2', label: 'extract' },
        { from: '1', to: '3', label: 'extract' },
        { from: '2', to: '4', label: 'differentiate' },
        { from: '3', to: '5', label: 'differentiate' },
        { from: '4', to: '6', label: 'multiply' },
        { from: '5', to: '6', label: 'multiply' }
      ],
      keyTakeaway: 'Always differentiate outer first with inner untouched, then multiply by the inner derivative.'
    }
  },
  {
    id: 'note-chem-1',
    title: 'Organic Chemistry: Reaction Mechanisms & SN1 vs SN2',
    subject: 'Chemistry',
    folder: 'Organic Chem',
    createdAt: 'Aug 29, 2026',
    updatedAt: 'Yesterday at 3:12 PM',
    textContent: `# Organic Chemistry: Nucleophilic Substitution (SN1 vs SN2)

### SN1 Mechanism (Unimolecular)
- Rate = k[Substrate] (Stepwise mechanism)
- Carbocation intermediate formed in slow rate-determining step
- Favored by tertiary (3°) carbons, polar protic solvents (H₂O, EtOH)
- Stereochemistry: Racemization occurs due to planar carbocation geometry

### SN2 Mechanism (Bimolecular)
- Rate = k[Substrate][Nucleophile] (Concerted backside attack)
- One-step transition state with pentacoordinate carbon
- Favored by primary (1°) carbons, polar aprotic solvents (DMSO, Acetone)
- Stereochemistry: Complete Walden inversion (like an umbrella blown inside out)`,
    visualGraph: {
      title: 'SN1 vs SN2 Decision Tree',
      type: 'comparison',
      description: 'Strategic comparison and decision branching for nucleophilic substitution',
      nodes: [
        { id: '1', label: 'Alkyl Halide Substrate', category: 'primary', x: 250, y: 80 },
        { id: '2', label: '1° Primary Substrate', category: 'concept', x: 130, y: 190 },
        { id: '3', label: '3° Tertiary Substrate', category: 'concept', x: 370, y: 190 },
        { id: '4', label: 'SN2: Backside Attack (Inversion)', category: 'outcome', x: 130, y: 320 },
        { id: '5', label: 'SN1: Carbocation (Racemic)', category: 'outcome', x: 370, y: 320 }
      ],
      links: [
        { from: '1', to: '2', label: 'steric accessibility' },
        { from: '1', to: '3', label: 'carbocation stability' },
        { from: '2', to: '4', label: 'favors' },
        { from: '3', to: '5', label: 'favors' }
      ],
      keyTakeaway: 'Primary substrates exclusively undergo SN2 due to low steric hindrance, while tertiary substrates favor SN1 due to stable carbocation formation.'
    }
  }
];

export const initialDoubts = INITIAL_DOUBTS;
export const initialNotes = INITIAL_AI_NOTES;
export const mockNewsArticles = INITIAL_NEWS;
export const initialNotebookNotes = INITIAL_STUDENT_NOTES;
