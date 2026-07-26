import React, { useState } from 'react';
import { CommentEyebrow, SectionHeading, WindowCard, CodeButton } from '../theme';
import { projects } from '../../data/projects';

function getProjectBadge(title: string) {
  const firstWord = title.trim().split(/\s+/)[0] ?? '';
  const cleaned = firstWord.replace(/[^A-Za-z0-9]/g, '');
  if (cleaned.length >= 2 && cleaned.length <= 6 && cleaned === cleaned.toUpperCase()) {
    return cleaned;
  }
  return title
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .join('')
    .slice(0, 4)
    .toUpperCase();
}

export default function Projects() {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const hasHiddenProjects = projects.length > 2;
  const visibleProjects = showAllProjects ? projects : projects.slice(0, 2);

  return (
    <section
      id="projects"
      className="px-6 py-16 max-w-6xl w-full mx-auto border-t border-[var(--border-subtle)]"
    >
      <div className="mb-10">
        <CommentEyebrow>Hello, I&apos;m</CommentEyebrow>
        <SectionHeading>Projects</SectionHeading>
        <p className="mt-4 max-w-xl text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
          A collection of projects I&apos;ve built to learn new technologies and grow as a developer.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {visibleProjects.map((project, index) => (
          <WindowCard key={`${project.title}-${index}`} label={`project-${index + 1}.json`}>
            <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card-inset)] overflow-hidden">
              <div className="border-b border-[var(--border-subtle)] p-4 flex items-center justify-between gap-3">
                {project.projectLogo ? (
                  <div className="h-8 min-w-14 px-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center">
                    <img
                      src={project.projectLogo}
                      alt={`${project.title} logo`}
                      className="h-5 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="font-mono text-[10px] px-2 py-1 rounded-md border border-[var(--border-subtle)] text-[var(--accent-blue)]">
                    {getProjectBadge(project.title)}
                  </div>
                )}
                <div className="font-mono text-[10px] text-[var(--text-secondary)] flex items-center gap-2">
                  <span className="px-2 py-1 rounded-md border border-[var(--border-subtle)]">
                    stack: {project.technologies.length}
                  </span>
                  <span className="px-2 py-1 rounded-md border border-[var(--border-subtle)]">repo</span>
                </div>
              </div>
              <div className="p-4 font-mono text-xs leading-relaxed select-none">
                <div>
                  <span className="text-[var(--syntax-keyword)]">const</span>{' '}
                  <span className="text-[var(--syntax-key)]">project</span>{' '}
                  <span className="text-[var(--text-primary)]">=</span>{' '}
                  <span className="text-yellow-500 font-bold">{'{'}</span>
                </div>
                <div className="pl-4">
                  <span className="text-[var(--syntax-key)]">name</span>
                  <span className="text-[var(--text-secondary)]">: </span>
                  <span className="text-[var(--syntax-string)]">&quot;{project.title}&quot;</span>
                  <span className="text-[var(--text-secondary)]">,</span>
                </div>
                <div className="pl-4">
                  <span className="text-[var(--syntax-key)]">stack</span>
                  <span className="text-[var(--text-secondary)]">: </span>
                  <span className="text-yellow-500 font-bold">[</span>
                  {project.technologies.map((tech, techIndex) => (
                    <React.Fragment key={`${project.title}-${tech}-${techIndex}`}>
                      <span className="text-[var(--syntax-string)]">&quot;{tech}&quot;</span>
                      {techIndex < project.technologies.length - 1 && (
                        <span className="text-[var(--text-secondary)]">, </span>
                      )}
                    </React.Fragment>
                  ))}
                  <span className="text-yellow-500 font-bold">]</span>
                  <span className="text-[var(--text-secondary)]">,</span>
                </div>
                <div className="pl-4">
                  <span className="text-[var(--syntax-key)]">path</span>
                  <span className="text-[var(--text-secondary)]">: </span>
                  <span className="text-[var(--syntax-string)]">&quot;</span>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--syntax-link)] hover:underline break-all"
                  >
                    {project.github}
                  </a>
                  <span className="text-[var(--syntax-string)]">&quot;</span>
                </div>
                <div>
                  <span className="text-yellow-500 font-bold">{'}'}</span>
                  <span className="text-[var(--text-secondary)]">;</span>
                </div>
                <div className="mt-2 text-[var(--syntax-keyword)]">
                  export default <span className="text-[var(--text-primary)]">project</span>;
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{project.description}</p>
            </div>

            <div className="mt-auto w-full pt-6">
              <CodeButton href={project.github} target="_blank" rel="noreferrer">
                view
              </CodeButton>
            </div>
          </WindowCard>
        ))}
      </div>

      {hasHiddenProjects && !showAllProjects && (
        <div className="mt-8 flex justify-center">
          <CodeButton variant="secondary" onClick={() => setShowAllProjects(true)}>
            view all projects
          </CodeButton>
        </div>
      )}
    </section>
  );
}