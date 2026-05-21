import { CONFIG } from './config.js';

export const API = {
    async post(action, payload = {}) {
        try {
            const res = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action, ...payload })
            });
            return await res.json();
        } catch (e) {
            console.error("API Request Failed:", e);
            throw new Error("Network Error: Could not connect to database.");
        }
    }
};