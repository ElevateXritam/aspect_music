import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing favorite songs using localStorage
 * Created: 2025-12-13 10:46:05 UTC
 * 
 * This hook provides functionality to:
 * - Add songs to favorites
 * - Remove songs from favorites
 * - Check if a song is favorited
 * - Retrieve all favorite songs
 * - Persist favorites to localStorage
 */

const FAVORITES_STORAGE_KEY = 'aspect_music_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize favorites from localStorage on mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist favorites to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
      }
    }
  }, [favorites, isLoading]);

  /**
   * Add a song to favorites
   * @param {Object} song - Song object with id and metadata
   */
  const addFavorite = useCallback((song) => {
    setFavorites((prevFavorites) => {
      const isSongAlreadyFavorited = prevFavorites.some(
        (fav) => fav.id === song.id
      );
      
      if (isSongAlreadyFavorited) {
        return prevFavorites;
      }
      
      return [...prevFavorites, { ...song, addedAt: new Date().toISOString() }];
    });
  }, []);

  /**
   * Remove a song from favorites
   * @param {string} songId - ID of the song to remove
   */
  const removeFavorite = useCallback((songId) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter((song) => song.id !== songId)
    );
  }, []);

  /**
   * Check if a song is in favorites
   * @param {string} songId - ID of the song to check
   * @returns {boolean} - True if song is favorited, false otherwise
   */
  const isFavorited = useCallback(
    (songId) => {
      return favorites.some((song) => song.id === songId);
    },
    [favorites]
  );

  /**
   * Toggle favorite status of a song
   * @param {Object} song - Song object with id and metadata
   */
  const toggleFavorite = useCallback(
    (song) => {
      if (isFavorited(song.id)) {
        removeFavorite(song.id);
      } else {
        addFavorite(song);
      }
    },
    [isFavorited, addFavorite, removeFavorite]
  );

  /**
   * Clear all favorites
   */
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  /**
   * Get all favorites
   * @returns {Array} - Array of favorite songs
   */
  const getFavorites = useCallback(() => {
    return favorites;
  }, [favorites]);

  /**
   * Get number of favorites
   * @returns {number} - Count of favorite songs
   */
  const getFavoritesCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorited,
    toggleFavorite,
    clearFavorites,
    getFavorites,
    getFavoritesCount,
  };
};

export default useFavorites;
