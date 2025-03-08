import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaHeart, FaSearch, FaList } from 'react-icons/fa';
import { MdQueueMusic } from 'react-icons/md';
import './sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active-link' : '';
  };

  return (
    <nav className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <MdQueueMusic size={28} className="gold-accent" />
        {isExpanded && <h1 className="sidebar-title">Rhythmic Tunes</h1>}
      </div>

      <button className="toggle-btn" onClick={toggleSidebar}>
        <span className="toggle-icon">{isExpanded ? '◀' : '▶'}</span>
      </button>

      <div className="sidebar-divider"></div>

      <ul className="sidebar-menu">
        <li className={isActive('/songs')}>
          <Link to="/songs">
            <FaHome />
            {isExpanded && <span>Songs</span>}
          </Link>
        </li>
        
        <li className={isActive('/search')}>
          <Link to="/search">
            <FaSearch />
            {isExpanded && <span>Search</span>}
          </Link>
        </li>

        <div className="sidebar-divider"></div>
        {isExpanded && <p className="sidebar-category">Your Music</p>}
        
        <li className={isActive('/favorities')}>
          <Link to="/favorities">
            <FaHeart />
            {isExpanded && <span>Favorites</span>}
          </Link>
        </li>
        
        <li className={isActive('/playlist')}>
          <Link to="/playlist">
            <FaList />
            {isExpanded && <span>Playlist</span>}
          </Link>
        </li>
      </ul>

      {isExpanded && (
        <div className="sidebar-footer">
          <div className="now-playing-indicator">
            <div className="equalizer">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Enjoy the Music</p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;