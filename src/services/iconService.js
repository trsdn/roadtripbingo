import axios from 'axios';

const API_BASE_URL = '/api';

const iconService = {
  async getAll() {
    const response = await axios.get(`${API_BASE_URL}/icons`);
    return response.data;
  },
  
  async getById(id) {
    const response = await axios.get(`${API_BASE_URL}/icons/${id}`);
    return response.data;
  },
  
  async create(iconData) {
    const response = await axios.post(`${API_BASE_URL}/icons`, iconData);
    return response.data;
  },
  
  async update(id, iconData) {
    const response = await axios.put(`${API_BASE_URL}/icons/${id}`, iconData);
    return response.data;
  },
  
  async delete(id) {
    await axios.delete(`${API_BASE_URL}/icons/${id}`);
  },
};

export default iconService;