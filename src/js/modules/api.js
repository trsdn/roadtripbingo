// Road Trip Bingo - API Module
// Provides a clean API layer for all backend communications

class API {
    constructor() {
        this.baseUrl = '';
    }

    // Generic request handler
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Icon APIs
    async getIcons(search = '', category = '') {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        
        return this.request(`/api/icons${params.toString() ? '?' + params.toString() : ''}`);
    }

    async getIcon(iconId) {
        return this.request(`/api/icons/${iconId}`);
    }

    async createIcon(iconData) {
        return this.request('/api/icons', {
            method: 'POST',
            body: JSON.stringify(iconData)
        });
    }

    async updateIcon(iconId, updateData) {
        return this.request(`/api/icons/${iconId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    async deleteIcon(iconId) {
        return this.request(`/api/icons/${iconId}`, {
            method: 'DELETE'
        });
    }

    async clearAllIcons() {
        return this.request('/api/icons/clear', {
            method: 'DELETE'
        });
    }

    async applySmartDefaults() {
        return this.request('/api/icons/smart-defaults', {
            method: 'POST'
        });
    }

    // Icon Sets APIs
    async getIconSets() {
        return this.request('/api/icon-sets');
    }

    async createIconSet(setData) {
        return this.request('/api/icon-sets', {
            method: 'POST',
            body: JSON.stringify(setData)
        });
    }

    async updateIconSet(setId, setData) {
        return this.request(`/api/icon-sets/${setId}`, {
            method: 'PUT',
            body: JSON.stringify(setData)
        });
    }

    async deleteIconSet(setId) {
        return this.request(`/api/icon-sets/${setId}`, {
            method: 'DELETE'
        });
    }

    async addIconToSet(setId, iconId) {
        return this.request(`/api/icon-sets/${setId}/icons/${iconId}`, {
            method: 'POST'
        });
    }

    async removeIconFromSet(setId, iconId) {
        return this.request(`/api/icon-sets/${setId}/icons/${iconId}`, {
            method: 'DELETE'
        });
    }

    async getIconsInSet(setId) {
        return this.request(`/api/icon-sets/${setId}/icons`);
    }

    async getIconSetsForIcon(iconId) {
        return this.request(`/api/icons/${iconId}/sets`);
    }

    // Translation APIs
    async getIconTranslations(iconId) {
        return this.request(`/api/icons/${iconId}/translations`);
    }

    async addIconTranslation(iconId, language, translation) {
        return this.request(`/api/icons/${iconId}/translations`, {
            method: 'POST',
            body: JSON.stringify({ languageCode: language, translatedName: translation })
        });
    }

    async deleteIconTranslation(iconId, language) {
        return this.request(`/api/icons/${iconId}/translations/${language}`, {
            method: 'DELETE'
        });
    }

    // Settings APIs
    async getSettings() {
        return this.request('/api/settings');
    }

    async updateSettings(settings) {
        return this.request('/api/settings', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
    }

    // Category APIs
    async getCategories() {
        return this.request('/api/categories');
    }

    // AI APIs
    async getAIStatus() {
        return this.request('/api/ai/status');
    }

    async getAIPreferences() {
        return this.request('/api/ai/preferences');
    }

    async updateAIPreferences(preferences) {
        return this.request('/api/ai/preferences', {
            method: 'POST',
            body: JSON.stringify(preferences)
        });
    }

    async analyzeIcons(iconIds) {
        return this.request('/api/ai/analyze-batch', {
            method: 'POST',
            body: JSON.stringify({ icons: iconIds })
        });
    }

    async detectDuplicates(sensitivity = 0.8) {
        return this.request('/api/ai/detect-duplicates', {
            method: 'POST',
            body: JSON.stringify({ sensitivity })
        });
    }

    async getContentSuggestions(targetSet = 'general', limit = 10) {
        return this.request('/api/ai/content-suggestions', {
            method: 'POST',
            body: JSON.stringify({ target_set: targetSet, limit })
        });
    }

    async generateSmartSet(theme, count = 25) {
        return this.request('/api/ai/generate-set', {
            method: 'POST',
            body: JSON.stringify({ theme, count })
        });
    }

    // AI Suggestion Accept - New clean method
    async acceptAISuggestion(iconId, field, value) {
        const updateData = {};
        updateData[field] = value;
        
        console.log('API: Accepting AI suggestion', { iconId, field, value });
        
        return this.updateIcon(iconId, updateData);
    }

    // Backup APIs
    async createBackup(type = 'json') {
        return this.request('/api/backup', {
            method: 'POST',
            body: JSON.stringify({ type })
        });
    }

    async restoreBackup(backupData) {
        return this.request('/api/restore', {
            method: 'POST',
            body: JSON.stringify(backupData)
        });
    }

    // Card Generation APIs
    async getCardGenerations() {
        return this.request('/api/generations');
    }

    async createCardGeneration(generationData) {
        return this.request('/api/generations', {
            method: 'POST',
            body: JSON.stringify(generationData)
        });
    }
}

// Create and export a singleton instance
const api = new API();
export default api;

// Also export the class for testing purposes
export { API };