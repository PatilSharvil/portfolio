import React from 'react';

export interface TechItem {
  id: string;
  name: string;
  color: string; // Brand color used for hover glow
}

export interface TechCategory {
  title: string;
  icon: string; // Emoji prefix
  items: TechItem[];
}

export const TECH_CATEGORIES: TechCategory[] = [
  {
    title: 'Languages',
    icon: '💻',
    items: [
      { id: 'c', name: 'C', color: '#659AD2' },
      { id: 'cpp', name: 'C++', color: '#00599C' },
      { id: 'java', name: 'Java', color: '#E76F00' },
      { id: 'python', name: 'Python', color: '#3776AB' },
      { id: 'javascript', name: 'JavaScript', color: '#F7DF1E' },
      { id: 'typescript', name: 'TypeScript', color: '#3178C6' },
      { id: 'mysql_lang', name: 'MySQL', color: '#4479A1' },
      { id: 'php', name: 'PHP', color: '#777BB4' },
    ],
  },
  {
    title: 'Frontend Development',
    icon: '🎨',
    items: [
      { id: 'html', name: 'HTML5', color: '#E34F26' },
      { id: 'css', name: 'CSS3', color: '#1572B6' },
      { id: 'react', name: 'React', color: '#61DAFB' },
      { id: 'firebase', name: 'Firebase', color: '#FFCA28' },
    ],
  },
  {
    title: 'Backend Development',
    icon: '⚙️',
    items: [
      { id: 'node', name: 'Node.js', color: '#339933' },
      { id: 'express', name: 'Express.js', color: '#888888' },
      { id: 'fastapi', name: 'FastAPI', color: '#009688' },
      { id: 'flask', name: 'Flask', color: '#444444' },
      { id: 'spring', name: 'Spring Boot', color: '#6DB33F' },
      { id: 'npm', name: 'npm', color: '#CB3837' },
    ],
  },
  {
    title: 'Databases',
    icon: '🗄️',
    items: [
      { id: 'mongodb', name: 'MongoDB', color: '#47A248' },
      { id: 'mysql', name: 'MySQL', color: '#4479A1' },
      { id: 'sqlite', name: 'SQLite', color: '#003B57' },
    ],
  },
  {
    title: 'Tools & Technologies',
    icon: '🔧',
    items: [
      { id: 'git', name: 'Git', color: '#F05032' },
      { id: 'github', name: 'GitHub', color: '#FFFFFF' },
      { id: 'vscode', name: 'VS Code', color: '#007ACC' },
      { id: 'linux', name: 'Linux', color: '#FCC624' },
      { id: 'docker', name: 'Docker', color: '#2496ED' },
      { id: 'postman', name: 'Postman', color: '#FF6C37' },
      { id: 'intellij', name: 'IntelliJ IDEA', color: '#FE315D' },
      { id: 'anaconda', name: 'Anaconda', color: '#44A833' },
      { id: 'pycharm', name: 'PyCharm', color: '#21D789' },
      { id: 'huggingface', name: 'Hugging Face', color: '#FFD21E' },
    ],
  },
];

interface TechIconProps {
  id: string;
  size?: number;
}

const MAP_OFFICIAL_IDS: Record<string, string> = {
  c: 'c',
  cpp: 'cpp',
  java: 'java',
  python: 'python',
  javascript: 'js',
  typescript: 'ts',
  mysql_lang: 'mysql',
  php: 'php',
  html: 'html',
  css: 'css',
  react: 'react',
  firebase: 'firebase',
  node: 'nodejs',
  express: 'express',
  fastapi: 'fastapi',
  flask: 'flask',
  spring: 'spring',
  npm: 'npm',
  mongodb: 'mongodb',
  mysql: 'mysql',
  sqlite: 'sqlite',
  git: 'git',
  github: 'github',
  vscode: 'vscode',
  linux: 'linux',
  docker: 'docker',
  postman: 'postman',
  intellij: 'idea',
  anaconda: 'anaconda',
  pycharm: 'pycharm',
  huggingface: 'huggingface',
};

export const TechIcon: React.FC<TechIconProps> = ({ id, size = 40 }) => {
  const officialId = MAP_OFFICIAL_IDS[id];

  // If it's a standard/official icon in the skill-icons set, load it from skillicons.dev
  if (officialId) {
    return (
      <img
        src={`https://skillicons.dev/icons?i=${officialId}`}
        alt={id}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'block',
          borderRadius: `${size * 0.22}px`,
        }}
      />
    );
  }

  // Fallback / Custom SVG design styled exactly like a dark rounded square badge to match skillicons layout
  const radius = size * 0.22;
  const padding = size * 0.22;

  switch (id) {
    case 'qwen':
      return (
        <div style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${radius}px`,
          background: '#1D1D1F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <svg width={size - padding} height={size - padding} viewBox="0 0 24 24" fill="none" stroke="#4A90E2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12A10 10 0 0 1 12 2z" />
            <polyline points="8 10 6 12 8 14" />
            <polyline points="16 10 18 12 16 14" />
            <line x1="10" y1="15" x2="14" y2="9" />
          </svg>
        </div>
      );
    case 'antigravity':
      return (
        <div style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${radius}px`,
          background: '#1D1D1F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <svg width={size - padding} height={size - padding} viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18" />
            <polyline points="5 10 12 3 19 10" />
            <path d="M6 17c0-2 2-3 6-3s6 1 6 3" />
          </svg>
        </div>
      );
    case 'opencode':
      return (
        <div style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${radius}px`,
          background: '#1D1D1F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <svg width={size - padding} height={size - padding} viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </div>
      );
    default:
      return (
        <div style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${radius}px`,
          background: '#1D1D1F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#FFFFFF',
          fontSize: `${size * 0.4}px`,
          fontWeight: 'bold',
        }}>
          🚀
        </div>
      );
  }
};
