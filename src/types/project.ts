export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  techStack: string[];
  repoUrl: string;
  liveUrl: string;
  thumbnail: string;
  featured: boolean;
  sortOrder: number;
}