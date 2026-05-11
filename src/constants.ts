import { ResumeTemplateId } from './types';

export const TEMPLATES: { id: ResumeTemplateId; name: string; description: string }[] = [
  {
    id: 'tech',
    name: 'Silicon Valley Tech',
    description: 'Modern, high-developer focus with technical skill emphasis.',
  },
  {
    id: 'executive',
    name: 'Wall Street Executive',
    description: 'Classic, serif-based design for leadership roles.',
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    description: 'Bold, asymmetric layout for design and arts.',
  },
  {
    id: 'minimalist',
    name: 'Minimalist ATS-Friendly',
    description: 'Standard, single-column design optimized for job scanners.',
  },
];

export const INITIAL_RESUME_DATA = {
  personalInfo: {
    fullName: 'John Apex',
    email: 'john@apexresume.io',
    phone: '+1 (555) 000-0000',
    location: 'San Francisco, CA',
    website: 'https://apexresume.pro/john',
    jobTitle: 'Senior Full-Stack Architect',
    summary: 'Expert software engineer with 10+ years of experience in building scalable web applications and distributed systems. Passionate about performance, clean code, and mentoring teams.',
  },
  sections: [
    {
      id: 'exp-1',
      type: 'experience',
      title: 'Experience',
      enabled: true,
      content: [
        {
          id: 'work-1',
          company: 'Tech Giants Inc.',
          position: 'Lead Software Engineer',
          location: 'Mountain View, CA',
          startDate: '2020',
          endDate: 'Present',
          description: 'Led the development of a cloud-native platform serving 10M+ users. Reduced latency by 40% using optimized caching layers and distributed databases.',
          highlights: ['React/Next.js/Node.js', 'Kubernetes Architecture', 'Mentored 15 junior devs'],
        },
      ],
    },
    {
      id: 'edu-1',
      type: 'education',
      title: 'Education',
      enabled: true,
      content: [
        {
          id: 'edu-1',
          school: 'Stanford University',
          degree: 'M.S. in Computer Science',
          location: 'Stanford, CA',
          startDate: '2016',
          endDate: '2018',
          description: 'Specialized in AI and Distributed Systems. GPA: 3.9/4.0',
        },
      ],
    },
    {
      id: 'skills-1',
      type: 'skills',
      title: 'Skills',
      enabled: true,
      content: [
        { id: 's1', name: 'React', level: 95 },
        { id: 's2', name: 'TypeScript', level: 90 },
        { id: 's3', name: 'Node.js', level: 85 },
        { id: 's4', name: 'Kubernetes', level: 80 },
        { id: 's5', name: 'AWS', level: 85 },
      ],
    },
  ],
  settings: {
    templateId: 'tech',
    primaryColor: '#2563eb',
    fontSize: 'medium',
    fontFamily: 'inter',
    spacing: 'normal',
  },
};
