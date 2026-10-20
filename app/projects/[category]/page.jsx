import Link from "next/link";
import { notFound } from "next/navigation";
import { projectCategories } from "../data";
import SiteSidebar from "../../components/Sidebar";
import { getSignedInContext } from "../../../lib/auth/guards.js";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return projectCategories.map(({ slug }) => ({ category: slug }));
}

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = projectCategories.find((item) => item.slug === slug);
  return {
    title: category ? `${category.label} Projects — 8bitbrains` : "Projects — 8bitbrains",
    description: "Selected app, website, and brand projects by 8bitbrains.",
  };
}

export default async function ProjectCategoryPage({ params }) {
  const { category: slug } = await params;
  const context = await getSignedInContext();
  const account = context ? {
    role: context.profile.role,
    fullName: context.profile.full_name,
    email: context.user.email,
  } : null;
  const category = projectCategories.find((item) => item.slug === slug);
  if (!category) notFound();

  return (
    <div className="projects-page">
      <SiteSidebar activeSection="projects" categorySlug={category.slug} account={account} />
      <main className="projects-content">
        <div className="projects-content__inner">
          <nav className="projects-tabs" aria-label="Project categories">
            {projectCategories.map((item) => (
              <Link
                key={item.slug}
                className={`projects-tab${item.slug === category.slug ? " is-active" : ""}`}
                href={`/projects/${item.slug}`}
                aria-current={item.slug === category.slug ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <section className="projects-gallery" aria-label={`${category.label} portfolio`}>
            {category.projects.map((project, index) => {
              const image = (
                <img
                  className="project-card__image"
                  src={project.src}
                  alt={project.label}
                  loading={index < 2 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              );

              return project.href ? (
                <a
                  className={`project-card project-card--link${category.slug === "websites" && index === 0 ? " project-card--first" : ""}`}
                  href={project.href}
                  key={project.id}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${project.label} in a new tab`}
                >
                  {image}
                </a>
              ) : (
                <figure className="project-card" key={project.id}>
                  {image}
                </figure>
              );
            })}
          </section>

          <footer className="projects-footer">
            <div className="projects-footer__cta">
              <span>Let's create something</span>
              <strong>big together :)</strong>
            </div>
            <div className="projects-footer__actions">
              <a href="tel:8789053612">Start Project <span>↗</span></a>
              <a href="https://wa.me/918789053612" target="_blank" rel="noreferrer">Send a Message <span>↗</span></a>
            </div>
            <div className="projects-footer__bottom">
              <span>© 2026 8bitbrains | All rights reserved</span>
              <a href="https://x.com/8bitbrains" target="_blank" rel="noreferrer">Follow on X ↗</a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
