import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { FaPlayCircle, FaPauseCircle, FaTrash, FaMusic, FaStop, FaVolumeMute } from 'react-icons/fa';
import './Playlist.css'; // We'll create this file

function Playlist() {
  const [playlist, setPlaylist] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [activeTrack, setActiveTrack] = useState(null);

  useEffect(() => {
    fetchPlaylist();

    return () => {
      // Clean up any playing audio on unmount
      if (currentlyPlaying) {
        currentlyPlaying.pause();
      }
    };
  }, []);

  const fetchPlaylist = () => {
    axios
      .get(`http://localhost:3000/playlist`)
      .then((response) => {
        const playlistData = response.data;
        setPlaylist(playlistData);
      })
      .catch((error) => {
        console.error('Error fetching playlist items: ', error);
        setError('Failed to load playlist. Please try again later.');
      });
  };

  useEffect(() => {
    // Handle audio play events
    const audioElements = document.querySelectorAll('audio[id^="audio-"]');
    
    const handlePlay = (event) => {
      if (currentlyPlaying && currentlyPlaying !== event.target) {
        currentlyPlaying.pause();
      }
      setCurrentlyPlaying(event.target);
      setIsPlaying(true);
      
      // Find the corresponding track
      const trackId = event.target.id.split('-')[1];
      const track = playlist.find(item => item.id == trackId);
      if (track) {
        setActiveTrack(track);
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setActiveTrack(null);
    };

    audioElements.forEach(audio => {
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
    });

    return () => {
      audioElements.forEach(audio => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      });
    };
  }, [playlist, currentlyPlaying]);

  const removeFromPlaylist = async (itemId) => {
    try {
      const selectedItem = playlist.find((item) => item.itemId === itemId);
      
      if (!selectedItem) {
        throw new Error('Selected item not found in playlist');
      }
      
      // If we're removing the currently playing song, pause it first
      const audioElement = document.getElementById(`audio-${selectedItem.id}`);
      if (audioElement && currentlyPlaying === audioElement) {
        audioElement.pause();
        setCurrentlyPlaying(null);
        setIsPlaying(false);
      }
      
      await axios.delete(`http://localhost:3000/playlist/${selectedItem.id}`);
      fetchPlaylist();
    } catch (error) {
      console.error('Error removing item from playlist: ', error);
      setError('Failed to remove item from playlist.');
    }
  };

  const playAllSongs = () => {
    if (playlist.length === 0) return;
    
    // If already playing, pause all
    if (isPlaying && currentlyPlaying) {
      currentlyPlaying.pause();
      setIsPlaying(false);
      return;
    }
    
    // Start playing from the first song
    const firstAudio = document.getElementById(`audio-${playlist[0].id}`);
    
    if (firstAudio) {
      // Setup chain of play events
      setupAudioChain();
      
      // Play the first song
      firstAudio.play().catch(err => {
        console.error('Failed to play audio:', err);
        setError('Failed to play audio. Please check file paths.');
      });
    }
  };
  
  const setupAudioChain = () => {
    // Remove existing ended events first to avoid duplicates
    playlist.forEach((item) => {
      const audio = document.getElementById(`audio-${item.id}`);
      if (audio) {
        const clonedAudio = audio.cloneNode(true);
        audio.parentNode.replaceChild(clonedAudio, audio);
      }
    });
    
    // Add new ended events to chain playback
    playlist.forEach((item, index) => {
      const audio = document.getElementById(`audio-${item.id}`);
      if (audio) {
        audio.addEventListener('ended', () => {
          const nextIndex = (index + 1) % playlist.length;
          const nextAudio = document.getElementById(`audio-${playlist[nextIndex].id}`);
          if (nextAudio) nextAudio.play().catch(e => console.error(e));
        });
      }
    });
  };

  return (
    <Container fluid className="py-4 px-3 px-md-5 bg-light min-vh-100">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <Card className="shadow-sm border-0 rounded-3 overflow-hidden">
            <Card.Header className="bg-white py-3 border-bottom">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <h2 className="mb-0 fw-bold text-primary">My Playlist</h2>
                <div className="d-flex align-items-center mt-3 mt-md-0">
                  <Badge bg="secondary" className="me-3 py-2 px-3">
                    {playlist.length} {playlist.length === 1 ? 'track' : 'tracks'}
                  </Badge>
                  <Button
                    variant={isPlaying ? "outline-danger" : "primary"}
                    className="d-flex align-items-center"
                    onClick={playAllSongs}
                    disabled={playlist.length === 0}
                  >
                    {isPlaying ? <FaPauseCircle className="me-2" /> : <FaPlayCircle className="me-2" />}
                    {isPlaying ? 'Pause All' : 'Play All'}
                  </Button>
                </div>
              </div>
            </Card.Header>
            
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3" width="5%">#</th>
                      <th className="px-4 py-3" width="40%">Track</th>
                      <th className="px-4 py-3" width="15%">Genre</th>
                      <th className="px-4 py-3" width="25%">Player</th>
                      <th className="px-4 py-3" width="15%">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playlist.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-4 align-middle">{index + 1}</td>
                        <td className="px-4">
                          <div className="d-flex align-items-center py-2">
                            <img
                              src={item.imgUrl}
                              alt={item.title}
                              className="rounded me-3 shadow-sm"
                              style={{ height: '60px', width: '60px', objectFit: 'cover' }}
                            />
                            <div>
                              <h6 className="mb-1 fw-bold">{item.title}</h6>
                              <p className="mb-0 text-muted small">{item.singer}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 align-middle">
                          <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill">
                            {item.genre}
                          </Badge>
                        </td>
                        <td className="px-4 align-middle">
                          <audio 
                            controls 
                            id={`audio-${item.id}`} 
                            className="w-100" 
                            style={{ maxWidth: '250px', height: '40px' }}
                            preload="metadata"
                          >
                            <source src={item.songUrl} type="audio/mpeg" />
                            Your browser does not support audio playback.
                          </audio>
                        </td>
                        <td className="px-4 align-middle text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-pill px-3"
                            onClick={() => removeFromPlaylist(item.itemId)}
                          >
                            <FaTrash className="me-2" /> Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                    
                    {playlist.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-5">
                          <div className="py-4">
                            <FaMusic size={50} className="text-muted mb-3 opacity-50" />
                            <h5 className="fw-bold text-muted">Your playlist is empty</h5>
                            <p className="text-muted mb-0">Add your favorite tracks to get started!</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Playlist;