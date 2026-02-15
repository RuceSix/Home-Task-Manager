import { create } from "zustand";
import { API_URL, API_KEY } from "@/config/api";
import { Device, Automation } from "@/types";

type HomeState = {
  devices: Device[];
  automations: Automation[];
  loading: boolean;
  loadData: () => Promise<void>;
  toggleDevice: (id: string) => void;
  toggleAutomation: (id: string) => void;
  addDevice: (name: string, room: string) => Promise<void>;
  addAutomation: (name: string, description: string) => Promise<void>;
};

export const useHomeStore = create<HomeState>((set, get) => ({
  devices: [],
  automations: [],
  loading: true,

  loadData: async () => {
    set({ loading: true });

    try {
      const [devicesRes, automationsRes] = await Promise.all([
        fetch(`${API_URL}?resource=devices&key=${API_KEY}`),
        fetch(`${API_URL}?resource=automations&key=${API_KEY}`),
      ]);

      const devices = await devicesRes.json();
      const automations = await automationsRes.json();

      set({
        devices: Array.isArray(devices) ? devices : [],
        automations: Array.isArray(automations) ? automations : [],
        loading: false,
      });
    } catch (error) {
      console.error("API error", error);
      set({ devices: [], automations: [], loading: false });
    }
  },

  toggleDevice: (id) =>
    set((state) => {
      const device = state.devices.find((d) => d.id === id);
      if (!device) return state;

      const newStatus = !device.status;

      fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        body: JSON.stringify({
          resource: "device",
          id,
          status: newStatus,
        }),
      });

      return {
        devices: state.devices.map((d) =>
          d.id === id ? { ...d, status: newStatus } : d
        ),
      };
    }),

  toggleAutomation: (id) =>
    set((state) => {
      const automation = state.automations.find((a) => a.id === id);
      if (!automation) return state;

      const newEnabled = !automation.enabled;

      fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        body: JSON.stringify({
          resource: "automation",
          id,
          enabled: newEnabled,
        }),
      });

      return {
        automations: state.automations.map((a) =>
          a.id === id ? { ...a, enabled: newEnabled } : a
        ),
      };
    }),

  addDevice: async (name: string, room: string) => {
    await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      body: JSON.stringify({
        resource: "device",
        action: "add",
        name,
        room,
      }),
    });

    // Reload from backend
    get().loadData();
  },

  addAutomation: async (name: string, description: string) => {
    await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      body: JSON.stringify({
        resource: "automation",
        action: "add",
        name,
        description,
      }),
    });

    get().loadData();
  },
}));
