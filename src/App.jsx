import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Songs from './Components/Songs';
import Sidebar from './Components/Sidebar';
import Favorities from './Components/Favorities';
import Playlist from './Components/Playlist';
import Search from './Components/Search';
import MobileNav from './Components/MobileNav';
import NowPlayingBar from './Components/NowPlayingBar';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  // Handle audio playback globally across components
  const handlePlaySong = (song, audio) => {
    if (audioElement && audioElement !== audio) {
      audioElement.pause();
    }
    setCurrentSong(song);
    setAudioElement(audio);
    setIsPlaying(true);
  };

  const handlePauseSong = () => {
    setIsPlaying(false);
    if (audioElement) {
      audioElement.pause();
    }
  };

  const handleStopSong = () => {
    setIsPlaying(false);
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-container">
      <BrowserRouter>
        {isMobile ? <MobileNav /> : <Sidebar currentSong={currentSong} isPlaying={isPlaying} />}
        
        <div className={`main-content ${isMobile ? 'mobile-view' : ''}`}>
          <Routes>
            <Route path="/" element={
              <Songs 
                onPlaySong={handlePlaySong} 
                currentSong={currentSong} 
                isPlaying={isPlaying}
              />
            } />
            <Route path="/songs" element={
              <Songs 
                onPlaySong={handlePlaySong} 
                currentSong={currentSong} 
                isPlaying={isPlaying}
              />
            } />
            <Route path="/favorities" element={
              <Favorities 
                onPlaySong={handlePlaySong} 
                currentSong={currentSong} 
                isPlaying={isPlaying}
              />
            } />
            <Route path="/playlist" element={
              <Playlist 
                onPlaySong={handlePlaySong} 
                currentSong={currentSong} 
                isPlaying={isPlaying}
              />
            } />
            <Route path="/search" element={
              <Search 
                onPlaySong={handlePlaySong} 
                currentSong={currentSong} 
                isPlaying={isPlaying}
              />
            } />
          </Routes>
        </div>
        
        {currentSong && (
          <NowPlayingBar 
            song={currentSong} 
            isPlaying={isPlaying}
            onPlay={() => {
              if (audioElement) {
                audioElement.play();
                setIsPlaying(true);
              }
            }}
            onPause={handlePauseSong}
            onStop={handleStopSong}
          />
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;