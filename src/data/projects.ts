import projectsData from './projects.json';
import type { Project } from '../types/project';

type RawProject = Record<string, unknown>;

function normalizePublicPath(path: string) {
  if (path.startsWith('/public/')) {
    return path.slice('/public'.length);
  }
  return path;
}

function toProject(value: unknown): Project | null {
  if (typeof value !== 'object' || value === null) return null;
  const project = value as RawProject;

  const title = typeof project.title === 'string' ? project.title : null;
  const description = typeof project.description === 'string' ? project.description : null;
  const technologies = Array.isArray(project.technologies)
    ? project.technologies.filter((tech): tech is string => typeof tech === 'string')
    : null;
  const github = typeof project.github === 'string' ? project.github : null;
  const projectLogo =
    typeof project.projectLogo === 'string' ? normalizePublicPath(project.projectLogo) : undefined;

  if (!title || !description || !technologies || technologies.length === 0 || !github) return null;

  return {
    title,
    description,
    technologies,
    github,
    projectLogo,
  };
}

export const projects: Project[] = Array.isArray(projectsData)
  ? projectsData
      .map(toProject)
      .filter((project): project is Project => project !== null)
  : [];
