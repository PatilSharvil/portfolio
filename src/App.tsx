import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Terminal, 
  User, 
  Code, 
  Code2,
  Wifi, 
  Battery, 
  X,
  LayoutGrid,
  Image as ImageIcon,
  Thermometer,
  Zap,
  Sun,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Cpu,
  Monitor,
  Disc,
  Home,
  Volume2,
  Bluetooth,
  Moon,
  Search,
  Settings,
  Bell,
  Power,
  RotateCcw,
  Users,
  Mail,
  Globe,
  ChevronRight,
  Star,
  GitBranch,
  Database,
  Server,
  Layers,
  Coffee,
  Palette,
  Keyboard,
  Check,
  MousePointer2,
  Wind,
  Rocket,
  Gamepad2
} from 'lucide-react';
import Hero from './Hero';
import Launchpad from './Launchpad';
import Snake from './games/Snake';
import SplitText from './SplitText';
import { THEMES, applyTheme, type Theme } from './themes';
import './App.css';

const WALLPAPERS = [
  '/wallpapers/Mountain-and-Samurai.jpg',
  '/wallpapers/floating-mountains.png',
  '/wallpapers/snowy-peaks.png',
  '/wallpapers/coastal-village.jpg',
  '/wallpapers/river-valley.jpg',
  '/wallpapers/mountain-valley.jpg',
  '/wallpapers/mystical-forest.png',
  '/wallpapers/cyberpunk-city.png'
];

interface WindowState {
  id: number;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
  initX: number;
  initY: number;
}

