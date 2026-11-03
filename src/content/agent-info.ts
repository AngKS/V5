import { education, experience, featuredProjects, linkedinSnapshot, profile } from "./profile";
import { site } from "./site";

export const agentResources = {
  profile: {
    name: "Kah Shin Ang",
    shortName: profile.name,
    biography:
      "Kah Shin is an AI/ML enthusiast with a long background in AI, especially computer vision and explainable AI, and a longstanding passion for infrastructure engineering. He is interested in what models see, how they arrive at predictions, and how to make their behaviour easier to understand. He enjoys building systems and services that bring ideas to life.",
    interests: [
      "AI agents",
      "Computer vision",
      "Explainable AI",
      "Infrastructure engineering",
      "Design thinking",
      "Human–AI collaboration",
    ],
    source: `${site.url}/#about`,
  },
  experience: {
    entries: experience,
    status: experience.length ? "available" : "not_supplied",
    ...linkedinSnapshot,
    linkedin: profile.linkedin,
  },
  education: {
    entries: education,
    status: "available",
    ...linkedinSnapshot,
  },
  contact: {
    email: profile.email,
    emailUrl: `mailto:${profile.email}`,
    linkedin: profile.linkedin,
    github: profile.github,
    resume: new URL(profile.resume, site.url).href,
    resumeContents: "not_supplied",
    sourceCode: "https://github.com/AngKS/V5",
    source: `${site.url}/#contact`,
  },
  featuredProjects: featuredProjects.map(
    ({ repo, title, description, category }) => ({
      repo,
      title,
      description,
      category,
      url: `${profile.github}/${repo}`,
    }),
  ),
};
