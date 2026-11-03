import Image from "next/image";
import { Header } from "@/components/header";
import { ComicArt } from "@/components/art";
import { Panel } from "@/components/motion";
import { profile, experience } from "@/content/profile";
import { getProjects, getWriting } from "@/lib/content";
export const revalidate = 3600;
export default async function Home() {
  const [projects, writing] = await Promise.all([getProjects(), getWriting()]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="home" />
      <Header />
      <main id="main">
        <section className="intro-hero wrap" aria-labelledby="hero-title">
          <div className="intro-edition eyebrow">
            <span>AI / ML & INFRASTRUCTURE</span>
            <span>THE PERSONAL PORTFOLIO — VOL. 05</span>
          </div>
          <div className="intro-grid">
            <figure className="portrait-panel">
              <div className="portrait-stage">
                <span className="portrait-star" aria-hidden="true">
                  ✳
                </span>
                <Image
                  className="intro-portrait"
                  src="/face.png"
                  alt="Illustrated portrait of Kah Shin wearing glasses and a hoodie"
                  width={1460}
                  height={1099}
                  sizes="(max-width: 700px) 115vw, (max-width: 1200px) 60vw, 700px"
                  preload
                />
              </div>
              <figcaption>
                <span>FIG. 01 — THE HUMAN BEHIND THE CODE</span>
                <span aria-hidden="true">↗</span>
              </figcaption>
            </figure>
            <div className="intro-copy">
              <p className="intro-greeting">Hey, I’m</p>
              <h1 id="hero-title">
                KAH SHIN<span>.</span>
              </h1>
              <p className="intro-statement">
                Curious about intelligence.
                <br />
                Serious about building things.
              </p>
              <p className="intro-description">
                I explore computer vision, explainable AI, and the
                infrastructure that brings ideas to life.
              </p>
              <div className="intro-actions">
                <a className="intro-primary" href="#portfolio">
                  EXPLORE MY WORK <span aria-hidden="true">↗</span>
                </a>
                <a className="intro-secondary" href="#about">
                  A LITTLE ABOUT ME <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>
        </section>
        <div className="ticker" aria-label="Areas of interest">
          <span>COMPUTER VISION</span>
          <b>✳</b>
          <span>EXPLAINABLE AI</span>
          <b>✳</b>
          <span>INFRASTRUCTURE</span>
          <b>✳</b>
          <span>ENDLESS CURIOSITY</span>
        </div>
        <section id="about" className="about wrap section">
          <div className="section-label">01 / THE PERSON BEHIND THE PIXELS</div>
          <div className="about-grid">
            <h2>
              A LITTLE
              <br />
              CONTEXT<span className="accent">.</span>
            </h2>
            <div>
              <p className="editorial">
                Part AI enthusiast.
                <br />
                Part infrastructure nerd.
                <br />
                <em>Always asking why.</em>
              </p>
              <p className="body-copy">
                My background in AI has led me deep into computer vision and
                explainable AI. I’m interested in what a model sees, how it
                arrives at a prediction, and how we can make that behaviour
                easier to understand.
              </p>
              <p className="body-copy">
                Alongside that is a longstanding passion for infrastructure
                engineering: the systems, services, and thoughtful details that
                help an idea work in the real world.
              </p>
              <a
                className="text-link"
                href={profile.resume}
                target="_blank"
                rel="noreferrer"
              >
                THE FULL STORY / RESUME ↗
              </a>
            </div>
          </div>
          <div className="experience">
            <div>
              <span className="eyebrow">THE STORY SO FAR</span>
              <h3>
                EVERY CHAPTER
                <br />
                BUILDS ON THE LAST.
              </h3>
            </div>
            <div className="experience-content">
              {experience.length ? (
                experience.map((item) => (
                  <article
                    className="role"
                    key={`${item.company}-${item.role}`}
                  >
                    <span className="eyebrow">
                      {item.dates}
                      {item.current ? " · CURRENT" : ""}
                    </span>
                    <h4>{item.role}</h4>
                    <p>{item.company}</p>
                    <p>{item.description}</p>
                  </article>
                ))
              ) : (
                <>
                  <p className="editorial small">
                    For the chapters on where
                    <br />
                    I’ve worked, meet me on LinkedIn.
                  </p>
                  <a
                    className="button"
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    EXPLORE MY EXPERIENCE ↗
                  </a>
                </>
              )}
            </div>
          </div>
        </section>
        <section id="portfolio" className="portfolio section">
          <div className="wrap">
            <div className="section-label">02 / IDEAS, MEET REALITY</div>
            <div className="section-heading">
              <h2>
                WORK IN
                <br />
                <span className="outline">PROGRESS.</span>
              </h2>
              <p>
                Experiments that became projects.
                <br />
                Questions that became code.
                <br />A few things from my GitHub.
              </p>
            </div>
            <div className="project-grid">
              {projects.map((project, index) => (
                <Panel className="project" key={project.repo}>
                  <a
                    className="project-art"
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${project.repo} on GitHub`}
                  >
                    <span className="project-number">0{index + 1}</span>
                    <ComicArt kind={project.art} />
                    <span className="project-arrow">↗</span>
                  </a>
                  <div className="project-body">
                    <span className="eyebrow">{project.category}</span>
                    <h3>
                      <a href={project.url} target="_blank" rel="noreferrer">
                        {project.title}
                      </a>
                    </h3>
                    <p>{project.description}</p>
                    <div className="project-footer">
                      <span>{project.language || "OPEN SOURCE"}</span>
                      <a href={project.url} target="_blank" rel="noreferrer">
                        VIEW REPOSITORY ↗
                      </a>
                    </div>
                  </div>
                </Panel>
              ))}
            </div>
            <a
              className="text-link"
              href={profile.github}
              target="_blank"
              rel="noreferrer"
            >
              MORE EXPERIMENTS ON GITHUB ↗
            </a>
          </div>
        </section>
        <section id="writing" className="writing wrap section">
          <div className="section-label">03 / NOTES FROM THE MARGINS</div>
          <div className="writing-grid">
            <h2>
              THINKING
              <br />
              OUT LOUD<span className="accent">.</span>
            </h2>
            <div>
              {writing.articles.length ? (
                writing.articles.map((article) => (
                  <article className="article" key={article.url}>
                    <span className="eyebrow">{article.date} / MEDIUM</span>
                    <h3>
                      <a href={article.url} target="_blank" rel="noreferrer">
                        {article.title} ↗
                      </a>
                    </h3>
                  </article>
                ))
              ) : (
                <div className="coming-soon">
                  <span className="eyebrow">
                    {writing.url
                      ? "CONTINUE ON MEDIUM"
                      : "A NEW CHAPTER IS BREWING"}
                  </span>
                  <p className="editorial">
                    A place for the questions,
                    <br />
                    the experiments, and the
                    <br />
                    <em>“oh, that’s interesting”s.</em>
                  </p>
                  <p>
                    {writing.url
                      ? "Read my latest stories on Medium."
                      : "My writing corner is coming soon. Good things take a little tinkering."}
                  </p>
                  {writing.url && (
                    <a
                      className="text-link"
                      href={writing.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      READ ON MEDIUM ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        <section id="contact" className="contact section">
          <div className="wrap">
            <div className="section-label">04 / THE NEXT CHAPTER?</div>
            <h2>
              LET’S MAKE
              <br />
              SOMETHING <em>CLICK.</em>
            </h2>
            <div className="contact-bottom">
              <p>
                Have an interesting problem?
                <br />
                An idea? A really good question?
                <br />
                My inbox is open.
              </p>
              <a className="contact-link" href={`mailto:${profile.email}`}>
                SAY HELLO <span>↗</span>
              </a>
            </div>
            <footer>
              <a className="wordmark" href="#home">
                ANGKS<span>✳</span>
              </a>
              <nav aria-label="Social and resume links">
                <a href={`mailto:${profile.email}`}>Email ↗</a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn ↗
                </a>
                <a href={profile.github} target="_blank" rel="noreferrer">
                  GitHub ↗
                </a>
                <a href={profile.resume} target="_blank" rel="noreferrer">
                  Resume ↗
                </a>
              </nav>
              <span className="eyebrow">MADE OF CURIOSITY & CODE.</span>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
