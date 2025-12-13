import React, { useState } from 'react';
import './LibraryPanel.css';

/**
 * LibraryPanel Component
 * A slide-in panel that displays favorite songs with smooth animations
 * and interactive controls for managing the music library.
 */
const LibraryPanel = ({ isOpen, onClose, favoriteSongs = [] }) => {
  const [selectedSong, setSelectedSong] = useState(null);
  const [sortBy, setSortBy] = useState('dateAdded');

  // Sort songs based on selected criteria
  const sortedSongs = React.useMemo(() => {
    const songsCopy = [...favoriteSongs];
    
    switch (sortBy) {
      case 'title':
        return songsCopy.sort((a, b) => 
          (a.title || '').localeCompare(b.title || '')
        );
      case 'artist':
        return songsCopy.sort((a, b) => 
          (a.artist || '').localeCompare(b.artist || '')
        );
      case 'dateAdded':
      default:
        return songsCopy.sort((a, b) => 
          new Date(b.dateAdded) - new Date(a.dateAdded)
        );
    }
  }, [favoriteSongs, sortBy]);

  const handleSongClick = (song) => {
    setSelectedSong(selectedSong?.id === song.id ? null : song);
  };

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div 
          className="library-panel-overlay" 
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Close library panel"
        />
      )}

      {/* Slide-in panel */}
      <div 
        className={`library-panel ${isOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Favorite songs library"
      >
        {/* Header */}
        <div className="library-panel-header">
          <h2 className="library-panel-title">Favorite Songs</h2>
          <button 
            className="library-panel-close-btn"
            onClick={onClose}
            aria-label="Close panel"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Sort controls */}
        {favoriteSongs.length > 0 && (
          <div className="library-panel-controls">
            <label htmlFor="sort-select" className="sort-label">
              Sort by:
            </label>
            <select
              id="sort-select"
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort favorite songs"
            >
              <option value="dateAdded">Date Added (Newest)</option>
              <option value="title">Title (A-Z)</option>
              <option value="artist">Artist (A-Z)</option>
            </select>
          </div>
        )}

        {/* Songs list */}
        <div className="library-panel-content">
          {favoriteSongs.length === 0 ? (
            <div className="library-panel-empty">
              <p>No favorite songs yet</p>
              <p className="empty-subtitle">Add songs to your favorites to see them here</p>
            </div>
          ) : (
            <ul className="songs-list">
              {sortedSongs.map((song) => (
                <li 
                  key={song.id}
                  className={`song-item ${selectedSong?.id === song.id ? 'selected' : ''}`}
                  onClick={() => handleSongClick(song)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSongClick(song);
                    }
                  }}
                >
                  <div className="song-info">
                    <div className="song-title">{song.title || 'Unknown Title'}</div>
                    <div className="song-artist">{song.artist || 'Unknown Artist'}</div>
                  </div>
                  {song.duration && (
                    <div className="song-duration">
                      {formatDuration(song.duration)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Song details (when a song is selected) */}
        {selectedSong && (
          <div className="library-panel-details">
            <div className="details-header">
              <h3>Song Details</h3>
            </div>
            <div className="details-content">
              <div className="detail-item">
                <span className="detail-label">Title:</span>
                <span className="detail-value">{selectedSong.title}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Artist:</span>
                <span className="detail-value">{selectedSong.artist}</span>
              </div>
              {selectedSong.album && (
                <div className="detail-item">
                  <span className="detail-label">Album:</span>
                  <span className="detail-value">{selectedSong.album}</span>
                </div>
              )}
              {selectedSong.duration && (
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{formatDuration(selectedSong.duration)}</span>
                </div>
              )}
              {selectedSong.dateAdded && (
                <div className="detail-item">
                  <span className="detail-label">Added:</span>
                  <span className="detail-value">
                    {new Date(selectedSong.dateAdded).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="library-panel-footer">
          <span className="song-count">
            {favoriteSongs.length} song{favoriteSongs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </>
  );
};

/**
 * Utility function to format duration in seconds to MM:SS format
 */
function formatDuration(seconds) {
  if (!seconds || typeof seconds !== 'number') return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default LibraryPanel;
