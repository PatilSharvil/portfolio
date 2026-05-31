export interface Theme {
  id: string;
  name: string;
  emoji: string;
  isLight?: boolean;
  previewColors: string[];
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: 'earthy-dark',
    name: 'Earthy Dark',
    emoji: '🌑',
    previewColors: ['#080a0e', '#f97316', '#9a6644', '#1e2330'],
    vars: {
      '--base':        '#080a0e',
      '--crust':       '#0f1117',
      '--mantle':      '#171b24',
      '--surface':     '#1e2330',
      '--overlay':     '#252c3d',
      '--text':        '#e2e8f0',
      '--subtext':     '#8b96a8',
      '--muted':       '#4a5568',
      '--accent':      '#f97316',
      '--accent-2':    '#fb923c',
      '--accent-soft': 'rgba(249, 115, 22, 0.14)',
      '--accent-glow': 'rgba(249, 115, 22, 0.35)',
      '--glass-bg':    'rgba(13, 15, 22, 0.88)',
      '--glass-border':'rgba(156, 102, 68, 0.22)',
      '--earth-mid':   '#9a6644',
      '--earth-tan':   '#c49a6c',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    emoji: '🧛',
    previewColors: ['#0d0d1a', '#bd93f9', '#6272a4', '#282a36'],
    vars: {
      '--base':        '#0d0d1a',
      '--crust':       '#12122b',
      '--mantle':      '#1a1a3e',
      '--surface':     '#21213f',
      '--overlay':     '#282a36',
      '--text':        '#f8f8f2',
      '--subtext':     '#6272a4',
      '--muted':       '#44475a',
      '--accent':      '#bd93f9',
      '--accent-2':    '#ff79c6',
      '--accent-soft': 'rgba(189, 147, 249, 0.16)',
      '--accent-glow': 'rgba(189, 147, 249, 0.4)',
      '--glass-bg':    'rgba(13, 13, 26, 0.90)',
      '--glass-border':'rgba(98, 114, 164, 0.3)',
      '--earth-mid':   '#6272a4',
      '--earth-tan':   '#a0aec0',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Dark',
    emoji: '🌊',
    previewColors: ['#04080f', '#06b6d4', '#38bdf8', '#0a1628'],
    vars: {
      '--base':        '#04080f',
      '--crust':       '#0a1628',
      '--mantle':      '#0d1f3c',
      '--surface':     '#112850',
      '--overlay':     '#1a3564',
      '--text':        '#cdd6f4',
      '--subtext':     '#7fa8c9',
      '--muted':       '#2d5178',
      '--accent':      '#06b6d4',
      '--accent-2':    '#38bdf8',
      '--accent-soft': 'rgba(6, 182, 212, 0.14)',
      '--accent-glow': 'rgba(6, 182, 212, 0.4)',
      '--glass-bg':    'rgba(4, 8, 15, 0.90)',
      '--glass-border':'rgba(6, 182, 212, 0.22)',
      '--earth-mid':   '#7fa8c9',
      '--earth-tan':   '#a8c8e0',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    previewColors: ['#060e08', '#22c55e', '#4ade80', '#132b16'],
    vars: {
      '--base':        '#060e08',
      '--crust':       '#0d1f10',
      '--mantle':      '#132b16',
      '--surface':     '#1a3a1e',
      '--overlay':     '#21482a',
      '--text':        '#d4edda',
      '--subtext':     '#7daa85',
      '--muted':       '#2d5c35',
      '--accent':      '#22c55e',
      '--accent-2':    '#4ade80',
      '--accent-soft': 'rgba(34, 197, 94, 0.14)',
      '--accent-glow': 'rgba(34, 197, 94, 0.4)',
      '--glass-bg':    'rgba(6, 14, 8, 0.90)',
      '--glass-border':'rgba(34, 197, 94, 0.22)',
      '--earth-mid':   '#7daa85',
      '--earth-tan':   '#a8c8b0',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    emoji: '🌸',
    previewColors: ['#110808', '#f43f5e', '#fb7185', '#2a1515'],
    vars: {
      '--base':        '#110808',
      '--crust':       '#1e0f0f',
      '--mantle':      '#2a1515',
      '--surface':     '#381c1c',
      '--overlay':     '#4a2424',
      '--text':        '#fde8e8',
      '--subtext':     '#c47c7c',
      '--muted':       '#6b3333',
      '--accent':      '#f43f5e',
      '--accent-2':    '#fb7185',
      '--accent-soft': 'rgba(244, 63, 94, 0.14)',
      '--accent-glow': 'rgba(244, 63, 94, 0.4)',
      '--glass-bg':    'rgba(17, 8, 8, 0.90)',
      '--glass-border':'rgba(244, 63, 94, 0.22)',
      '--earth-mid':   '#c47c7c',
      '--earth-tan':   '#e0a0a0',
    },
  },
  {
    id: 'warm-cream',
    name: 'Warm Cream',
    emoji: '☀️',
    isLight: true,
    previewColors: ['#faf6f0', '#8B5E3C', '#D2B48C', '#f0e8d8'],
    vars: {
      '--base':        '#faf6f0',
      '--crust':       '#f0e8d8',
      '--mantle':      '#e8d8c0',
      '--surface':     '#e0ccaa',
      '--overlay':     '#d8c09a',
      '--text':        '#2c1a06',
      '--subtext':     '#6b4226',
      '--muted':       '#a07850',
      '--accent':      '#8B5E3C',
      '--accent-2':    '#9a6644',
      '--accent-soft': 'rgba(139, 94, 60, 0.14)',
      '--accent-glow': 'rgba(139, 94, 60, 0.35)',
      '--glass-bg':    'rgba(250, 246, 240, 0.85)',
      '--glass-border':'rgba(139, 94, 60, 0.28)',
      '--earth-mid':   '#9a6644',
      '--earth-tan':   '#c49a6c',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic',
    emoji: '❄️',
    isLight: true,
    previewColors: ['#f0f4f8', '#3b82f6', '#60a5fa', '#e2e8f0'],
    vars: {
      '--base':        '#f0f4f8',
      '--crust':       '#e2e8f0',
      '--mantle':      '#d1dce8',
      '--surface':     '#c3d0e0',
      '--overlay':     '#b5c2d2',
      '--text':        '#0f172a',
      '--subtext':     '#334155',
      '--muted':       '#64748b',
      '--accent':      '#3b82f6',
      '--accent-2':    '#60a5fa',
      '--accent-soft': 'rgba(59, 130, 246, 0.14)',
      '--accent-glow': 'rgba(59, 130, 246, 0.35)',
      '--glass-bg':    'rgba(240, 244, 248, 0.85)',
      '--glass-border':'rgba(59, 130, 246, 0.22)',
      '--earth-mid':   '#64748b',
      '--earth-tan':   '#94a3b8',
    },
  },
];

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  // Apply all CSS vars
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  // Light/dark mode flag for CSS selectors
  root.setAttribute('data-theme', theme.isLight ? 'light' : 'dark');
}

export function getThemeById(id: string): Theme {
  return THEMES.find(t => t.id === id) ?? THEMES[0];
}
