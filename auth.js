/**
 * auth.js
 * Simulated Firebase Authentication & Local-First Profile Manager
 */

class AuthSystem {
  constructor() {
    this.sessionUserKey = 'fl_session_user';
    this.usersDbKey = 'fl_users_database';
    this.settingsKey = 'fl_user_settings';
    
    this.initDatabase();
  }

  initDatabase() {
    // Seed users database if empty
    if (!localStorage.getItem(this.usersDbKey)) {
      const defaultUsers = [
        {
          email: 'student@smartlearn.edu',
          password: 'password123',
          name: 'Alex Mercer',
          bio: 'Undergraduate student majoring in Computer Science. Focused on machine learning and database structures. Privacy advocate.',
          streak: 0,
          studyHours: 0,
          completedTopics: 0,
          completedLessons: 0,
          skillsLearned: [],
          joinedDate: 'June 2026',
          achievements: [
            { id: 'streak_5', name: 'Consistent Learner', desc: 'Maintain a 5-day study streak', icon: '🔥', unlocked: false },
            { id: 'privacy_champion', name: 'Privacy Guard', desc: 'Run a Secure Aggregation local update cycle', icon: '🛡️', unlocked: false },
            { id: 'course_finisher', name: 'Class Graduate', desc: 'Complete all topics in any course', icon: '🎓', unlocked: false }
          ]
        }
      ];
      localStorage.setItem(this.usersDbKey, JSON.stringify(defaultUsers));
    }

    // Default application settings
    if (!localStorage.getItem(this.settingsKey)) {
      const defaultSettings = {
        theme: 'dark',
        notifications: true,
        offlineMode: true,
        federatedSync: true,
        differentialPrivacy: true,
        speechOutput: true,
        language: 'en-US'
      };
      localStorage.setItem(this.settingsKey, JSON.stringify(defaultSettings));
    }
  }

  // Check if a user is currently logged in (returns cached session user)
  getCurrentUser() {
    const session = sessionStorage.getItem(this.sessionUserKey) || localStorage.getItem(this.sessionUserKey);
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch (e) {
      return null;
    }
  }

  // Helper to fetch user details from server
  async fetchUserDetails() {
    const user = this.getCurrentUser();
    if (!user) return null;
    try {
      const res = await fetch('/api/auth/user', {
        headers: { 'x-user-email': user.email }
      });
      if (res.ok) {
        const fullUser = await res.json();
        // Update local session cache
        const sessionData = { 
          email: fullUser.email, 
          name: fullUser.name,
          bio: fullUser.bio,
          streak: fullUser.streak,
          studyHours: fullUser.studyHours,
          completedTopics: fullUser.completedTopics,
          completedLessons: fullUser.completedLessons,
          skillsLearned: fullUser.skillsLearned,
          achievements: fullUser.achievements
        };
        const rememberMe = !!localStorage.getItem(this.sessionUserKey);
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(this.sessionUserKey, JSON.stringify(sessionData));
        return fullUser;
      }
    } catch (e) {
      console.warn("Offline: failed to fetch user details from server. Using local cache.", e);
    }
    // Fallback to local users list
    const users = JSON.parse(localStorage.getItem(this.usersDbKey)) || [];
    return users.find(u => u.email === user.email) || user;
  }

