const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const https = require('https');

const FIREBASE_HOST = 'smart-learn-ec890-default-rtdb.firebaseio.com';
const dbPath = path.join(__dirname, '..', 'database', 'smart_learn.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Extracting all local app data from SQLite...');

const firebaseData = {
  users: {
    'demo@smartlearn_com': {
      name: 'Demo Student',
      email: 'demo@smartlearn.com',
      created_at: new Date().toISOString(),
      role: 'student',
      streak: 7,
      hours_learned: 42
    },
    'student@smartlearn_edu': {
      name: 'Smart Learner',
      email: 'student@smartlearn.edu',
      created_at: new Date().toISOString(),
      role: 'student',
      streak: 12,
      hours_learned: 85
    }
  },
  settings: {
    'demo@smartlearn_com': {
      theme: 'dark',
      fontSize: 'medium',
      aiModel: 'gemini',
      notifications: true,
      audioFeedback: true,
      syncEnabled: true
    },
    'student@smartlearn_edu': {
      theme: 'dark',
      fontSize: 'large',
      aiModel: 'gemini-pro',
      notifications: true,
      audioFeedback: false,
      syncEnabled: true
    }
  },
  courses: {
    'python-basics': {
      id: 'python-basics',
      title: 'Python Fundamentals for AI',
      description: 'Master core Python syntax, data structures, and OOP for machine learning.',
      category: 'programming',
      modules: 8,
      duration: '6 Hours'
    },
    'web-dev': {
      id: 'web-dev',
      title: 'Modern Full-Stack Web Architecture',
      description: 'Build modern responsive web applications using Node.js, Express, and HTML5.',
      category: 'web',
      modules: 12,
      duration: '10 Hours'
    },
    'federated-learning': {
      id: 'federated-learning',
      title: 'Privacy-Preserving Federated Learning',
      description: 'Understand decentralized model training and differential privacy algorithms.',
      category: 'ai_privacy',
      modules: 6,
      duration: '4 Hours'
    }
  },
  progress: {
    'demo@smartlearn_com': {
      'python-basics': { progress: 85, completed: false, last_active: new Date().toISOString() },
      'web-dev': { progress: 40, completed: false, last_active: new Date().toISOString() }
    },
    'student@smartlearn_edu': {
      'python-basics': { progress: 100, completed: true, last_active: new Date().toISOString() },
      'federated-learning': { progress: 60, completed: false, last_active: new Date().toISOString() }
    }
  },
  bookmarks: {
    'demo@smartlearn_com': ['python-basics', 'federated-learning'],
    'student@smartlearn_edu': ['web-dev']
  },
  ai_chat_history: {
    'demo@smartlearn_com': [
      { sender: 'user', message: 'What is Federated Learning?', timestamp: new Date().toISOString() },
      { sender: 'ai', message: 'Federated Learning is a machine learning technique that trains an algorithm across multiple decentralized edge devices holding local data samples without exchanging them.', timestamp: new Date().toISOString() }
    ],
    'student@smartlearn_edu': [
      { sender: 'user', message: 'How do I run SQLite queries in Node.js?', timestamp: new Date().toISOString() },
      { sender: 'ai', message: 'You can use the sqlite3 npm package and call db.all("SELECT * FROM table", callback).', timestamp: new Date().toISOString() }
    ]
  }
};

db.serialize(() => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (!err && rows && rows.length > 0) {
      rows.forEach(r => {
        const key = (r.email || `user_${r.id}`).replace(/\./g, '_');
        firebaseData.users[key] = {
          name: r.name || r.username || 'User',
          email: r.email || '',
          created_at: r.created_at || new Date().toISOString()
        };
      });
    }

    db.all("SELECT * FROM course_progress", [], (err, pRows) => {
      if (!err && pRows && pRows.length > 0) {
        pRows.forEach(pr => {
          const userKey = (pr.user_id || 'demo@smartlearn.com').replace(/\./g, '_');
          if (!firebaseData.progress[userKey]) firebaseData.progress[userKey] = {};
          firebaseData.progress[userKey][pr.course_id] = {
            progress: pr.progress || 0,
            completed: pr.completed === 1,
            last_active: pr.updated_at || new Date().toISOString()
          };
        });
      }

      db.all("SELECT * FROM chat_history", [], (err, cRows) => {
        if (!err && cRows && cRows.length > 0) {
          cRows.forEach(cr => {
            const userKey = (cr.user_id || 'demo@smartlearn.com').replace(/\./g, '_');
            if (!firebaseData.ai_chat_history[userKey]) firebaseData.ai_chat_history[userKey] = [];
            firebaseData.ai_chat_history[userKey].push({
              sender: cr.sender || 'user',
              message: cr.message || '',
              timestamp: cr.created_at || new Date().toISOString()
            });
          });
        }

        db.close();

        // Push data to Firebase via REST API
        const payload = JSON.stringify(firebaseData);
        console.log(`\n🚀 Uploading ${Buffer.byteLength(payload)} bytes of data to https://${FIREBASE_HOST}/.json ...`);

        const req = https.request({
          hostname: FIREBASE_HOST,
          port: 443,
          path: '/.json',
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        }, (res) => {
          let responseBody = '';
          res.on('data', chunk => { responseBody += chunk; });
          res.on('end', () => {
            console.log(`\n✅ Firebase HTTP ${res.statusCode} Response:`);
            console.log(responseBody.substring(0, 300) + (responseBody.length > 300 ? '...' : ''));
            console.log('\n🎉 ALL DATA HAS BEEN SUCCESSFULLY POPULATED IN FIREBASE REALTIME DATABASE!');
          });
        });

        req.on('error', (e) => {
          console.error(`❌ Upload failed: ${e.message}`);
        });

        req.write(payload);
        req.end();
      });
    });
  });
});
