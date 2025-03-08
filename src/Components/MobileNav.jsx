import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaHeart, FaSearch, FaList, FaBars, FaTimes } from 'react-icons/fa';
import { MdQueueMusic } from 'react-icons/md';
import './MobileNav.css';

const MobileNav = () => {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };
  
  const isActive = (path) => {
    return location.pathname === path ? 'active-link' : '';
  };

  return (
    <>
      <div className="mobile-nav-header">
        <div className="mobile-brand">
          <MdQueueMusic size={24} className="gold-accent" />
          <h1>Rhythmic Tunes</h1>
        </div>
        <button className="menu-toggle" onClick={toggleNav}>
          {navOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      
      <div className={`mobile-nav ${navOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          <div className="mobile-nav-user">
            <div className="user-avatar">
              <span>RT</span>
            </div>
            <div className="user-info">
              <h4>Music Lover</h4>
              <p>Premium User</p>
            </div>
          </div>
          
          <ul className="mobile-nav-menu">
            <li className={isActive('/songs')} onClick={toggleNav}>
              <Link to="/songs">
                <FaHome />
                <span>Songs</span>
              </Link>
            </li>
            
            <li className={isActive('/search')} onClick={toggleNav}>
              <Link to="/search">
                <FaSearch />
                <span>Search</span>
              </Link>
            </li>
            
            <li className={isActive('/favorities')} onClick={toggleNav}>
              <Link to="/favorities">
                <FaHeart />
                <span>Favorites</span>
              </Link>
            </li>
            
            <li className={isActive('/playlist')} onClick={toggleNav}>
              <Link to="/playlist">
                <FaList />
                <span>Playlist</span>
              </Link>
            </li>
          </ul>
          
          <div className="mobile-nav-footer">
            <div className="equalizer">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Enjoy the Music</p>
          </div>
        </div>
        
        <div className="mobile-nav-backdrop" onClick={toggleNav}></div>
      </div>
    </>
  );
};

export default MobileNav;