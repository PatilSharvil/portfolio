import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  User, 
  Code, 
  Code2, 
  Image as ImageIcon, 
  Palette, 
  Disc, 
  Search, 
  X,
  Keyboard,
  Settings,
  Gamepad2
} from 'lucide-react';

interface LaunchpadItem {
  id: string;
  label: string;
  category: 'Applications' | 'Games';
  icon: React.ReactNode;
  color: string;
}

interface LaunchpadProps {
  onClose: () => void;
  onLaunch: (appId: string) => void;
}

export const LAUNCHPAD_ITEMS: LaunchpadItem[] = [
  { id: 'terminal', label: 'Terminal', category: 'Applications', icon: <Terminal size={32} />, color: '#39ff14' },
  { id: 'about', label: 'About Me', category: 'Applications', icon: <User size={32} />, color: '#3b82f6' },
  { id: 'projects', label: 'Projects', category: 'Applications', icon: <Code size={32} />, color: '#f97316' },
  { id: 'github', label: 'GitHub', category: 'Applications', icon: <Code2 size={32} />, color: '#a855f7' },
  { id: 'wallpaper', label: 'Wallpaper', category: 'Applications', icon: <ImageIcon size={32} />, color: '#ec4899' },
  { id: 'themes', label: 'Themes', category: 'Applications', icon: <Palette size={32} />, color: '#eab308' },
  { id: 'media', label: 'Media Player', category: 'Applications', icon: <Disc size={32} />, color: '#10b981' },
  { id: 'shortcuts', label: 'Shortcuts', category: 'Applications', icon: <Keyboard size={32} />, color: '#6366f1' },
  { id: 'settings', label: 'Quick Settings', category: 'Applications', icon: <Settings size={32} />, color: '#64748b' },
  { id: 'snake', label: 'Snake Game', category: 'Games', icon: <Gamepad2 size={32} />, color: '#22c55e' },
];

const Launchpad: React.FC<LaunchpadProps> = ({ onClose, onLaunch }) => {
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Esc key closes Launchpad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const filteredItems = LAUNCHPAD_ITEMS.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const apps = filteredItems.filter(item => item.category === 'Applications');
  const games = filteredItems.filter(item => item.category === 'Games');

  return (
    <motion.div 
      className="launchpad-overlay"
      initial={{ opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onClick={onClose}
    >
      <div className="launchpad-container" onClick={e => e.stopPropagation()}>
        {/* Top Control Bar */}
        <div className="launchpad-header">
          <div className="launchpad-search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search Apps & Games..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="launchpad-search-input"
            />
            {query && (
              <button className="clear-btn" onClick={() => setQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
          <button className="launchpad-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Launchpad Grid List */}
        <div className="launchpad-scroll-area">
          {apps.length > 0 && (
            <div className="launchpad-section">
              <h2 className="launchpad-section-title">Applications</h2>
              <div className="launchpad-grid">
                {apps.map(item => (
                  <motion.button 
                    key={item.id}
                    className="launchpad-item-btn"
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onLaunch(item.id);
                    }}
                  >
                    <div 
                      className="launchpad-icon-wrap" 
                      style={{ 
                        backgroundColor: `${item.color}18`, 
                        borderColor: `${item.color}40`,
                        boxShadow: `0 8px 24px -6px ${item.color}25`
                      }}
                    >
                      <div className="launchpad-icon-color" style={{ color: item.color }}>
                        {item.icon}
                      </div>
                    </div>
                    <span className="launchpad-item-label">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {games.length > 0 && (
            <div className="launchpad-section">
              <h2 className="launchpad-section-title">Games</h2>
              <div className="launchpad-grid">
                {games.map(item => (
                  <motion.button 
                    key={item.id}
                    className="launchpad-item-btn"
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onLaunch(item.id);
                    }}
                  >
                    <div 
                      className="launchpad-icon-wrap" 
                      style={{ 
                        backgroundColor: `${item.color}18`, 
                        borderColor: `${item.color}40`,
                        boxShadow: `0 8px 24px -6px ${item.color}25`
                      }}
                    >
                      <div className="launchpad-icon-color" style={{ color: item.color }}>
                        {item.icon}
                      </div>
                    </div>
                    <span className="launchpad-item-label">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="launchpad-empty-state">
              <p>No applications or games found matching "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Launchpad;
