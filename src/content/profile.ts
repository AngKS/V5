export const profile = {
  name: "Kah Shin",
  email: "hellokahshin@gmail.com",
  linkedin: "https://www.linkedin.com/in/kahshinang",
  github: "https://github.com/AngKS",
  resume:
    "https://drive.google.com/file/d/1FGJF03knWlGFdvS7HdlUm8NSfGoe7Ls2/view",
};
export type Experience = {
  role: string;
  company: string;
  dates: string;
  description: string;
  current: boolean;
};
// Populate with verified LinkedIn export data. Never infer employment dates.
export const experience: Experience[] = [];
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
