import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col } from 'react-bootstrap';
import { FaHeart } from 'react-icons/fa';

function Favorities() {
  const [playlist, setPlaylist] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/favorities`)
      .then((response) => {
        const playlistData = response.data;
        setPlaylist(playlistData);
      })
      .catch((error) => {
        console.error('Error fetching favorites: ', error);
      });

    const handleAudioPlay = (itemId, audioElement) => {
      if (currentlyPlaying && currentlyPlaying !== audioElement) {
        currentlyPlaying.pause();
      }
      setCurrentlyPlaying(audioElement);
    };

    playlist.forEach((item) => {
      const audioElement = document.getElementById(`audio-${item.id}`);
      if (audioElement) {
        audioElement.addEventListener('play', () => {
          handleAudioPlay(item.id, audioElement);
        });
      }
    });

    return () => {
      playlist.forEach((item) => {
        const audioElement = document.getElementById(`audio-${item.id}`);
        if (audioElement) {
          audioElement.removeEventListener('play', () => handleAudioPlay(item.id, audioElement));
        }
      });
    };
  }, [playlist, currentlyPlaying]);

  const removeFromFavorites = async (itemId) => {
    try {
      const selectedItem = playlist.find((item) => item.itemId === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found in favorites');
      }
      await axios.delete(`http://localhost:3000/favorities/${selectedItem.id}`);
      const response = await axios.get('http://localhost:3000/favorities');
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error removing item from favorites: ', error);
    }
  };
  
  return (
    <Container fluid className="p-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <h2 className="text-3xl font-semibold mb-4 text-center">Favorites</h2>
          
          <div className="table-responsive">
            <Table hover className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Actions</th>
                  <th>Player</th>
                </tr>
              </thead>
              <tbody>
                {playlist.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={item.imgUrl}
                          alt={item.title}
                          className="rounded me-3"
                          style={{ height: '50px', width: '50px', objectFit: 'cover' }}
                        />
                        <div>
                          <strong>{item.title}</strong>
                          <p className="mb-0 text-muted">{item.singer}</p>
                        </div>
                      </div>
                    </td>
                    <td>{item.genre}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        className="btn-sm"
                        onClick={() => removeFromFavorites(item.itemId)}
                      >
                        <FaHeart /> Remove
                      </Button>
                    </td>
                    <td>
                      <audio controls id={`audio-${item.id}`} className="w-100" style={{ maxWidth: '250px' }}>
                        <source src={item.songUrl} />
                        Your browser does not support the audio element.
                      </audio>
                    </td>
                  </tr>
                ))}
                
                {playlist.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      No favorites added yet. Add songs to your favorites!
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Favorities;