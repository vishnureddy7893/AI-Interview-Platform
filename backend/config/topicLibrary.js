/**
 * Topic library for interview round configuration.
 * Categories and topics only — not interview questions.
 * AI generates questions later from these topics.
 */
const TOPIC_LIBRARY = [
  {
    category: "Java",
    topics: [
      "Collections",
      "JVM",
      "Streams",
      "Multithreading",
      "OOPs",
      "Exception Handling",
      "Generics",
    ],
  },
  {
    category: "React",
    topics: [
      "Hooks",
      "Context API",
      "Routing",
      "State Management",
      "Performance",
      "Forms",
      "Component Lifecycle",
    ],
  },
  {
    category: "Spring Boot",
    topics: [
      "REST",
      "Security",
      "JPA",
      "Dependency Injection",
      "Actuator",
      "Validation",
    ],
  },
  {
    category: "Node.js",
    topics: [
      "Express",
      "Async Patterns",
      "Streams",
      "Authentication",
      "Middleware",
      "Error Handling",
    ],
  },
  {
    category: "Databases",
    topics: [
      "SQL",
      "MongoDB",
      "Indexing",
      "Transactions",
      "Normalization",
      "Query Optimization",
    ],
  },
  {
    category: "System Design",
    topics: [
      "Scalability",
      "Caching",
      "Load Balancing",
      "Database Design",
      "Microservices",
      "API Design",
    ],
  },
  {
    category: "Aptitude",
    topics: [
      "Percentages",
      "Probability",
      "Time & Work",
      "Logical",
      "Verbal",
      "Number Series",
      "Data Interpretation",
    ],
  },
  {
    category: "DSA",
    topics: [
      "Arrays",
      "Strings",
      "Linked Lists",
      "Trees",
      "Graphs",
      "Dynamic Programming",
      "Sorting & Searching",
    ],
  },
];

const CODING_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "Go",
];

const ROUND_TYPES = [
  "Aptitude",
  "Technical",
  "Coding",
  "HR",
  "Project Discussion",
  "System Design",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];

module.exports = {
  TOPIC_LIBRARY,
  CODING_LANGUAGES,
  ROUND_TYPES,
  DIFFICULTIES,
};
