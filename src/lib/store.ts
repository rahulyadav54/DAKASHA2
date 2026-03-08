"use client";

import { QuizSession, User } from "./types";

class SmartReadStore {
  private sessions: QuizSession[] = [];
  private currentUser: User | null = null;
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined' && !this.initialized) {
      const savedSessions = localStorage.getItem('sr_sessions');
      if (savedSessions) {
        try {
          this.sessions = JSON.parse(savedSessions);
        } catch (e) {
          console.error("Failed to load sessions", e);
        }
      }

      const savedUser = localStorage.getItem('sr_user');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          console.error("Failed to load user", e);
        }
      } else {
        // Default guest user if none exists
        this.currentUser = null;
      }
      this.initialized = true;
    }
  }

  getSessions() {
    this.init();
    return this.sessions;
  }

  addSession(session: QuizSession) {
    this.init();
    this.sessions.push(session);
    this.save();
  }

  getSession(id: string) {
    this.init();
    return this.sessions.find(s => s.id === id);
  }

  updateSession(session: QuizSession) {
    this.init();
    const idx = this.sessions.findIndex(s => s.id === session.id);
    if (idx !== -1) {
      this.sessions[idx] = session;
      this.save();
    }
  }

  getCurrentUser() {
    this.init();
    return this.currentUser;
  }

  login(name: string, email: string) {
    this.currentUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || 'User',
      role: 'Student',
      avatar: `https://picsum.photos/seed/${name}/100/100`
    };
    this.save();
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    this.save();
  }

  updateUser(userData: Partial<User>) {
    this.init();
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...userData };
      this.save();
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sr_sessions', JSON.stringify(this.sessions));
      if (this.currentUser) {
        localStorage.setItem('sr_user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('sr_user');
      }
    }
  }
}

export const store = new SmartReadStore();
