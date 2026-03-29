export type ProjectCategory = 'design' | 'development' | 'data';
export type SkillCategory = 'Design' | 'Development' | 'Analytics' | 'Tools' | 'Tools & Others';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  problemStatement?: string;
  solution?: string;
  toolsUsed: string[];
  imageUrl: string;
  githubLink?: string;
  liveLink?: string;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: number; // 0-100
  icon?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface Profile {
  aboutMe: string;
  aboutMeShort?: string;
  profileImageUrl?: string;
  cvUrl?: string;
  tagline: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  order: number;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description?: string;
  order: number;
}
