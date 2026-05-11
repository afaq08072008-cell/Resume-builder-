export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  jobTitle: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  link: string;
  description: string;
  technologies: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
}

export interface Section {
  id: string;
  type: 'experience' | 'education' | 'projects' | 'skills' | 'languages' | 'certifications' | 'custom';
  title: string;
  enabled: boolean;
  content: any[];
}

export type ResumeTemplateId = 'tech' | 'executive' | 'creative' | 'minimalist';

export interface ResumeSettings {
  templateId: ResumeTemplateId;
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'inter' | 'serif' | 'mono';
  spacing: 'compact' | 'normal' | 'loose';
  isPublic?: boolean;
}

export interface ResumeData {
  id?: string;
  userId?: string;
  personalInfo: PersonalInfo;
  sections: Section[];
  settings: ResumeSettings;
}

export interface ATSResult {
  score: number;
  suggestions: string[];
  keywordDensity: Record<string, number>;
}
