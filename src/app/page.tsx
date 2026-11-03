import { CareerOverview } from "@/components/career-overview";
import { PortfolioWebMCP } from "@/components/portfolio-webmcp";
import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import { PagePeel } from "@/components/page-peel";
import { InterestsMarquee } from "@/components/interests-marquee";
import { Icon } from "@/components/icon";
import Image from "next/image";
import { Discoveries } from "@/components/discoveries";
import { TerminalHatch } from "@/components/terminal-hatch";
import { Header } from "@/components/header";
import { ProjectsCarousel } from "@/components/projects-carousel";
import { profile } from "@/content/profile";
import { getWriting } from "@/lib/content";
import { getRankedProjects, paginateProjects } from "@/lib/projects";
export const revalidate = 3600;
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [writing, initialProjects] = await Promise.all([
    getWriting(),
    getRankedProjects()
      .then((projects) => paginateProjects(projects, 0, 3))
      .catch((error: unknown) => {
        unstable_rethrow(error);
        console.warn(
          "Initial projects unavailable:",
          error instanceof Error ? error.message : "Unknown error",
        );
        return null;
      }),
  ]);
  return (
    <>
      <PortfolioWebMCP />
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
                  <Icon name="starburst" />
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
                <span aria-hidden="true">
                  <Icon name="arrow-up-right" />
                </span>
              </figcaption>
            </figure>
            <div className="intro-copy">
              <p className="intro-greeting">Hey, I’m</p>
              <h1 id="hero-title">
                KAH SHIN<span className="glitch-dot">.</span>
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
                  EXPLORE MY WORK{" "}
                  <span aria-hidden="true">
                    <Icon name="arrow-up-right" />
                  </span>
                </a>
                <a className="intro-secondary" href="#about">
                  A LITTLE ABOUT ME{" "}
                  <span aria-hidden="true">
                    <Icon name="arrow-down" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
        <InterestsMarquee />
        <section id="about" className="about wrap section">
          <div className="section-label">Introduction</div>
          <div className="about-grid">
            <div className="about-title">
              <h2>
                A LITTLE
                <br />
                CONTEXT<span className="accent glitch-dot">.</span>
              </h2>
            </div>
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
                THE FULL STORY / RESUME <Icon name="arrow-up-right" />
              </a>
            </div>
          </div>
          <CareerOverview />
          <PagePeel />
        </section>
        <section id="portfolio" className="portfolio section">
          <div className="wrap">
            <div className="section-heading">
              <h2>
                My Projects<span className="glitch-dot">.</span>
              </h2>
              <p>
                Experiments that became projects.
                <br />
                Questions that became code.
                <br />
                Explore my projects on GitHub.
              </p>
            </div>
            <ProjectsCarousel initialData={initialProjects} />
            <a
              className="text-link"
              href={profile.github}
              target="_blank"
              rel="noreferrer"
            >
              MORE EXPERIMENTS ON GITHUB <Icon name="arrow-up-right" />
            </a>
          </div>
        </section>
        <section id="writing" className="writing wrap section">
          <div className="section-label">Publications</div>
          <div className="writing-grid">
            <h2>
              THINKING
              <br />
              OUT LOUD<span className="comic-exclamation">!</span>
            </h2>
            <div>
              {writing.articles.length ? (
                writing.articles.map((article) => (
                  <article className="article" key={article.url}>
                    <span className="eyebrow">{article.date} / MEDIUM</span>
                    <h3>
                      <a href={article.url} target="_blank" rel="noreferrer">
                        {article.title} <Icon name="arrow-up-right" />
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
                      READ ON MEDIUM <Icon name="arrow-up-right" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        <section id="contact" className="contact section">
          <div className="wrap">
            <h2>
              LET’S MAKE
              <br />
              SOMETHING{" "}
              <em>
                CLICK<span className="glitch-dot">.</span>
              </em>
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
                SAY HELLO{" "}
                <span>
                  <Icon name="arrow-up-right" />
                </span>
              </a>
            </div>
            <footer>
              <a className="wordmark" href="#home">
                ANGKS
                <span>
                  <Icon name="starburst" />
                </span>
              </a>
              <nav aria-label="Social and resume links">
                <a href={`mailto:${profile.email}`}>
                  Email <Icon name="arrow-up-right" />
                </a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn <Icon name="arrow-up-right" />
                </a>
                <a href={profile.github} target="_blank" rel="noreferrer">
                  GitHub <Icon name="arrow-up-right" />
                </a>
                <a href={profile.resume} target="_blank" rel="noreferrer">
                  Resume <Icon name="arrow-up-right" />
                </a>
              </nav>
              <span className="eyebrow">MADE OF CURIOSITY & CODE.</span>
            </footer>
            <Discoveries />
          </div>
        </section>
      </main>
      <TerminalHatch />
    </>
  );
}
