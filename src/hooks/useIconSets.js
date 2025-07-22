import { useState, useEffect } from 'react';
import { iconSetService } from '../services/iconSetService';

export function useIconSets() {
  const [iconSets, setIconSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIconSets = async () => {
    try {
      setLoading(true);
      const data = await iconSetService.getAll();
      setIconSets(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching icon sets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIconSets();
  }, []);

  const createIconSet = async (iconSetData) => {
    try {
      const newSet = await iconSetService.create(iconSetData);
      setIconSets([...iconSets, newSet]);
      return newSet;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateIconSet = async (id, updates) => {
    try {
      const updatedSet = await iconSetService.update(id, updates);
      setIconSets(iconSets.map(set => set.id === id ? updatedSet : set));
      return updatedSet;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateIconSetIcons = async (id, iconIds) => {
    try {
      const updatedSet = await iconSetService.updateIcons(id, iconIds);
      setIconSets(iconSets.map(set => set.id === id ? updatedSet : set));
      return updatedSet;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteIconSet = async (id) => {
    try {
      await iconSetService.delete(id);
      setIconSets(iconSets.filter(set => set.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    iconSets,
    loading,
    error,
    refreshIconSets: fetchIconSets,
    createIconSet,
    updateIconSet,
    updateIconSetIcons,
    deleteIconSet,
  };
}

export default useIconSets;