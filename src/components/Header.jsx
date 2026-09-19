import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/diary', label: '我的日记', icon: '📝' },
  { path: '/projects', label: '探索工坊', icon: '🔬' },
  { path: '/growth', label: '成长足迹', icon: '🌱' },
  { path: '/rocket', label: '火箭发射', icon: '🚀' },
  { path: '/pet', label: '小兔乐园', icon: '🐰' },
  { path: '/guestbook', label: '留言板', icon: '💌' },
  { path: '/about', label: '关于我', icon: '🧸' },
];

export default function Header() {
  const [openLocation, setOpenLocation] = useState(null);
  const location = useLocation();
  const menuOpen = openLocation === location.key;

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-flower">🌸</span>
          <span className="logo-text">不不的成长花园</span>
        </Link>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpenLocation(null)}
              className={`nav-link ${(location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`))) ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <button
          className="menu-toggle"
          onClick={() => setOpenLocation(menuOpen ? null : location.key)}
          aria-label="打开菜单"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>
    </header>
  );
}
