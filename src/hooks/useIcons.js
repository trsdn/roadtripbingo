import { useState, useEffect } from 'react';
import iconService from '../services/iconService';

export function useIcons() {
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchIcons = async () => {
    try {
      setLoading(true);
      const data = await iconService.getAll();
      setIcons(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching icons:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const uploadIcon = async (iconData) => {
    const newIcon = await iconService.create(iconData);
    setIcons([...icons, newIcon]);
    return newIcon;
  };
  
  const updateIcon = async (id, iconData) => {
    const updatedIcon = await iconService.update(id, iconData);
    setIcons(icons.map(icon => icon.id === id ? updatedIcon : icon));
    return updatedIcon;
  };
  
  const deleteIcon = async (id) => {
    await iconService.delete(id);
    setIcons(icons.filter(icon => icon.id !== id));
  };
  
  useEffect(() => {
    fetchIcons();
  }, []);
  
  return {
    icons,
    loading,
    error,
    fetchIcons,
    uploadIcon,
    updateIcon,
    deleteIcon,
  };
}