const API_BASE_URL = '/api/icon-sets';

export const iconSetService = {
  // Get all icon sets
  async getAll() {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch icon sets');
    }
    return response.json();
  },

  // Get a single icon set with its icons
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch icon set');
    }
    return response.json();
  },

  // Create a new icon set
  async create(iconSetData) {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(iconSetData),
    });
    if (!response.ok) {
      throw new Error('Failed to create icon set');
    }
    return response.json();
  },

  // Update an icon set
  async update(id, updates) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update icon set');
    }
    return response.json();
  },

  // Update icons in a set
  async updateIcons(id, iconIds) {
    const response = await fetch(`${API_BASE_URL}/${id}/icons`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ iconIds }),
    });
    if (!response.ok) {
      throw new Error('Failed to update icon set icons');
    }
    return response.json();
  },

  // Delete an icon set
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete icon set');
    }
  },
};

export default iconSetService;