  // REST Email Sign-In
  loginWithEmail(email, password, rememberMe = false) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          reject(data.error || "Login failed.");
          return;
        }

        const sessionData = { email: data.email, name: data.name };
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(this.sessionUserKey, JSON.stringify(sessionData));
        resolve(data);
      } catch (e) {
        console.warn("Network error during login, attempting local login:", e);
        // Fallback to local storage auth
        const users = JSON.parse(localStorage.getItem(this.usersDbKey)) || [];
        const user = users.find(u => u.email === email.toLowerCase().trim());
        if (!user) {
          reject("No user found (Offline). Check network connection.");
          return;
        }
        if (user.password !== password) {
          reject("Incorrect password (Offline).");
          return;
        }
        const sessionData = { email: user.email, name: user.name };
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(this.sessionUserKey, JSON.stringify(sessionData));
        resolve(user);
      }
    });
  }

  // REST Google Sign-In
  loginWithGoogle() {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch('/api/auth/google', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
          reject(data.error || "Google Sign-In failed.");
          return;
        }
        const sessionData = { email: data.email, name: data.name };
        sessionStorage.setItem(this.sessionUserKey, JSON.stringify(sessionData));
        resolve(data);
      } catch (e) {
        console.warn("Google login failed, fallback to local:", e);
        // Simulated offline Google login
        const googleUser = {
          email: 'google.student@gmail.com',
          name: 'Jordan Sparks',
          bio: 'Self-taught software developer seeking AI and Web Development projects.',
          streak: 0,
          studyHours: 0,
          completedTopics: 0,
          completedLessons: 0,
          skillsLearned: [],
          joinedDate: 'July 2026',
          achievements: [
            { id: 'streak_5', name: 'Consistent Learner', desc: 'Maintain a 5-day study streak', icon: '🔥', unlocked: false },
            { id: 'privacy_champion', name: 'Privacy Guard', desc: 'Run a Secure Aggregation local update cycle', icon: '🛡️', unlocked: false },
            { id: 'course_finisher', name: 'Class Graduate', desc: 'Complete all topics in any course', icon: '🎓', unlocked: false }
          ]
        };
        const users = JSON.parse(localStorage.getItem(this.usersDbKey)) || [];
        const exists = users.find(u => u.email === googleUser.email);
        if (!exists) {
          users.push(googleUser);
          localStorage.setItem(this.usersDbKey, JSON.stringify(users));
        }
        const sessionData = { email: googleUser.email, name: googleUser.name };
        sessionStorage.setItem(this.sessionUserKey, JSON.stringify(sessionData));
        resolve(exists || googleUser);
      }
    });
  }

  // REST Email Registration
  registerWithEmail(name, email, password) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          reject(data.error || "Registration failed.");
          return;
        }
        const sessionData = { email: data.email, name: data.name };
        sessionStorage.setItem(this.sessionUserKey, JSON.stringify(sessionData));
        resolve(data);
      } catch (e) {
        console.warn("Network error during registration, fallback to local:", e);
        const users = JSON.parse(localStorage.getItem(this.usersDbKey)) || [];
        const exists = users.find(u => u.email === email.toLowerCase().trim());
        if (exists) {
          reject("An account with this email address already exists (Offline).");
          return;
        }
        const newUser = {
          email: email.toLowerCase().trim(),
          password: password,
          name: name,
          bio: 'Eager learner looking forward to building privacy-preserving systems.',
          streak: 1,
          studyHours: 0,
          completedTopics: 0,
          completedLessons: 0,
          skillsLearned: [],
          joinedDate: 'July 2026',
          achievements: [
            { id: 'streak_5', name: 'Consistent Learner', desc: 'Maintain a 5-day study streak', icon: '🔥', unlocked: false },
            { id: 'privacy_champion', name: 'Privacy Guard', desc: 'Run a Secure Aggregation local update cycle', icon: '🛡️', unlocked: false },
            { id: 'course_finisher', name: 'Class Graduate', desc: 'Complete all topics in any course', icon: '🎓', unlocked: false }
          ]
        };
        users.push(newUser);
        localStorage.setItem(this.usersDbKey, JSON.stringify(users));
        const sessionData = { email: newUser.email, name: newUser.name };
        sessionStorage.setItem(this.sessionUserKey, JSON.stringify(sessionData));
        resolve(newUser);
      }
    });
  }

  // Simulated password recovery reset
  forgotPassword(email) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("A password recovery link has been simulated and sent to your email!");
      }, 500);
    });
  }

  // Logout current session
  logout() {
    sessionStorage.removeItem(this.sessionUserKey);
    localStorage.removeItem(this.sessionUserKey);
  }

  // Update bio or user attributes on server and local database
  async updateUserProfile(email, updatedFields) {
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email
        },
        body: JSON.stringify(updatedFields)
      });
    } catch (e) {
      console.warn("Failed to sync profile update to server:", e);
    }
    // Update local cache
    const users = JSON.parse(localStorage.getItem(this.usersDbKey)) || [];
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedFields };
      localStorage.setItem(this.usersDbKey, JSON.stringify(users));
      return users[index];
    }
    return null;
  }

  // Unlock achievements
  async unlockAchievement(email, achievementId) {
    try {
      const res = await fetch('/api/auth/achievements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email
        },
        body: JSON.stringify({ achievementId })
      });
      if (res.ok) {
        const data = await res.json();
        // Update local cache
        const users = JSON.parse(localStorage.getItem(this.usersDbKey)) || [];
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
          users[userIndex].achievements = data.achievements;
          localStorage.setItem(this.usersDbKey, JSON.stringify(users));
          const achIndex = data.achievements.findIndex(a => a.id === achievementId);
          return { user: users[userIndex], achievement: data.achievements[achIndex] };
        }
      }
    } catch (e) {
      console.warn("Failed to sync achievement unlock to server:", e);
    }

    // Fallback to local
    const users = JSON.parse(localStorage.getItem(this.usersDbKey)) || [];
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      const user = users[userIndex];
      const achIndex = user.achievements.findIndex(a => a.id === achievementId);
      if (achIndex !== -1 && !user.achievements[achIndex].unlocked) {
        user.achievements[achIndex].unlocked = true;
        users[userIndex] = user;
        localStorage.setItem(this.usersDbKey, JSON.stringify(users));
        return { user, achievement: user.achievements[achIndex] };
      }
    }
    return null;
  }

  // Settings manager
  getSettings() {
    return JSON.parse(localStorage.getItem(this.settingsKey));
  }

  async updateSettings(newSettings) {
    const current = this.getSettings() || {};
    const updated = { ...current, ...newSettings };
    localStorage.setItem(this.settingsKey, JSON.stringify(updated));

    const user = this.getCurrentUser();
    if (user) {
      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user.email
          },
          body: JSON.stringify(updated)
        });
      } catch (e) {
        console.warn("Failed to sync settings to server:", e);
      }
    }
    return updated;
  }
}

// Global Export
window.AuthSystem = new AuthSystem();

