export const profile = {
  name: "Kah Shin",
  email: "hellokahshin@gmail.com",
  linkedin: "https://www.linkedin.com/in/kahshinang",
  github: "https://github.com/AngKS",
  resume: "/files/resume.pdf",
};
export type Experience = {
  role: string;
  company: string;
  dates: string;
  description: string;
  current: boolean;
};
// Manually reviewed public LinkedIn profile; not an automatic sync.
export const linkedinSnapshot = {
  source: profile.linkedin,
  checkedAt: "2026-11-03",
  note: "Self-reported LinkedIn information, manually reviewed on 3 November 2026. Present/current refers to that snapshot; updates are not automatically synced.",
};
export const experience: Experience[] = [
  { role: "Solutions Architect", company: "GroundCrew.io", dates: "Oct 2026 – Present", description: "Freelance · Singapore · Remote", current: true },
  { role: "Seasonal Specialist", company: "Apple", dates: "Aug 2026 – Present", description: "Part-time · Helping more dreamers become doers.", current: true },
  { role: "Seasonal Specialist", company: "Apple", dates: "Aug 2025 – Mar 2026", description: "Part-time · Helping dreamers become doers.", current: false },
  { role: "Technical Lead", company: "Singapore Army", dates: "Aug 2024 – Jul 2025", description: "Led a supply-unit technology team building cloud solutions and digitising administrative workflows. Oversaw product delivery and migration to AWS serverless infrastructure.", current: false },
  { role: "Full-stack Developer", company: "Singapore Army", dates: "Dec 2023 – Aug 2024", description: "Cloud development, with AWS CloudFormation and AWS Identity and Access Management listed among the role’s skills.", current: false },
  { role: "Enlistee", company: "Singapore Army", dates: "Sep 2023 – Dec 2023", description: "Full-time · Singapore", current: false },
  { role: "Full Stack Engineer", company: "FWD Insurance", dates: "Jul 2023 – Sep 2023", description: "Full-time · Singapore · Remote", current: false },
  { role: "AI Research and Development", company: "FWD Insurance", dates: "Jan 2023 – Feb 2023", description: "Internship researching e-KYC using computer vision and natural language processing, and developing an internal test and validation environment for a voice-call agent pipeline.", current: false },
  { role: "Software Engineer Intern", company: "FWD Insurance", dates: "Mar 2022 – Feb 2023", description: "Supported Southeast Asian markets with AI/ML adoption and commerce-platform development.", current: false },
];
export const education = [
  {
    institution: "Singapore University of Technology and Design (SUTD)",
    qualification: "Bachelor of Engineering, Computer Science and Design",
    dates: "Jan 2025 – May 2029",
    status: "in_progress",
    expectedCompletion: "2029-05",
    activities: ["President, SUTD AI Interest Group"],
    description: "Spring Early Matriculation 2025. May 2029 is the listed future completion date, not an awarded qualification.",
  },
  {
    institution: "Singapore Polytechnic",
    qualification: "Diploma, Applied AI & Analytics",
    dates: "Apr 2020 – Apr 2023",
    status: "past",
    activities: ["President, SP Aikido Club (Apr 2021 – Apr 2022)", "Cadet Lieutenant (NCC), National Cadet Corps Singapore (Oct 2021)"],
    description: "Entered through the Early Admissions Exercise in Information Technology, then specialised in Data Science and Analytics. Participated in the Polytechnic Technology Programme with FWD Group Innovations for an internship and final-year project.",
  },
] as const;
export const featuredProjects = [
  {
    repo: "Parkinsons_Disease_Experiment",
    title: "Looking beyond the prediction.",
    category: "COMPUTER VISION / EXPLAINABLE AI",
    art: "vision",
    description:
      "Exploring Parkinson’s detection from hand-drawn spirals and meanders, with visual explanations of model predictions.",
  },
  {
    repo: "melonspeak",
    title: "Give the web a voice.",
    category: "ON-DEVICE AI / BROWSER TOOLS",
    art: "sound",
    description:
      "Read web pages aloud with neural text-to-speech running entirely on your device.",
  },
  {
    repo: "Youtube-Utility-Microservice",
    title: "Less scrubbing. More understanding.",
    category: "INFRASTRUCTURE / DEVELOPER TOOLS",
    art: "system",
    description:
      "A utility microservice for YouTube transcription and summarisation.",
  },
] as const;
