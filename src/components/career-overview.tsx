import { experience, profile } from "@/content/profile";
import { Icon } from "./icon";
import "./career-overview.css";

const chapters = [
  {
    company: "GroundCrew.io",
    focus: "Solutions architecture",
    period: "2026 — now",
  },
  {
    company: "Apple",
    focus: "Helping people do more with technology",
    period: "2025 — now",
  },
  {
    company: "Singapore Army",
    focus: "From cloud development to technical leadership",
    period: "2023 — 2025",
  },
  {
    company: "FWD Insurance",
    focus: "AI research & full-stack engineering",
    period: "2022 — 2023",
  },
];

export function CareerOverview() {
  return (
    <div className="career-overview">
      <div className="career-heading">
        <h3>
          A few chapters<span className="glitch-dot">.</span>
        </h3>
        <p>Building systems. Working with people.</p>
      </div>
      <div className="career-list">
        {chapters.map(({ company, focus, period }) => {
          const roles = experience.filter((role) => role.company === company);
          return (
            <details
              className="career-chapter"
              name="career-chapters"
              key={company}
            >
              <summary>
                <span className="career-company">{company}</span>
                <span className="career-focus">{focus}</span>
                <span className="career-period">{period}</span>
                <span className="career-expand" aria-hidden="true">
                  <span />
                  <span />
                </span>
                <span className="sr-only"> — view roles and dates</span>
              </summary>
              <div className="career-roles">
                {roles.map((role) => (
                  <article
                    className="career-role"
                    key={`${role.role}-${role.dates}`}
                  >
                    <p className="career-date">
                      {role.dates}
                      {role.current && (
                        <span className="career-current">Current</span>
                      )}
                    </p>
                    <div>
                      <h4>{role.role}</h4>
                      <p>{role.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          );
        })}
      </div>
      <div className="career-footer">
        <span>Open a chapter for the roles behind it.</span>
        <a href={profile.linkedin} target="_blank" rel="noreferrer">
          Full history on LinkedIn <Icon name="arrow-up-right" />
        </a>
      </div>
    </div>
  );
}
