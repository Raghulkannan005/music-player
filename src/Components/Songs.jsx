import { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, InputGroup, Button, Toast } from 'react-bootstrap';
import { IoSearchOutline, IoMusicalNotesOutline } from 'react-icons/io5';
import { FaPlay, FaStop, FaPlus, FaHeart, FaPause } from 'react-icons/fa';
import './Songs.css';

const Songs = ({ onPlaySong, currentSong, isPlaying }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeSong, setActiveSong] = useState(null);
  const [localAudio, setLocalAudio] = useState(null);
  
  // Fetch songs from db.json
  useEffect(() => {
    axios.get('http://localhost:3000/items')
      .then(response => {
        setSongs(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching songs:', error);
        setLoading(false);
      });
  }, []);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (localAudio) {
        localAudio.pause();
        localAudio.currentTime = 0;
      }
    };
  }, [localAudio]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const playSong = (song) => {
    // Stop any currently playing audio
    if (localAudio) {
      localAudio.pause();
    }
    
    // Create a new audio element and play
    const audio = new Audio(song.songUrl);
    setLocalAudio(audio);
    setActiveSong(song);
    
    // Add event listeners
    audio.addEventListener('ended', () => {
      setActiveSong(null);
    });
    
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
      showToastNotification('Unable to play audio. Please check the file path.');
    });
    
    // Update parent component if using global playback
    if (onPlaySong) {
      onPlaySong(song, audio);
    }
  };
  
  const pauseSong = () => {
    if (localAudio) {
      localAudio.pause();
      setActiveSong(null);
    }
  };

  const stopSong = () => {
    if (localAudio) {
      localAudio.pause();
      localAudio.currentTime = 0;
      setActiveSong(null);
    }
  };

  const addToPlaylist = async (song) => {
    try {
      // Check if song is already in playlist
      const playlistResponse = await axios.get('http://localhost:3000/playlist');
      const existingItem = playlistResponse.data.find(item => item.itemId === song.id);
      
      if (existingItem) {
        showToastNotification('This song is already in your playlist');
        return;
      }
      
      // Add to playlist
      const playlistItem = {
        itemId: song.id,
        title: song.title,
        imgUrl: song.imgUrl,
        genre: song.genre,
        songUrl: song.songUrl,
        singer: song.singer
      };
      
      await axios.post('http://localhost:3000/playlist', playlistItem);
      showToastNotification('Added to playlist successfully');
    } catch (error) {
      console.error('Error adding to playlist:', error);
      showToastNotification('Failed to add to playlist');
    }
  };

  const addToFavorites = async (song) => {
    try {
      // Check if song is already in favorites
      const favoritesResponse = await axios.get('http://localhost:3000/favorities');
      const existingItem = favoritesResponse.data.find(item => item.itemId === song.id);
      
      if (existingItem) {
        showToastNotification('This song is already in your favorites');
        return;
      }
      
      // Add to favorites
      const favoriteItem = {
        itemId: song.id,
        title: song.title,
        imgUrl: song.imgUrl,
        genre: song.genre,
        songUrl: song.songUrl,
        singer: song.singer
      };
      
      await axios.post('http://localhost:3000/favorities', favoriteItem);
      showToastNotification('Added to favorites successfully');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      showToastNotification('Failed to add to favorites');
    }
  };

  const showToastNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const filteredSongs = songs.filter((song) => {
    const matchesSearch = song.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         song.singer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || song.genre?.toLowerCase() === category.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="songs-page-container">
      <div className="tamil-decoration"></div>
      <header className="songs-header">
        <h1 className="page-title">Rhythmic Tunes</h1>
        <div className="search-filter-container">
          <div className="search-bar">
            <InputGroup>
              <InputGroup.Text className="search-icon">
                <IoSearchOutline />
              </InputGroup.Text>
              <Form.Control
                className="search-input"
                placeholder="Search for songs or artists..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>
          </div>
          
          <Form.Select 
            className="category-filter" 
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="all">All Categories</option>
            <option value="romantic">Romantic</option>
            <option value="emotional">Emotional</option>
          </Form.Select>
        </div>
      </header>

      {activeSong && (
        <div className="now-playing-indicator">
          <div className="now-playing-info">
            <img src={activeSong.imgUrl} alt={activeSong.title} className="mini-album-art" />
            <div>
              <p className="now-playing-text">Now Playing:</p>
              <h4 className="now-playing-title">{activeSong.title}</h4>
              <p className="now-playing-artist">{activeSong.singer}</p>
            </div>
          </div>
          <div className="now-playing-controls">
            <Button variant="danger" className="control-button stop-button" onClick={stopSong}>
              <FaStop />
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="songs-grid">
          {filteredSongs.map((song) => (
            <div 
              className={`song-card ${activeSong && activeSong.id === song.id ? 'active-song' : ''}`} 
              key={song.id}
            >
              <div className="song-image-container">
                <img src={song.imgUrl} alt={song.title} className="song-image" />
                <div className="song-overlay">
                  {activeSong && activeSong.id === song.id ? (
                    <button onClick={stopSong} className="play-overlay-btn stop">
                      <FaStop size={24} />
                    </button>
                  ) : (
                    <button onClick={() => playSong(song)} className="play-overlay-btn">
                      <FaPlay size={24} />
                    </button>
                  )}
                </div>
              </div>
              <div className="song-info">
                <h3 className="song-title">{song.title}</h3>
                <p className="song-artist">{song.singer}</p>
                <p className="song-genre">
                  <IoMusicalNotesOutline /> {song.genre}
                </p>
                <div className="song-actions">
                  <div className="action-buttons">
                    {activeSong && activeSong.id === song.id ? (
                      <>
                        <Button 
                          className="action-btn control-btn" 
                          variant="danger"
                          onClick={pauseSong}
                        >
                          <FaPause /> Pause
                        </Button>
                        <Button 
                          className="action-btn control-btn"
                          variant="dark" 
                          onClick={stopSong}
                        >
                          <FaStop /> Stop
                        </Button>
                      </>
                    ) : (
                      <Button 
                        className="action-btn" 
                        onClick={() => addToPlaylist(song)}
                      >
                        <FaPlus /> Add to Playlist
                      </Button>
                    )}
                    <Button 
                      className="action-btn favorite-btn" 
                      onClick={() => addToFavorites(song)}
                    >
                      <FaHeart />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          minWidth: '250px',
          zIndex: 9999
        }}
        bg="dark"
        delay={3000}
        autohide
      >
        <Toast.Header closeButton={true}>
          <strong className="me-auto">Notification</strong>
        </Toast.Header>
        <Toast.Body className="text-white">{toastMessage}</Toast.Body>
      </Toast>
    </div>
  );
};

export default Songs;