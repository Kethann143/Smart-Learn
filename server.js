/**
 * server.js
 * Express and SQLite3 Backend Database Server
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Initialize Database path and handle Electron writable path copy
const dbDir = process.env.USER_DATA_PATH || __dirname;
const dbPath = path.join(dbDir, 'smart_learn.db');

if (process.env.USER_DATA_PATH) {
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    if (!fs.existsSync(dbPath)) {
      const templatePath = path.join(__dirname, 'smart_learn.db');
      if (fs.existsSync(templatePath)) {
        fs.copyFileSync(templatePath, dbPath);
        console.log('Copied template database to UserData directory:', dbPath);
      }
    }
  } catch (err) {
    console.error('Error initializing database file in UserData directory:', err.message);
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeTables();
  }
});

// Setup tables and seed default values
function initializeTables() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      bio TEXT,
      streak INTEGER DEFAULT 0,
      studyHours REAL DEFAULT 0.0,
      completedTopics INTEGER DEFAULT 0,
      completedLessons INTEGER DEFAULT 0,
      joinedDate TEXT,
      skillsLearned TEXT DEFAULT '[]',
      achievements TEXT DEFAULT '[]'
    )`);

    // 2. Settings Table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      email TEXT PRIMARY KEY,
      theme TEXT DEFAULT 'dark',
      notifications INTEGER DEFAULT 1,
      offlineMode INTEGER DEFAULT 1,
      federatedSync INTEGER DEFAULT 1,
      differentialPrivacy INTEGER DEFAULT 1,
      speechOutput INTEGER DEFAULT 1,
      language TEXT DEFAULT 'en-US',
      FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE
    )`);

    // 3. Course Progress Table
    db.run(`CREATE TABLE IF NOT EXISTS course_progress (
      email TEXT,
      courseId TEXT,
      progress REAL DEFAULT 0.0,
      PRIMARY KEY (email, courseId),
      FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE
    )`);

    // 4. Local Logs Table
    db.run(`CREATE TABLE IF NOT EXISTS local_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      timestamp TEXT,
      category TEXT,
      activityType TEXT,
      magnitude REAL,
      FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE
    )`);

    // 5. Model Weights Table
    db.run(`CREATE TABLE IF NOT EXISTS model_weights (
      email TEXT PRIMARY KEY,
      local_weights TEXT DEFAULT '{}',
      global_weights TEXT DEFAULT '{}',
      FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE
    )`);

    // 6. Chat History Table
    db.run(`CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      timestamp TEXT,
      sender TEXT,
      text TEXT,
      courseId TEXT,
      topicName TEXT,
      FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE
    )`);

    // Seed default student user if empty
    db.get("SELECT email FROM users WHERE email = 'student@smartlearn.edu'", [], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      if (!row) {
        const defaultAchievements = [
          { id: 'streak_5', name: 'Consistent Learner', desc: 'Maintain a 5-day study streak', icon: '🔥', unlocked: false },
          { id: 'privacy_champion', name: 'Privacy Guard', desc: 'Run a Secure Aggregation local update cycle', icon: '🛡️', unlocked: false },
          { id: 'course_finisher', name: 'Class Graduate', desc: 'Complete all topics in any course', icon: '🎓', unlocked: false }
        ];
        
        db.run(`INSERT INTO users (email, password, name, bio, streak, studyHours, completedTopics, completedLessons, joinedDate, skillsLearned, achievements) 
                VALUES (?, ?, ?, ?, 0, 0, 0, 0, ?, '[]', ?)`,
          [
            'student@smartlearn.edu',
            'password123',
            'Alex Mercer',
            'Undergraduate student majoring in Computer Science. Focused on machine learning and database structures. Privacy advocate.',
            'June 2026',
            JSON.stringify(defaultAchievements)
          ]
        );

        db.run(`INSERT INTO settings (email, theme, notifications, offlineMode, federatedSync, differentialPrivacy, speechOutput, language) 
                VALUES (?, 'dark', 1, 1, 1, 1, 1, 'en-US')`,
          ['student@smartlearn.edu']
        );
        
        console.log('Seeded default user student@smartlearn.edu');
      }
    });
  });
}

// REST API Endpoints

// Middleware to extract/verify user from custom headers
function requireUser(req, res, next) {
  const email = req.headers['x-user-email'];
  if (!email) {
    return res.status(401).json({ error: 'Authorization email header required' });
  }
  req.userEmail = email;
  next();
}

// ─── AUTHENTICATION ENDPOINTS ───

// Email Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const lowercaseEmail = email.toLowerCase().trim();
  db.get("SELECT email FROM users WHERE email = ?", [lowercaseEmail], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'An account with this email address already exists.' });

    const achievements = [
      { id: 'streak_5', name: 'Consistent Learner', desc: 'Maintain a 5-day study streak', icon: '🔥', unlocked: false },
      { id: 'privacy_champion', name: 'Privacy Guard', desc: 'Run a Secure Aggregation local update cycle', icon: '🛡️', unlocked: false },
      { id: 'course_finisher', name: 'Class Graduate', desc: 'Complete all topics in any course', icon: '🎓', unlocked: false }
    ];

    db.run(`INSERT INTO users (email, password, name, bio, streak, studyHours, completedTopics, completedLessons, joinedDate, skillsLearned, achievements) 
            VALUES (?, ?, ?, 'Eager learner looking forward to building privacy-preserving systems.', 1, 0, 0, 0, ?, '[]', ?)`,
      [lowercaseEmail, password, name, 'July 2026', JSON.stringify(achievements)],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(`INSERT INTO settings (email, theme, notifications, offlineMode, federatedSync, differentialPrivacy, speechOutput, language) 
                VALUES (?, 'dark', 1, 1, 1, 1, 1, 'en-US')`,
          [lowercaseEmail]
        );

        res.json({ email: lowercaseEmail, name });
      }
    );
  });
});

// Email Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const lowercaseEmail = email.toLowerCase().trim();
  db.get("SELECT * FROM users WHERE email = ?", [lowercaseEmail], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'No user found with this email address.' });
    if (user.password !== password) return res.status(400).json({ error: 'Incorrect password. Please try again.' });

    user.skillsLearned = JSON.parse(user.skillsLearned || '[]');
    user.achievements = JSON.parse(user.achievements || '[]');
    delete user.password; // secure response
    res.json(user);
  });
});

// Simulated Google OAuth login
app.post('/api/auth/google', (req, res) => {
  const googleEmail = 'google.student@gmail.com';
  const googleName = 'Jordan Sparks';

  db.get("SELECT * FROM users WHERE email = ?", [googleEmail], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (user) {
      user.skillsLearned = JSON.parse(user.skillsLearned || '[]');
      user.achievements = JSON.parse(user.achievements || '[]');
      delete user.password;
      return res.json(user);
    }

    const achievements = [
      { id: 'streak_5', name: 'Consistent Learner', desc: 'Maintain a 5-day study streak', icon: '🔥', unlocked: false },
      { id: 'privacy_champion', name: 'Privacy Guard', desc: 'Run a Secure Aggregation local update cycle', icon: '🛡️', unlocked: false },
      { id: 'course_finisher', name: 'Class Graduate', desc: 'Complete all topics in any course', icon: '🎓', unlocked: false }
    ];

    db.run(`INSERT INTO users (email, password, name, bio, streak, studyHours, completedTopics, completedLessons, joinedDate, skillsLearned, achievements) 
            VALUES (?, 'google-oauth', ?, 'Self-taught software developer seeking AI and Web Development projects.', 0, 0, 0, 0, ?, '[]', ?)`,
      [googleEmail, googleName, 'July 2026', JSON.stringify(achievements)],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(`INSERT INTO settings (email, theme, notifications, offlineMode, federatedSync, differentialPrivacy, speechOutput, language) 
                VALUES (?, 'dark', 1, 1, 1, 1, 1, 'en-US')`,
          [googleEmail]
        );

        db.get("SELECT * FROM users WHERE email = ?", [googleEmail], (err, newUser) => {
          if (err) return res.status(500).json({ error: err.message });
          newUser.skillsLearned = JSON.parse(newUser.skillsLearned || '[]');
          newUser.achievements = JSON.parse(newUser.achievements || '[]');
          delete newUser.password;
          res.json(newUser);
        });
      }
    );
  });
});

// Fetch current user details
app.get('/api/auth/user', requireUser, (req, res) => {
  db.get("SELECT * FROM users WHERE email = ?", [req.userEmail], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.skillsLearned = JSON.parse(user.skillsLearned || '[]');
    user.achievements = JSON.parse(user.achievements || '[]');
    delete user.password;
    res.json(user);
  });
});

// Update Profile name/bio or stats dynamically
app.put('/api/auth/profile', requireUser, (req, res) => {
  const fields = req.body;
  const allowedFields = ['name', 'bio', 'streak', 'studyHours', 'completedTopics', 'completedLessons', 'skillsLearned'];
  
  const updates = [];
  const params = [];
  
  allowedFields.forEach(field => {
    if (fields[field] !== undefined) {
      updates.push(`${field} = ?`);
      if (field === 'skillsLearned') {
        params.push(JSON.stringify(fields[field]));
      } else {
        params.push(fields[field]);
      }
    }
  });
  
  if (updates.length === 0) {
    return res.json({ success: true, message: 'No fields to update' });
  }
  
  params.push(req.userEmail);
  const query = `UPDATE users SET ${updates.join(', ')} WHERE email = ?`;
  
  db.run(query, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: fields });
  });
});

// Unlock Achievement
app.put('/api/auth/achievements', requireUser, (req, res) => {
  const { achievementId } = req.body;
  db.get("SELECT achievements FROM users WHERE email = ?", [req.userEmail], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });

    const achievements = JSON.parse(row.achievements || '[]');
    const index = achievements.findIndex(a => a.id === achievementId);
    if (index !== -1 && !achievements[index].unlocked) {
      achievements[index].unlocked = true;
      db.run("UPDATE users SET achievements = ? WHERE email = ?", [JSON.stringify(achievements), req.userEmail], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, achievements });
      });
    } else {
      res.json({ success: false, message: 'Already unlocked or invalid ID' });
    }
  });
});

// ─── SETTINGS ENDPOINTS ───

app.get('/api/settings', requireUser, (req, res) => {
  db.get("SELECT * FROM settings WHERE email = ?", [req.userEmail], (err, settings) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!settings) return res.status(404).json({ error: 'Settings not found' });
    
    // Normalize integers to booleans
    res.json({
      theme: settings.theme,
      notifications: !!settings.notifications,
      offlineMode: !!settings.offlineMode,
      federatedSync: !!settings.federatedSync,
      differentialPrivacy: !!settings.differentialPrivacy,
      speechOutput: !!settings.speechOutput,
      language: settings.language
    });
  });
});

app.put('/api/settings', requireUser, (req, res) => {
  const s = req.body;
  db.run(`UPDATE settings SET 
    theme = ?, 
    notifications = ?, 
    offlineMode = ?, 
    federatedSync = ?, 
    differentialPrivacy = ?, 
    speechOutput = ?, 
    language = ? 
    WHERE email = ?`,
    [
      s.theme, 
      s.notifications ? 1 : 0, 
      s.offlineMode ? 1 : 0, 
      s.federatedSync ? 1 : 0, 
      s.differentialPrivacy ? 1 : 0, 
      s.speechOutput ? 1 : 0, 
      s.language,
      req.userEmail
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, settings: s });
    }
  );
});

// ─── COURSE PROGRESS ENDPOINTS ───

app.get('/api/progress', requireUser, (req, res) => {
  db.all("SELECT courseId, progress FROM course_progress WHERE email = ?", [req.userEmail], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const progressMap = {};
    rows.forEach(r => {
      progressMap[r.courseId] = r.progress;
    });
    res.json(progressMap);
  });
});

app.post('/api/progress', requireUser, (req, res) => {
  const { courseId, progress } = req.body;
  db.run(`INSERT INTO course_progress (email, courseId, progress) 
          VALUES (?, ?, ?) 
          ON CONFLICT(email, courseId) DO UPDATE SET progress = excluded.progress`,
    [req.userEmail, courseId, progress],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, courseId, progress });
    }
  );
});

// ─── FEDERATED LEARNING ENDPOINTS ───

app.get('/api/weights', requireUser, (req, res) => {
  db.get("SELECT local_weights, global_weights FROM model_weights WHERE email = ?", [req.userEmail], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) {
      return res.json({ local_weights: {}, global_weights: {} });
    }
    res.json({
      local_weights: JSON.parse(row.local_weights || '{}'),
      global_weights: JSON.parse(row.global_weights || '{}')
    });
  });
});

app.post('/api/weights', requireUser, (req, res) => {
  const { local_weights, global_weights } = req.body;
  db.run(`INSERT INTO model_weights (email, local_weights, global_weights) 
          VALUES (?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET local_weights = excluded.local_weights, global_weights = excluded.global_weights`,
    [req.userEmail, JSON.stringify(local_weights), JSON.stringify(global_weights)],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.post('/api/logs', requireUser, (req, res) => {
  const { category, activityType, magnitude } = req.body;
  const timestamp = new Date().toISOString();
  db.run(`INSERT INTO local_logs (email, timestamp, category, activityType, magnitude) 
          VALUES (?, ?, ?, ?, ?)`,
    [req.userEmail, timestamp, category, activityType, magnitude],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, log: { timestamp, category, activityType, magnitude } });
    }
  );
});

app.get('/api/logs/count', requireUser, (req, res) => {
  db.get("SELECT COUNT(*) as count FROM local_logs WHERE email = ?", [req.userEmail], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: row ? row.count : 0 });
  });
});

app.post('/api/logs/clear', requireUser, (req, res) => {
  db.run("DELETE FROM local_logs WHERE email = ?", [req.userEmail], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ─── CHAT HISTORY ENDPOINTS ───

app.get('/api/chat', requireUser, (req, res) => {
  const { courseId } = req.query;
  let query = "SELECT timestamp, sender, text, courseId, topicName FROM chat_history WHERE email = ?";
  const params = [req.userEmail];
  
  if (courseId) {
    query += " AND courseId = ?";
    params.push(courseId);
  }
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/chat', requireUser, (req, res) => {
  const { sender, text, courseId, topicName } = req.body;
  const timestamp = new Date().toISOString();
  
  db.run(`INSERT INTO chat_history (email, timestamp, sender, text, courseId, topicName) 
          VALUES (?, ?, ?, ?, ?, ?)`,
    [req.userEmail, timestamp, sender, text, courseId, topicName],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: { timestamp, sender, text, courseId, topicName } });
    }
  );
});

app.post('/api/chat/clear', requireUser, (req, res) => {
  const { courseId } = req.body;
  let query = "DELETE FROM chat_history WHERE email = ?";
  const params = [req.userEmail];
  
  if (courseId) {
    query += " AND courseId = ?";
    params.push(courseId);
  }

  db.run(query, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Serve frontend client files statically
app.use(express.static(path.join(__dirname)));

// Fallback index.html router
app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Smart Learn Backend running at http://localhost:${PORT}`);
});
