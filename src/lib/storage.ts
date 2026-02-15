// Simple localStorage wrapper for PWA storage
export const storage = {
  async get(key: string): Promise<{ value: string | null }> {
    try {
      const value = localStorage.getItem(key);
      return { value };
    } catch {
      return { value: null };
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage delete error:', error);
    }
  }
};
