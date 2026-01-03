
export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  gradDate: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
}

export type TemplateType = 'elite' | 'alpine' | 'balanced';

export interface ResumeData {
  template: TemplateType;
  personal: PersonalDetails;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
}
