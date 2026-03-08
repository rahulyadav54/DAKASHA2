"use client";

import { QuizSession, User } from "./types";

// In a real app, this would be a database.
// For the demo, we'll use a local storage based approach or simple memory.

class SmartReadStore {
  private sessions: QuizSession[] = [];
  private currentUser: User = {
    id: 'user-1',
    name: 'Alex Johnson',
    role: 'Student',
    avatar: 'https://picsum.photos/seed/alex/100/100'
  };

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sr_sessions');
      if (saved) {
        try {
          this.sessions = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load sessions", e);
        }
      }
    }
  }

  getSessions() {
    return this.sessions;
  }

  addSession(session: QuizSession) {
    this.sessions.push(session);
    this.save();
  }

  getSession(id: string) {
    return this.sessions.find(s => s.id === id);
  }

  updateSession(session: QuizSession) {
    const idx = this.sessions.findIndex(s => s.id === session.id);
    if (idx !== -1) {
      this.sessions[idx] = session;
      this.save();
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sr_sessions', JSON.stringify(this.sessions));
    }
  }
}

export const store = new SmartReadStore();