const App: React.FC = () => {
  const [showHero, setShowHero] = useState(true);
  const [time, setTime] = useState(new Date());
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWorkspace] = useState(1);
  const [currentWallpaper, setCurrentWallpaper] = useState(WALLPAPERS[0]);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [topZ, setTopZ] = useState(10);
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(85);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [notifCount, setNotifCount] = useState(3);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [ambientActive, setAmbientActive] = useState(false);
  const ambientRef = useRef<{ ctx: AudioContext; source: AudioBufferSourceNode; gain: GainNode } | null>(null);

  // Popup States
  const [showDashboard, setShowDashboard] = useState(false);
  const [showWallpapers, setShowWallpapers] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showPower, setShowPower] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  const closeAllPopups = useCallback(() => {
    setShowDashboard(false);
    setShowWallpapers(false);
    setShowQuickSettings(false);
    setShowCalendar(false);
    setShowMessages(false);
    setShowMedia(false);
    setShowSearch(false);
    setShowPower(false);
    setShowThemes(false);
    setShowLaunchpad(false);
    setContextMenu(null);
  }, []);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Apply theme CSS vars whenever theme changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) setShowShortcuts(s => !s);
      if (e.key === 'Escape') { 
        setShowShortcuts(false); 
        setShowLaunchpad(false);
        setContextMenu(null); 
      }
      if ((e.key === 'l' || e.key === 'L') && e.altKey) {
        e.preventDefault();
        closeAllPopups();
        setShowLaunchpad(s => !s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeAllPopups]);

  // Ambient sound control
  const toggleAmbient = () => {
    if (ambientActive) {
      ambientRef.current?.source.stop();
      ambientRef.current?.ctx.close();
      ambientRef.current = null;
      setAmbientActive(false);
    } else {
      const ctx = new AudioContext();
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      // Brown noise (rain-like)
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        data[i] = last * 3.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = (volume / 100) * 0.25;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      ambientRef.current = { ctx, source, gain };
      setAmbientActive(true);
    }
  };

  // Sync ambient volume with volume slider
  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.gain.gain.value = (volume / 100) * 0.25;
    }
  }, [volume]);

  const bringToFront = (id: number) => {
    setTopZ(prev => prev + 1);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: topZ + 1, isMinimized: false } : w));
  };

  const openWindow = (title: string, icon: React.ReactNode, content: React.ReactNode) => {
    const existing = windows.find(w => w.title === title);
    if (existing) {
      bringToFront(existing.id);
      return;
    }
    const newId = Date.now();
    // Cascade offset so windows don't pile on top of each other
    const cascade = (windows.length % 8) * 28;
    setWindows(prev => [...prev, {
      title, icon, content, id: newId,
      isMaximized: false, isMinimized: false,
      zIndex: topZ + 1,
      initX: 80 + cascade,
      initY: 36 + cascade,
    }]);
    setTopZ(prev => prev + 1);
    closeAllPopups();
  };

  const closeWindow = (id: number) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const toggleMaximize = (id: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const toggleMinimize = (id: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  };

  const handleLaunchApp = (appId: string) => {
    switch (appId) {
      case 'terminal':
        openWindow('Terminal', <Terminal size={16} />, <TerminalContent />);
        break;
      case 'about':
        openWindow('About Me', <User size={16} />, <AboutContent />);
        break;
      case 'projects':
        openWindow('Projects', <Code size={16} />, <ProjectsContent />);
        break;
      case 'github':
        openWindow('GitHub', <Code2 size={16} />, <GithubContent />);
        break;
      case 'wallpaper':
        setShowWallpapers(true);
        break;
      case 'themes':
        setShowThemes(true);
        break;
      case 'media':
        setShowMedia(true);
        break;
      case 'shortcuts':
        setShowShortcuts(true);
        break;
      case 'settings':
        setShowQuickSettings(true);
        break;
      case 'snake':
        openWindow('Snake Game', <Gamepad2 size={16} />, <Snake />);
        break;
      default:
        break;
    }
  };

  if (showHero) {
    return <Hero onEnter={() => setShowHero(false)} />;
  }

  return (
    <div 
      className={`shell-container ${currentTheme.isLight ? 'light-theme' : ''}`}
      style={{ backgroundImage: `url(${currentWallpaper})` }}
      onClick={() => { closeAllPopups(); }}
      onContextMenu={e => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <div className="noise-overlay"></div>
      
      {/* Side Bar */}
      <aside className="side-bar glass" onClick={e => e.stopPropagation()}>
        <div className="side-section top">
          <SideIcon icon={<LayoutGrid size={20} />} label="Dashboard" onClick={() => { closeAllPopups(); setShowDashboard(d => !d); }} active={showDashboard} />
          <SideIcon icon={<ImageIcon size={20} />} label="Wallpaper" onClick={() => { closeAllPopups(); setShowWallpapers(w => !w); }} active={showWallpapers} />
          <SideIcon icon={<Disc size={20} />} label="Media" onClick={() => { closeAllPopups(); setShowMedia(m => !m); }} active={showMedia} />
          <SideIcon icon={<Bell size={20} />} label="Notifications" badge={notifCount} onClick={() => { closeAllPopups(); setShowMessages(m => !m); setNotifCount(0); }} active={showMessages} />
          <SideIcon icon={<Palette size={20} />} label="Themes" onClick={() => { closeAllPopups(); setShowThemes(t => !t); }} active={showThemes} />
        </div>

        <div className="desktop-label-container">
          <span className="desktop-label">WS {activeWorkspace}</span>
        </div>

        <div className="side-section middle">
          <SideIcon icon={<Rocket size={20} />} label="Launchpad" onClick={() => { closeAllPopups(); setShowLaunchpad(l => !l); }} active={showLaunchpad} />
          <SideIcon icon={<Home size={20} />} label="Desktop" onClick={() => { setWindows([]); closeAllPopups(); }} />
          <SideIcon icon={<User size={20} />} label="About Me" onClick={() => openWindow('About Me', <User size={16} />, <AboutContent />)} />
          <SideIcon icon={<Code size={20} />} label="Projects" onClick={() => openWindow('Projects', <Code size={16} />, <ProjectsContent />)} />
          <SideIcon icon={<Terminal size={20} />} label="Terminal" onClick={() => openWindow('Terminal', <Terminal size={16} />, <TerminalContent />)} />
          <SideIcon icon={<Code2 size={20} />} label="GitHub" onClick={() => openWindow('GitHub', <Code2 size={16} />, <GithubContent />)} />
          <SideIcon icon={<Keyboard size={20} />} label="Shortcuts (?)" onClick={() => setShowShortcuts(s => !s)} active={showShortcuts} />
          <SideIcon icon={<Search size={20} />} label="Search" onClick={() => { closeAllPopups(); setShowSearch(s => !s); }} active={showSearch} />
        </div>

        <div className="side-section bottom">
          <div className="minimized-indicators">
            {windows.filter(w => w.isMinimized).map(w => (
              <div key={w.id} className="minimized-dot" title={w.title} onClick={() => bringToFront(w.id)}></div>
            ))}
          </div>
          <SideIcon icon={<Wifi size={16} />} label="Settings" onClick={() => { closeAllPopups(); setShowQuickSettings(q => !q); }} active={showQuickSettings} />
          <SideIcon icon={<Battery size={16} />} label="Power" onClick={() => { closeAllPopups(); setShowQuickSettings(q => !q); }} active={showQuickSettings} />
          <div className="time-vertical clickable" onClick={() => { closeAllPopups(); setShowCalendar(c => !c); }}>
            <span>{time.getHours()}</span>
            <span>{time.getMinutes().toString().padStart(2, '0')}</span>
          </div>
        </div>
      </aside>

      {/* Overlays/Popups */}
      <AnimatePresence>
        {showDashboard && <DashboardOverlay activeTab={activeTab} setActiveTab={setActiveTab} time={time} />}
        {showWallpapers && <WallpaperSwitcher currentWallpaper={currentWallpaper} setCurrentWallpaper={setCurrentWallpaper} onClose={() => setShowWallpapers(false)} />}
        {showQuickSettings && (
          <QuickSettingsOverlay
            onPower={() => { closeAllPopups(); setShowPower(true); }}
            volume={volume} setVolume={setVolume}
            brightness={brightness} setBrightness={setBrightness}
            ambientActive={ambientActive} onToggleAmbient={toggleAmbient}
          />
        )}
        {showCalendar && <CalendarOverlay time={time} />}
        {showMessages && <MessagesOverlay onClose={() => setShowMessages(false)} />}
        {showMedia && <MediaOverlay onClose={() => setShowMedia(false)} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />}
        {showSearch && <SearchOverlay openWindow={openWindow} onClose={() => setShowSearch(false)} />}
        {showPower && <PowerOverlay onClose={() => setShowPower(false)} />}
        {showThemes && <ThemePanel currentTheme={currentTheme} onSelect={t => { setCurrentTheme(t); }} onClose={() => setShowThemes(false)} />}
        {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
        {showLaunchpad && (
          <Launchpad 
            onClose={() => setShowLaunchpad(false)} 
            onLaunch={handleLaunchApp} 
          />
        )}
        {contextMenu && (
          <ContextMenuPanel
            x={contextMenu.x} y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            openWindow={openWindow}
            setShowWallpapers={setShowWallpapers}
            setShowThemes={setShowThemes}
            setShowShortcuts={setShowShortcuts}
            setShowLaunchpad={setShowLaunchpad}
            closeAllPopups={closeAllPopups}
          />
        )}
      </AnimatePresence>

      {/* Main Desktop Area */}
      <main className="desktop" onClick={closeAllPopups}>
        <div className="desktop-logo">
          <SplitText
            text="Sharvil"
            className="logo-text"
            delay={80}
            duration={1.2}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 50, scale: 0.85 }}
            to={{ opacity: 1, y: 0, scale: 1 }}
            tag="h1"
            textAlign="right"
          />
          <div className="resume-btn-container">
            <a href="https://drive.google.com/file/d/1zliv0b8hSDZSaKnLnOPTSnP-c0SkzIhk/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="resume-btn" onClick={e => e.stopPropagation()}>
              Resume
              <div className="icon">
                <svg height={24} width={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="currentColor" />
                </svg>
              </div>
            </a>
          </div>
        </div>

        <AnimatePresence>
          {windows.map((win) => (
            <Window 
              key={win.id} 
              window={win} 
              onClose={() => closeWindow(win.id)} 
              onMaximize={() => toggleMaximize(win.id)}
              onMinimize={() => toggleMinimize(win.id)}
              onFocus={() => bringToFront(win.id)}
            />
          ))}
        </AnimatePresence>

      </main>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────

const DashboardOverlay: React.FC<{ activeTab: string, setActiveTab: (t: string) => void, time: Date }> = ({ activeTab, setActiveTab, time }) => {
  const dragControls = useDragControls();
  return (
    <motion.div
      className="dashboard glass"
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      initial={{ scale: 0.92, opacity: 0, y: -16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0, y: -16 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      onClick={e => e.stopPropagation()}
    >
      <div 
        className="dashboard-drag-handle dashboard-tabs"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          dragControls.start(e);
        }}
        style={{ cursor: 'grab' }}
      >
        {['Dashboard', 'Media', 'Performance', 'Workspaces'].map(tab => (
          <button key={tab} className={`dash-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>
    <div className="dashboard-content">
      {activeTab === 'Dashboard' && (
        <div className="dashboard-grid">
          <div className="widget weather-widget">
            <Sun size={40} className="weather-icon" />
            <div className="weather-info">
              <span className="temp">28°C</span>
              <span className="condition">Sunny</span>
            </div>
          </div>
          <div className="widget profile-widget">
            <div className="avatar">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=PortfolioDev" alt="avatar" />
            </div>
            <div className="sys-info">
              <p><Monitor size={12} /> Arch Linux</p>
              <p><LayoutGrid size={12} /> Hyprland</p>
              <p><Coffee size={12} /> Uptime: 4h 12m</p>
            </div>
          </div>
          <div className="widget time-widget">
            <span className="big-time">{time.getHours()}:{time.getMinutes().toString().padStart(2, '0')}</span>
            <span className="date-str">{time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="widget calendar-widget">
            <div className="cal-grid">
              {Array.from({ length: 31 }, (_, i) => (
                <div key={`day-${i}`} className={`cal-day ${i + 1 === time.getDate() ? 'today' : ''}`}>{i + 1}</div>
              ))}
            </div>
          </div>
          <div className="widget info-widget">
            <Zap size={20} className="info-icon" />
            <div className="info-text">
              <span className="label">Performance</span>
              <span className="value">Balanced</span>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'Performance' && (
        <div className="perf-grid">
          <div className="widget mini"><Cpu size={18} /><div><span className="perf-label">CPU</span><span className="perf-val">24%</span><div className="perf-bar"><div className="perf-fill" style={{width:'24%'}} /></div></div></div>
          <div className="widget mini"><Zap size={18} /><div><span className="perf-label">RAM</span><span className="perf-val">5.4 GB</span><div className="perf-bar"><div className="perf-fill" style={{width:'67%'}} /></div></div></div>
          <div className="widget mini"><Thermometer size={18} /><div><span className="perf-label">GPU Temp</span><span className="perf-val">54°C</span><div className="perf-bar" style={{background:'rgba(255,120,50,0.15)'}}><div className="perf-fill" style={{width:'54%', background:'#ff7832'}} /></div></div></div>
          <div className="widget mini"><Database size={18} /><div><span className="perf-label">Disk</span><span className="perf-val">128 GB free</span><div className="perf-bar"><div className="perf-fill" style={{width:'40%'}} /></div></div></div>
        </div>
      )}
      {activeTab === 'Media' && <div className="embedded-media"><MediaOverlay isEmbedded /></div>}
      {activeTab === 'Workspaces' && (
        <div className="workspace-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className={`workspace-preview glass ${i === 1 ? 'active-ws' : ''}`}>
              <div className="ws-number">{i}</div>
              <div className="ws-label">Desktop {i}</div>
              {i === 1 && <div className="ws-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  </motion.div>
  );
};

const QuickSettingsOverlay: React.FC<{
  onPower: () => void;
  volume: number; setVolume: (v: number) => void;
  brightness: number; setBrightness: (b: number) => void;
  ambientActive: boolean; onToggleAmbient: () => void;
}> = ({ onPower, volume, setVolume, brightness, setBrightness, ambientActive, onToggleAmbient }) => {
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(true);
  const [dnd, setDnd] = useState(false);
  const [perf, setPerf] = useState(true);

  return (
    <motion.div
      className="quick-settings glass"
      drag
      dragMomentum={false}
      dragElastic={0}
      initial={{ x: -20, opacity: 0, scale: 0.95 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: -20, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="qs-header">
        <span>Quick Settings</span>
        <span className="qs-user">dev@arch</span>
      </div>
      <div className="qs-grid">
        <div className={`qs-item ${wifi ? 'active' : ''}`} onClick={() => setWifi(w => !w)}>
          <Wifi size={18} />
          <span>Wi-Fi</span>
        </div>
        <div className={`qs-item ${bt ? 'active' : ''}`} onClick={() => setBt(b => !b)}>
          <Bluetooth size={18} />
          <span>Bluetooth</span>
        </div>
        <div className={`qs-item ${dnd ? 'active' : ''}`} onClick={() => setDnd(d => !d)}>
          <Moon size={18} />
          <span>Do Not Disturb</span>
        </div>
        <div className={`qs-item ${perf ? 'active' : ''}`} onClick={() => setPerf(p => !p)}>
          <Zap size={18} />
          <span>Performance</span>
        </div>
      </div>
      <div className="qs-sliders">
        <div className="slider-item">
          <Volume2 size={14} />
          <span className="slider-label">{volume}%</span>
          <input
            type="range" min={0} max={100} value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="qs-range"
          />
        </div>
        <div className="slider-item">
          <Sun size={14} />
          <span className="slider-label">{brightness}%</span>
          <input
            type="range" min={0} max={100} value={brightness}
            onChange={e => setBrightness(Number(e.target.value))}
            className="qs-range"
          />
        </div>
      </div>
      <div className="qs-ambient" onClick={onToggleAmbient}>
        <Wind size={15} />
        <span>Ambient Sound {ambientActive ? '(Rain · ON)' : '(OFF)'}</span>
        <div className={`qs-ambient-toggle ${ambientActive ? 'on' : ''}`}>
          <div className="qs-ambient-knob" />
        </div>
      </div>
      <div className="qs-footer">
        <Settings size={16} className="clickable qs-footer-icon" />
        <span className="qs-version">Hyprland v0.44</span>
        <Power size={16} className="power-btn clickable qs-footer-icon" onClick={onPower} />
      </div>
    </motion.div>
  );
};

const SearchOverlay: React.FC<{ openWindow: (t: string, i: React.ReactNode, c: React.ReactNode) => void, onClose: () => void }> = ({ openWindow, onClose }) => {
  const [query, setQuery] = useState('');
  const dragControls = useDragControls();
  
  const apps = [
    { label: 'Terminal', icon: <Terminal size={18} />, content: <TerminalContent /> },
    { label: 'About Me', icon: <User size={18} />, content: <AboutContent /> },
    { label: 'Projects', icon: <Code size={18} />, content: <ProjectsContent /> },
    { label: 'GitHub', icon: <Code2 size={18} />, content: <GithubContent /> },
  ];

  const filtered = apps.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <motion.div
      className="search-overlay glass"
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      initial={{ scale: 0.9, opacity: 0, y: -10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: -10 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      onClick={e => e.stopPropagation()}
    >
      <div 
        className="search-box"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('button')) return;
          dragControls.start(e);
        }}
        style={{ cursor: 'grab' }}
      >
        <Search size={18} />
        <input
          autoFocus
          placeholder="Search apps..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && <button className="search-clear" onClick={() => setQuery('')}><X size={14} /></button>}
      </div>
      <div className="search-results">
        {filtered.map(app => (
          <div key={app.label} className="search-item" onClick={() => { openWindow(app.label, app.icon, app.content); onClose(); }}>
            <span className="search-item-icon">{app.icon}</span>
            <span>{app.label}</span>
            <ChevronRight size={14} className="search-arrow" />
          </div>
        ))}
        {filtered.length === 0 && <div className="search-empty">No results for "{query}"</div>}
      </div>
      <button className="overlay-close-btn" onClick={onClose}><X size={14} /></button>
    </motion.div>
  );
};

const PowerOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    className="power-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="power-menu glass"
      initial={{ scale: 0.88, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.88, y: 20 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="power-title">
        <Power size={20} />
        <span>System Power</span>
      </div>
      <div className="power-options">
        <div className="power-option shutdown" onClick={onClose}>
          <div className="power-icon-wrap"><Power size={28} /></div>
          <span>Shut Down</span>
        </div>
        <div className="power-option restart" onClick={onClose}>
          <div className="power-icon-wrap"><RotateCcw size={28} /></div>
          <span>Restart</span>
        </div>
        <div className="power-option sleep" onClick={onClose}>
          <div className="power-icon-wrap"><Moon size={28} /></div>
          <span>Sleep</span>
        </div>
      </div>
      <button className="cancel-btn" onClick={onClose}>Cancel</button>
    </motion.div>
  </motion.div>
);

const MediaOverlay: React.FC<{ isEmbedded?: boolean, onClose?: () => void, isPlaying?: boolean, setIsPlaying?: (v: boolean) => void }> = ({
  isEmbedded, onClose, isPlaying = false, setIsPlaying
}) => {
  const [playing, setPlaying] = useState(isPlaying);
  const toggle = () => {
    setPlaying(p => !p);
    setIsPlaying?.(!playing);
  };

  return (
    <motion.div
      className={`media-popup ${!isEmbedded ? 'glass floating-popup' : ''}`}
      drag={!isEmbedded}
      dragMomentum={false}
      dragElastic={0}
      whileDrag={{ scale: 1.02, boxShadow: '0 28px 70px rgba(0,0,0,0.7)' }}
      initial={!isEmbedded ? { scale: 0.9, opacity: 0, y: 10 } : false}
      animate={!isEmbedded ? { scale: 1, opacity: 1, y: 0 } : false}
      exit={!isEmbedded ? { scale: 0.9, opacity: 0, y: 10 } : undefined}
      onClick={e => e.stopPropagation()}
    >
      {!isEmbedded && (
        <div className="popup-header-bar">
          <span>Now Playing</span>
          <button className="p-close-btn" onClick={onClose}><X size={14} /></button>
        </div>
      )}
      <div className="music-player-container">
        <div className="vinyl-section">
          <div className={`vinyl-wrapper ${playing ? 'spinning' : ''}`}>
            <Disc size={90} className="vinyl-icon" />
          </div>
          <div className="music-visualizer">
            {Array.from({length: 5}).map((_, i) => (
              <div key={i} className={`vis-bar ${playing ? 'animating' : ''}`} style={{animationDelay: `${i * 0.12}s`}} />
            ))}
          </div>
        </div>
        <div className="music-details">
          <span className="song-title">Bad Apple!!</span>
          <span className="artist-name">Alstroemeria Records</span>
          <div className="music-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '45%' }} />
            </div>
            <div className="progress-time">
              <span>1:24</span>
              <span>3:39</span>
            </div>
          </div>
          <div className="music-controls">
            <button className="ctrl-btn"><SkipBack size={18} /></button>
            <button className="ctrl-btn play-btn" onClick={toggle}>
              {playing ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button className="ctrl-btn"><SkipForward size={18} /></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CalendarOverlay: React.FC<{ time: Date }> = ({ time }) => {
  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  return (
    <motion.div
      className="calendar-popup glass"
      drag
      dragMomentum={false}
      dragElastic={0}
      whileDrag={{ scale: 1.02, boxShadow: '0 28px 70px rgba(0,0,0,0.7)' }}
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 22 }}
      onClick={e => e.stopPropagation()}
    >
      <h3>{time.toLocaleDateString([], { month: 'long', year: 'numeric' })}</h3>
      <div className="cal-large-grid">
        {daysOfWeek.map((d, i) => <div key={`hdr-${i}`} className="cal-head">{d}</div>)}
        {Array.from({ length: 31 }, (_, i) => (
          <div key={`cal-${i}`} className={`cal-day-large ${i + 1 === time.getDate() ? 'today' : ''}`}>{i + 1}</div>
        ))}
      </div>
    </motion.div>
  );
};

const MessagesOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    className="messages-popup glass"
    drag
    dragMomentum={false}
    dragElastic={0}
    whileDrag={{ scale: 1.02, boxShadow: '0 28px 70px rgba(0,0,0,0.7)' }}
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -20, opacity: 0 }}
    onClick={e => e.stopPropagation()}
  >
    <div className="popup-header-bar">
      <span>Notifications</span>
      <button className="p-close-btn" onClick={onClose}><X size={14} /></button>
    </div>
    <div className="notif-list">
      <div className="notif-item glass">
        <div className="notif-dot" />
        <div><strong>GitHub:</strong> New star on your repo! ⭐</div>
      </div>
      <div className="notif-item glass">
        <div className="notif-dot" />
        <div><strong>System:</strong> Kernel 6.9.1 updated successfully.</div>
      </div>
      <div className="notif-item glass">
        <div className="notif-dot gray" />
        <div><strong>pacman:</strong> 4 packages available for upgrade.</div>
      </div>
      <div className="notif-item glass">
        <div className="notif-dot gray" />
        <div><strong>Hyprland:</strong> Config reloaded successfully.</div>
      </div>
    </div>
  </motion.div>
);

const WallpaperSwitcher: React.FC<{ currentWallpaper: string, setCurrentWallpaper: (w: string) => void, onClose: () => void }> = ({ currentWallpaper, setCurrentWallpaper, onClose }) => (
  <motion.div
    className="wallpaper-switcher glass"
    drag
    dragMomentum={false}
    dragElastic={0}
    whileDrag={{ scale: 1.02, boxShadow: '0 28px 70px rgba(0,0,0,0.7)' }}
    initial={{ y: 80, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 80, opacity: 0 }}
    transition={{ type: 'spring', damping: 22 }}
    onClick={e => e.stopPropagation()}
  >
    <div className="wallpaper-header">
      <span>Choose Wallpaper</span>
      <button className="p-close-btn" onClick={onClose}><X size={14} /></button>
    </div>
    <div className="wallpaper-grid">
      {WALLPAPERS.map((wp, idx) => (
        <motion.div
          key={idx}
          className={`wallpaper-thumb ${currentWallpaper === wp ? 'active-wp' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setCurrentWallpaper(wp); onClose(); }}
          style={{ backgroundImage: `url(${wp})` }}
        >
          {currentWallpaper === wp && <div className="wp-check">✓</div>}
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const SIDEBAR_OFFSET = 74; // sidebar width + margins

const Window: React.FC<{
  window: WindowState;
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
  onFocus: () => void;
}> = ({ window, onClose, onMaximize, onMinimize, onFocus }) => {
  const [geom, setGeom] = useState({
    x: window.initX,
    y: window.initY,
    w: 660,
    h: 450
  });

  // Saved geometry for maximize/restore
  const savedGeom = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  // ── Manual header drag + snap zone detection ──
  const [snapZone, setSnapZone] = useState<'left' | 'right' | 'max' | null>(null);

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.isMaximized) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startXPos = geom.x;
    const startYPos = geom.y;

    const onMove = (ev: MouseEvent) => {
      setGeom(prev => ({
        ...prev,
        x: startXPos + ev.clientX - startX,
        y: Math.max(0, startYPos + ev.clientY - startY),
      }));

      // Snap zone detection
      const W = globalThis.innerWidth;
      const EDGE = 28;
      if (ev.clientX <= SIDEBAR_OFFSET + EDGE)       setSnapZone('left');
      else if (ev.clientX >= W - EDGE)               setSnapZone('right');
      else if (ev.clientY <= EDGE)                   setSnapZone('max');
      else                                           setSnapZone(null);
    };

    const onUp = () => {
      // Apply snap if in a zone
      if (snapZone === 'left') {
        const avail = globalThis.innerWidth - SIDEBAR_OFFSET;
        setGeom({ x: SIDEBAR_OFFSET, y: 0, w: avail / 2, h: globalThis.innerHeight });
      } else if (snapZone === 'right') {
        const avail = globalThis.innerWidth - SIDEBAR_OFFSET;
        setGeom({ x: SIDEBAR_OFFSET + avail / 2, y: 0, w: avail / 2, h: globalThis.innerHeight });
      } else if (snapZone === 'max') {
        savedGeom.current = { ...geom };
        onMaximize();
      }
      setSnapZone(null);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Maximize / Restore with size memory ──
  const handleMaximize = () => {
    if (!window.isMaximized) {
      savedGeom.current = { ...geom };
    } else if (savedGeom.current) {
      setGeom(savedGeom.current);
    }
    onMaximize();
  };

  // ── Custom Resize Handler (All 8 Directions) ──
  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = geom.w;
    const startH = geom.h;
    const startXPos = geom.x;
    const startYPos = geom.y;

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;

      let newW = startW;
      let newH = startH;
      let newX = startXPos;
      let newY = startYPos;

      const minW = 400;
      const minH = 280;

      // Horizontal resize
      if (direction.includes('e')) {
        newW = Math.max(minW, startW + deltaX);
      } else if (direction.includes('w')) {
        const potentialW = startW - deltaX;
        if (potentialW >= minW) {
          newW = potentialW;
          newX = startXPos + deltaX;
        } else {
          newW = minW;
          newX = startXPos + (startW - minW);
        }
      }

      // Vertical resize
      if (direction.includes('s')) {
        newH = Math.max(minH, startH + deltaY);
      } else if (direction.includes('n')) {
        const potentialH = startH - deltaY;
        if (potentialH >= minH) {
          newH = potentialH;
          newY = Math.max(0, startYPos + deltaY);
        } else {
          newH = minH;
          newY = startYPos + (startH - minH);
        }
      }

      setGeom({ x: newX, y: newY, w: newW, h: newH });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const isMin = window.isMinimized;
  const isMax = window.isMaximized;

  const containerStyle: React.CSSProperties = isMax
    ? {
        position: 'fixed',
        top: 0,
        left: SIDEBAR_OFFSET,
        width: `calc(100vw - ${SIDEBAR_OFFSET}px)`,
        height: '100vh',
        zIndex: window.zIndex,
        pointerEvents: isMin ? 'none' : 'auto'
      }
    : {
        position: 'absolute',
        top: geom.y,
        left: geom.x,
        width: geom.w,
        height: geom.h,
        zIndex: window.zIndex,
        pointerEvents: isMin ? 'none' : 'auto'
      };

  return (
    <>
      {/* Snap zone preview overlay */}
      <AnimatePresence>
        {snapZone && (
          <motion.div
            key={snapZone}
            className={`snap-preview snap-${snapZone}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12 }}
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 16 }}
        animate={{ scale: isMin ? 0 : 1, opacity: isMin ? 0 : 1, y: isMin ? 16 : 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        style={containerStyle}
        onPointerDown={onFocus}
        onClick={e => e.stopPropagation()}
        className="window-container"
      >
        <div className="window glass" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Resize Handles (rendered only when not maximized) */}
          {!isMax && (
            <>
              <div className="resize-handle n" onMouseDown={e => handleResizeMouseDown(e, 'n')} />
              <div className="resize-handle s" onMouseDown={e => handleResizeMouseDown(e, 's')} />
              <div className="resize-handle w" onMouseDown={e => handleResizeMouseDown(e, 'w')} />
              <div className="resize-handle e" onMouseDown={e => handleResizeMouseDown(e, 'e')} />
              <div className="resize-handle nw" onMouseDown={e => handleResizeMouseDown(e, 'nw')} />
              <div className="resize-handle ne" onMouseDown={e => handleResizeMouseDown(e, 'ne')} />
              <div className="resize-handle sw" onMouseDown={e => handleResizeMouseDown(e, 'sw')} />
              <div className="resize-handle se" onMouseDown={e => handleResizeMouseDown(e, 'se')} />
            </>
          )}

          <div className="window-header" onMouseDown={handleHeaderMouseDown} onDoubleClick={handleMaximize}>
            <div className="window-traffic-lights" onMouseDown={e => e.stopPropagation()}>
              <button className="win-btn close-btn"    title="Close"    onClick={onClose}       />
              <button className="win-btn minimize-btn" title="Minimize" onClick={onMinimize}    />
              <button className="win-btn maximize-btn" title={isMax ? 'Restore' : 'Maximize'} onClick={handleMaximize} />
            </div>
            <div className="window-title-center">
              <span className="win-icon">{window.icon}</span>
              <span className="window-title">{window.title}</span>
            </div>
            <div className="window-title-spacer" />
          </div>
          <div className="window-content" style={{ flex: 1, overflow: 'auto' }}>{window.content}</div>
        </div>
      </motion.div>
    </>
  );
};

const SideIcon: React.FC<{ icon: React.ReactNode; onClick?: () => void; active?: boolean; label?: string; badge?: number }> = ({ icon, onClick, active, label, badge }) => (
  <motion.button
    className={`side-icon ${active ? 'active' : ''}`}
    whileHover={{ scale: 1.12 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    title={label}
    style={{ position: 'relative' }}
  >
    {icon}
    {active && <span className="side-active-pip" />}
    {badge != null && badge > 0 && (
      <span className="notif-badge">{badge > 9 ? '9+' : badge}</span>
    )}
  </motion.button>
);

// ─── Content Windows ─────────────────────────────────────────────

// Matrix rain canvas component
const MatrixRain: React.FC<{ onComplete?: () => void; isBackground?: boolean }> = ({ onComplete, isBackground }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
      }
    });
    resizeObserver.observe(canvas.parentElement || canvas);

    const ctx = canvas.getContext('2d')!;
    const FONT_SIZE = 13;
    let cols = Math.floor((canvas.width || 640) / FONT_SIZE);
    let drops: number[] = Array(cols).fill(1);
    const CHARS = 'アイウエオカキクケコサシスセソ0123456789ABCDEF#%$@!<>{}[]01';

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const currentCols = Math.floor(W / FONT_SIZE);
      if (currentCols !== drops.length) {
        const newDrops = Array(currentCols).fill(1);
        for (let i = 0; i < Math.min(drops.length, currentCols); i++) {
          newDrops[i] = drops[i];
        }
        drops = newDrops;
      }

      ctx.fillStyle = isBackground ? 'rgba(5, 8, 5, 0.08)' : 'rgba(0,0,0,0.07)';
      ctx.fillRect(0, 0, W, H);

      drops.forEach((y, x) => {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        if (isBackground) {
          ctx.fillStyle = `rgba(0, 255, 0, ${0.04 + Math.random() * 0.1})`;
        } else {
          ctx.fillStyle = y * FONT_SIZE < FONT_SIZE * 2 ? '#fff' : `hsl(120,100%,${30 + Math.random() * 30}%)`;
        }
        ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;
        ctx.fillText(ch, x * FONT_SIZE, y * FONT_SIZE);
        if (y * FONT_SIZE > H && Math.random() > 0.975) drops[x] = 0;
        drops[x]++;
      });
    };

    const interval = setInterval(draw, 40);
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (!isBackground && onComplete) {
      timeout = setTimeout(() => {
        clearInterval(interval);
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        onComplete();
      }, 2600);
    }
    return () => {
      clearInterval(interval);
      if (timeout) clearTimeout(timeout);
      resizeObserver.disconnect();
    };
  }, [isBackground, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={isBackground
        ? { position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }
        : { width: '100%', height: '100%', display: 'block', background: '#000' }
      }
    />
  );
};

// Boot sequence component
const BOOT_LINES = [
  { text: 'Portfolio OS v2.0 — booting...', color: '#888', delay: 60 },
  { text: '[ OK ] Loading kernel modules', color: '#22c55e', delay: 80 },
  { text: '[ OK ] Mounting /home/portfolio', color: '#22c55e', delay: 60 },
  { text: '[ OK ] Starting network manager (wlan0)', color: '#22c55e', delay: 90 },
  { text: '[ OK ] Starting GPU driver: NVIDIA RTX 4090', color: '#22c55e', delay: 70 },
  { text: '[ OK ] Loading Hyprland compositor', color: '#22c55e', delay: 80 },
  { text: '[ .. ] Connecting to GitHub API...', color: '#f59e0b', delay: 120 },
  { text: '[ OK ] GitHub connected — 42 repos synced', color: '#22c55e', delay: 90 },
  { text: '[ OK ] Reached target: Graphical Interface', color: '#22c55e', delay: 100 },
  { text: '', color: '', delay: 60 },
  { text: 'Welcome to Portfolio OS (Arch Linux x86_64 / Hyprland)', color: '#e2e8f0', delay: 80 },
  { text: 'Type \'help\' to see available commands', color: '#8b96a8', delay: 40 },
];

const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [shown, setShown] = useState<typeof BOOT_LINES>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= BOOT_LINES.length) { onComplete(); return; }
    const t = setTimeout(() => {
      setShown(p => [...p, BOOT_LINES[idx]]);
      setIdx(i => i + 1);
    }, BOOT_LINES[idx].delay);
    return () => clearTimeout(t);
  }, [idx]);

  return (
    <div style={{ background: '#000', padding: '18px 20px', height: '100%', overflow: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
      {shown.map((l, i) => (
        <div key={i} style={{ color: l.color, lineHeight: 1.8, minHeight: l.text ? undefined : '1em' }}>
          {l.text}
          {i === shown.length - 1 && idx < BOOT_LINES.length && <span className="boot-cursor">▋</span>}
        </div>
      ))}
    </div>
  );
};

const TerminalContent = () => {
  const [phase, setPhase] = useState<'matrix' | 'boot' | 'interactive'>('matrix');
  const [lines, setLines] = useState<{ type: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new lines
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  // Auto-type demo commands after boot
  useEffect(() => {
    if (phase !== 'interactive') return;
    const DEMO = [
      { cmd: 'neofetch', delay: 800 },
    ];
    let t: ReturnType<typeof setTimeout>;
    DEMO.forEach(({ cmd, delay }) => {
      t = setTimeout(() => {
        setLines(prev => [
          ...prev,
          { type: 'prompt', text: `visitor@portfolio:~$ ${cmd}` },
          { type: 'output', text: '    /\\' },
          { type: 'output', text: '   /  \\          OS: Arch Linux x86_64' },
          { type: 'output', text: '  / /\\ \\         WM: Hyprland' },
          { type: 'output', text: ' / ____ \\        Shell: zsh 5.9' },
          { type: 'output', text: '/_/    \\_\\       Editor: Neovim' },
          { type: 'output', text: '' },
        ]);
      }, delay);
    });
    return () => clearTimeout(t);
  }, [phase]);

  const COMMANDS: Record<string, string[]> = {
    whoami:          ['visitor — welcome to my portfolio terminal 👋'],
    'ls projects/':  ['project-alpha/   project-beta/   portfolio-os/   open-source/'],
    'cat skills.txt':['Languages:   TypeScript · Python · Rust · Go',
                      'Frontend:    React · Next.js · Framer Motion · GSAP',
                      'Backend:     Node.js · FastAPI · PostgreSQL · Redis',
                      'DevOps:      Docker · K8s · GitHub Actions · Nix'],
    'cat about.txt': ['Name:        Dev Portfolio',
                      'Location:    Earth 🌍',
                      'Passion:     Building beautiful, fast, open-source software.',
                      'Status:      Open to work & collaborations ✅'],
    'git log --oneline': [
      '\x1b[33ma3f9c12\x1b[0m feat: cinematic hero reveal with GSAP',
      '\x1b[33mb2d8e01\x1b[0m feat: 7 themes + context menu + snap zones',
      '\x1b[33mc1e7d90\x1b[0m fix: sidebar overflow + hacker terminal',
      '\x1b[33md0f6c89\x1b[0m feat: window resize all 8 directions',
    ],
    'uname -a':       ['Linux portfolio 6.9.1-arch1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux'],
    clear: [],
    help: ['Available commands:',
           '  whoami              — Who you are',
           '  ls projects/        — List projects',
           '  cat skills.txt      — View skills',
           '  cat about.txt       — About me',
           '  git log --oneline   — Commit history',
           '  uname -a            — System info',
           '  clear               — Clear terminal'],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    if (cmd === 'clear') { setLines([]); setInput(''); return; }
    const output = COMMANDS[cmd];
    setLines(prev => [
      ...prev,
      { type: 'prompt', text: `visitor@portfolio:~$ ${cmd}` },
      ...(output
        ? output.map(t => ({ type: 'output', text: t }))
        : [{ type: 'error', text: `bash: ${cmd}: command not found. Try 'help'` }]),
    ]);
    setInput('');
  };

  if (phase === 'matrix') return <MatrixRain onComplete={() => setPhase('boot')} />;
  if (phase === 'boot')   return <BootSequence onComplete={() => setPhase('interactive')} />;

  return (
    <div className="terminal-body hacker" style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <MatrixRain isBackground />
      <div className="terminal-scanlines" />
      <div className="terminal-scroll-container">
        <div className="terminal-lines">
          {lines.map((l, i) => (
            <p key={i} className={`terminal-line ${l.type}`}>{l.text}</p>
          ))}
          <div ref={bottomRef} />
        </div>
        <form className="terminal-input-row" onSubmit={handleSubmit}>
          <span className="prompt">visitor@portfolio:~$</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            placeholder="type 'help' for commands"
          />
          <span className="terminal-cursor-blink">▋</span>
        </form>
      </div>
    </div>
  );
};

const AboutContent = () => (
  <div className="content-padding about-content">
    <div className="about-hero">
      <div className="about-avatar glass">
        <User size={44} />
      </div>
      <h1 className="about-name">Sharvil</h1>
      <p className="subtitle">Full-Stack Engineer · Linux Enthusiast · Open Source Contributor</p>
      <div className="about-social">
        <a href="#" className="social-btn glass"><Code2 size={16} /> GitHub</a>
        <a href="#" className="social-btn glass"><Users size={16} /> LinkedIn</a>
        <a href="#" className="social-btn glass"><Mail size={16} /> Email</a>
        <a href="#" className="social-btn glass"><Globe size={16} /> Website</a>
      </div>
    </div>
    <div className="about-sections">
      <div className="about-section glass">
        <h3>Profile</h3>
        <p>Passionate developer building immersive web experiences through careful design and robust engineering. I love Linux, open-source software, and creative coding.</p>
      </div>
      <div className="about-section glass">
        <h3>Skills</h3>
        <div className="skills-grid">
          {[
            { label: 'TypeScript', pct: 92 },
            { label: 'React / Next.js', pct: 90 },
            { label: 'Python', pct: 85 },
            { label: 'Node.js', pct: 82 },
            { label: 'Docker / K8s', pct: 75 },
            { label: 'Rust', pct: 60 },
          ].map(skill => (
            <div key={skill.label} className="skill-item">
              <div className="skill-label">
                <span>{skill.label}</span>
                <span className="skill-pct">{skill.pct}%</span>
              </div>
              <div className="skill-bar">
                <motion.div
                  className="skill-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ProjectsContent = () => (
  <div className="content-padding">
    <div className="projects-header">
      <h3>Featured Projects</h3>
      <a href="#" className="view-all-btn"><Code2 size={14} /> View All on GitHub</a>
    </div>
    <div className="projects-grid">
      {[
        {
          icon: <Layers size={22} />,
          name: 'Portfolio OS',
          desc: 'A Linux desktop-inspired interactive developer portfolio built with React, Framer Motion & GSAP.',
          tags: ['React', 'TypeScript', 'GSAP', 'Framer'],
          stars: 128,
          link: '#',
        },
        {
          icon: <Server size={22} />,
          name: 'API Gateway',
          desc: 'High-performance REST API gateway with rate limiting, auth, and analytics built in Rust.',
          tags: ['Rust', 'PostgreSQL', 'Redis'],
          stars: 84,
          link: '#',
        },
        {
          icon: <Database size={22} />,
          name: 'DataViz Dashboard',
          desc: 'Real-time data visualization dashboard with live chart streaming and custom D3.js components.',
          tags: ['Next.js', 'D3.js', 'WebSockets'],
          stars: 67,
          link: '#',
        },
        {
          icon: <Code size={22} />,
          name: 'dotfiles',
          desc: 'My curated Arch Linux + Hyprland configuration. Earthy tones, minimal, fast.',
          tags: ['Lua', 'Bash', 'Nix', 'Hyprland'],
          stars: 203,
          link: '#',
        },
      ].map(proj => (
        <div key={proj.name} className="project-card-parent">
          <div className="project-card-inner">
            <div className="logo">
              <span className="circle circle1" />
              <span className="circle circle2" />
              <span className="circle circle3" />
              <span className="circle circle4" />
              <span className="circle circle5">
                {proj.icon}
              </span>
            </div>
            <div className="glass" />
            <div className="content">
               <span className="title">{proj.name}</span>
               <span className="text">{proj.desc}</span>
               <div className="p-tags" style={{ marginTop: '15px' }}>
                 {proj.tags.map(t => (
                   <span key={t} className="p-tag">{t}</span>
                 ))}
               </div>
            </div>
            <div className="bottom">
              <div className="social-buttons-container">
                <div className="social-button" title="GitHub Stars" style={{ pointerEvents: 'auto' }}>
                  <Star size={11} fill="currentColor" style={{ marginRight: '3px' }} />
                  <span style={{ fontSize: '10px', fontWeight: 800 }}>{proj.stars}</span>
                </div>
              </div>
              <a href={proj.link} target="_blank" rel="noopener noreferrer" className="view-more" onClick={e => e.stopPropagation()}>
                <button className="view-more-button">View code</button>
                <svg className="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const GithubContent = () => (
  <div className="content-padding github-content">
    <div className="gh-profile">
      <div className="gh-avatar glass"><Code2 size={40} /></div>
      <div className="gh-info">
        <h2>@yourusername</h2>
        <p>Building in public · Open source enthusiast</p>
        <div className="gh-stats">
          <div className="gh-stat"><span className="gh-num">42</span><span className="gh-lbl">repos</span></div>
          <div className="gh-stat"><span className="gh-num">1.2k</span><span className="gh-lbl">followers</span></div>
          <div className="gh-stat"><span className="gh-num">128</span><span className="gh-lbl">stars</span></div>
        </div>
      </div>
    </div>
    <div className="gh-activity">
      <h3 className="gh-section-title"><GitBranch size={16} /> Recent Activity</h3>
      <div className="activity-grid">
        {Array.from({length: 52}).map((_, week) => (
          <div key={week} className="activity-col">
            {Array.from({length: 7}).map((_, day) => {
              const level = Math.floor(Math.random() * 5);
              return <div key={day} className={`activity-cell level-${level}`} />;
            })}
          </div>
        ))}
      </div>
      <div className="activity-legend">
        <span>Less</span>
        {[0,1,2,3,4].map(l => <div key={l} className={`activity-cell level-${l}`} />)}
        <span>More</span>
      </div>
    </div>
    <div className="gh-repos">
      <h3 className="gh-section-title">Pinned Repositories</h3>
      {['portfolio-os', 'dotfiles', 'api-gateway'].map(repo => (
        <div key={repo} className="gh-repo glass">
          <div className="gh-repo-name"><Code2 size={14} /> {repo}</div>
          <div className="gh-repo-meta">
            <span className="gh-lang">TypeScript</span>
            <span><Star size={12} /> {Math.floor(Math.random() * 200 + 50)}</span>
            <span><GitBranch size={12} /> {Math.floor(Math.random() * 20 + 5)}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Theme Panel ─────────────────────────────────────────────────────────────
const ThemePanel: React.FC<{ currentTheme: Theme; onSelect: (t: Theme) => void; onClose: () => void }> = ({ currentTheme, onSelect, onClose }) => (
  <motion.div
    className="theme-panel glass"
    drag dragMomentum={false} dragElastic={0}
    whileDrag={{ scale: 1.01 }}
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -20, opacity: 0 }}
    transition={{ type: 'spring', damping: 22 }}
    onClick={e => e.stopPropagation()}
  >
    <div className="theme-panel-header">
      <Palette size={16} />
      <span>Themes</span>
      <button className="p-close-btn" onClick={onClose}><X size={14} /></button>
    </div>
    <div className="theme-grid">
      {THEMES.map(t => (
        <motion.button
          key={t.id}
          className={`theme-card ${currentTheme.id === t.id ? 'active' : ''}`}
          onClick={() => onSelect(t)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="theme-swatches">
            {t.previewColors.map((c, i) => (
              <div key={i} className="theme-swatch" style={{ background: c }} />
            ))}
          </div>
          <div className="theme-card-name">
            <span>{t.emoji}</span>
            <span>{t.name}</span>
          </div>
          {currentTheme.id === t.id && (
            <div className="theme-check"><Check size={12} /></div>
          )}
        </motion.button>
      ))}
    </div>
  </motion.div>
);

// ─── Desktop Context Menu ─────────────────────────────────────────────────────
const ContextMenuPanel: React.FC<{
  x: number; y: number; onClose: () => void;
  openWindow: (t: string, i: React.ReactNode, c: React.ReactNode) => void;
  setShowWallpapers: (v: boolean) => void;
  setShowThemes: (v: boolean) => void;
  setShowShortcuts: (v: boolean) => void;
  setShowLaunchpad: (v: boolean) => void;
  closeAllPopups: () => void;
}> = ({ x, y, onClose, openWindow, setShowWallpapers, setShowThemes, setShowShortcuts, setShowLaunchpad, closeAllPopups }) => {
  // Prevent menu from going off-screen
  const safeX = Math.min(x, globalThis.innerWidth  - 210);
  const safeY = Math.min(y, globalThis.innerHeight - 260);

  const items = [
    { icon: <Rocket size={14} />,        label: 'Open Launchpad',     action: () => { onClose(); closeAllPopups(); setShowLaunchpad(true); } },
    { icon: <Terminal size={14} />,      label: 'New Terminal',       action: () => { onClose(); openWindow('Terminal', <Terminal size={16} />, <TerminalContent />); } },
    { icon: <User size={14} />,          label: 'About Me',           action: () => { onClose(); openWindow('About Me', <User size={16} />, <AboutContent />); } },
    { icon: <Code size={14} />,          label: 'Projects',           action: () => { onClose(); openWindow('Projects', <Code size={16} />, <ProjectsContent />); } },
    null, // divider
    { icon: <ImageIcon size={14} />,     label: 'Change Wallpaper',   action: () => { onClose(); closeAllPopups(); setShowWallpapers(true); } },
    { icon: <Palette size={14} />,       label: 'Change Theme',       action: () => { onClose(); closeAllPopups(); setShowThemes(true); } },
    null, // divider
    { icon: <Keyboard size={14} />,      label: 'Keyboard Shortcuts', action: () => { onClose(); setShowShortcuts(true); } },
    { icon: <MousePointer2 size={14} />, label: 'System Info',        action: () => { onClose(); openWindow('About Me', <User size={16} />, <AboutContent />); } },
  ];

  return (
    <motion.div
      className="context-menu glass"
      style={{ left: safeX, top: safeY }}
      initial={{ scale: 0.88, opacity: 0, y: -6 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.88, opacity: 0, y: -6 }}
      transition={{ type: 'spring', damping: 22, stiffness: 340 }}
      onClick={e => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item === null
          ? <div key={`div-${i}`} className="ctx-divider" />
          : (
            <motion.button
              key={item.label}
              className="ctx-item"
              onClick={item.action}
              whileHover={{ x: 3 }}
            >
              <span className="ctx-icon">{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          )
      )}
    </motion.div>
  );
};

// ─── Keyboard Shortcuts Overlay ───────────────────────────────────────────────
const ShortcutsOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const SHORTCUTS = [
    { keys: ['?'],              desc: 'Toggle shortcuts overlay' },
    { keys: ['Alt', 'L'],       desc: 'Toggle fullscreen Launchpad' },
    { keys: ['Esc'],            desc: 'Close overlay / context menu / Launchpad' },
    { keys: ['Right-click'],    desc: 'Desktop context menu' },
    { keys: ['Drag to edge'],   desc: 'Snap window left / right half' },
    { keys: ['Drag to top'],    desc: 'Maximize window' },
    { keys: ['Double-click titlebar'], desc: 'Toggle maximize / restore' },
    { keys: ['Drag panel'],     desc: 'Move any floating panel' },
    { keys: ['Alt', 'F4'],      desc: 'Close focused window (click ×)' },
    { keys: ['Ctrl', 'Shift', 'R'], desc: 'Hard-refresh browser cache' },
  ];

  return (
    <motion.div
      className="shortcuts-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="shortcuts-panel glass"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 22 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="shortcuts-header">
          <Keyboard size={18} />
          <h2>Keyboard & Mouse Shortcuts</h2>
          <button className="p-close-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="shortcuts-list">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="shortcut-row">
              <div className="shortcut-keys">
                {s.keys.map(k => <kbd key={k}>{k}</kbd>)}
              </div>
              <span className="shortcut-desc">{s.desc}</span>
            </div>
          ))}
        </div>
        <p className="shortcuts-tip">Press <kbd>?</kbd> anytime to toggle this overlay</p>
      </motion.div>
    </motion.div>
  );
};

export default App;
