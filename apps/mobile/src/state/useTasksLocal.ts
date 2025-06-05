// src/state/useTasks.ts

// 1) Polyfill crypto.getRandomValues for Hermes
import "react-native-get-random-values";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Task {
  id: string;
  query: string;
  frequency: string;
  createdAt: number;
}

interface TasksState {
  tasks: Task[];
  add: (t: Omit<Task, "id" | "createdAt">) => void;
  remove: (id: string) => void;
  update: (t: Task) => void;
}

export const useTasks = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      add: (partial) =>
        set({
          tasks: [
            ...get().tasks,
            { ...partial, id: uuidv4(), createdAt: Date.now() },
          ],
        }),
      remove: (id) => set({ tasks: get().tasks.filter((t) => t.id !== id) }),
      update: (task) =>
        set({
          tasks: get().tasks.map((t) => (t.id === task.id ? task : t)),
        }),
    }),
    {
      name: "notify-tasks",
      // ensures AsyncStorage always gets/returns a JSON string
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
