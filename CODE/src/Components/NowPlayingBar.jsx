import { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import './NowPlayingBar.css';

const NowPlayingBar = ({ song, isPlaying, onPlay, onPause, onStop }) => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  
  useEffect(() => {
    const audio = document.getElementById(`global-audio-player`);
    
    if (audio) {
      const updateProgress = () => {
        const current = audio.currentTime;
        const total = audio.duration || 0;
        setCurrentTime(current);
        setDuration(total);
        setProgress((current / total) * 100 || 0);
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', updateProgress);
      
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', updateProgress);
      };
    }
  }, [song]);
  
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const handleProgressChange = (e) => {
    const audio = document.getElementById(`global-audio-player`);
    const newTime = (e.target.value / 100) * duration;
    if (audio) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(e.target.value);
    }
  };
  
  const handleVolumeChange = (e) => {
    const audio = document.getElementById(`global-audio-player`);
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume / 100;
      setMuted(newVolume === 0);
    }
  };
  
  const toggleMute = () => {
    const audio = document.getElementById(`global-audio-player`);
    if (audio) {
      const newMuted = !muted;
      audio.muted = newMuted;
      setMuted(newMuted);
    }
  };

  return (
    <div className="now-playing-bar">
      <div className="now-playing-left">
        <img 
          src={song.imgUrl} 
          alt={song.title} 
          className="now-playing-cover"
        />
        <div className="now-playing-info">
          <h4>{song.title}</h4>
          <p>{song.singer}</p>
        </div>
      </div>
      
      <div className="now-playing-center">
        <div className="player-controls">
          <button className="control-button stop-button" onClick={onStop}>
            <FaStop />
          </button>
          <button 
            className="control-button main-button"
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
        </div>
        
        <div className="progress-container">
          <span className="time-info">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="progress-bar"
            value={progress}
            onChange={handleProgressChange}
            min="0"
            max="100"
            step="0.1"
          />
          <span className="time-info">{formatTime(duration)}</span>
        </div>
      </div>
      
      <div className="now-playing-right">
        <button className="volume-button" onClick={toggleMute}>
          {muted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <input
          type="range"
          className="volume-slider"
          value={volume}
          onChange={handleVolumeChange}
          min="0"
          max="100"
        />
        <audio id="global-audio-player" src={song.songUrl} />
      </div>
    </div>
  );
};

export default NowPlayingBar;