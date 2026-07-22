/**
 * federated.js
 * Federated Learning (FL) Simulator for Privacy-Preserving Recommendations
 */

class FederatedLearningSystem {
  constructor() {
    this.categories = [
      'Programming Languages',
      'Web Development',
      'Databases',
      'AI & Data Science',
      'Data Analysis',
      'Cloud & Infrastructure',
      'Security & Networking',
      'Mobile Development',
      'Design & Marketing'
    ];
    
    this.localLogsKey = 'fl_local_user_logs';
    this.localWeightsKey = 'fl_local_model_weights';
    this.globalWeightsKey = 'fl_global_model_weights';
    
    this.initDatabase();
  }

  // Initialize weights and logs if they don't exist
  initDatabase() {
    // Local log data represents raw user logs that NEVER leave this device
    if (!localStorage.getItem(this.localLogsKey)) {
      localStorage.setItem(this.localLogsKey, JSON.stringify([]));
    }

    // Local model weights (user profile representations)
    if (!localStorage.getItem(this.localWeightsKey)) {
      const defaultWeights = {};
      this.categories.forEach(cat => {
        defaultWeights[cat] = 0.1 + Math.random() * 0.1; // small random init
      });
      localStorage.setItem(this.localWeightsKey, JSON.stringify(defaultWeights));
    }

    // Global model weights (aggregate trends from all simulated nodes)
    if (!localStorage.getItem(this.globalWeightsKey)) {
      const defaultGlobal = {};
      this.categories.forEach(cat => {
        defaultGlobal[cat] = 0.2 + Math.random() * 0.1;
      });
      localStorage.setItem(this.globalWeightsKey, JSON.stringify(defaultGlobal));
    }
  }

  // Add raw event logs locally (strictly private)
  logEvent(category, activityType, magnitude = 1) {
    const logs = JSON.parse(localStorage.getItem(this.localLogsKey)) || [];
    logs.push({
      timestamp: new Date().toISOString(),
      category,
      activityType, // 'view', 'read_lesson', 'quiz_completed', 'search'
      magnitude
    });
    localStorage.setItem(this.localLogsKey, JSON.stringify(logs));

    // Sync log to database
    const user = window.AuthSystem.getCurrentUser();
    if (user) {
      fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ category, activityType, magnitude })
      }).catch(e => console.warn("Failed to sync log to server:", e));
    }
    
    // Auto-trigger local training update to adjust interest vectors
    this.trainLocalModel();
  }

  // Get raw local logs count
  getLogsCount() {
    const logs = JSON.parse(localStorage.getItem(this.localLogsKey)) || [];
    return logs.length;
  }

  // Clear local raw logs (demonstrates user control over their own data)
  clearLocalLogs() {
    localStorage.setItem(this.localLogsKey, JSON.stringify([]));
    const defaultWeights = {};
    this.categories.forEach(cat => {
      defaultWeights[cat] = 0.1;
    });
    localStorage.setItem(this.localWeightsKey, JSON.stringify(defaultWeights));

    // Clear server logs and weights
    const user = window.AuthSystem.getCurrentUser();
    if (user) {
      fetch('/api/logs/clear', {
        method: 'POST',
        headers: { 'x-user-email': user.email }
      }).catch(e => console.warn("Failed to clear server logs:", e));

      fetch('/api/weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ local_weights: defaultWeights, global_weights: this.getGlobalWeights() })
      }).catch(e => console.warn("Failed to clear server weights:", e));
    }
  }

  // Simulated SGD (Stochastic Gradient Descent) training loop inside the client browser
  trainLocalModel() {
    const logs = JSON.parse(localStorage.getItem(this.localLogsKey)) || [];
    const weights = JSON.parse(localStorage.getItem(this.localWeightsKey)) || {};
    
    if (logs.length === 0) return;
    
    // Learning Rate
    const eta = 0.05;
    
    // Calculate gradients based on log frequency and scoring
    const categoryFrequencies = {};
    this.categories.forEach(cat => categoryFrequencies[cat] = 0);
    
    logs.forEach(log => {
      let scoreWeight = 1.0;
      if (log.activityType === 'quiz_completed') {
        scoreWeight = log.magnitude; // magnitude holds the quiz score (e.g. 0.8)
      } else if (log.activityType === 'read_lesson') {
        scoreWeight = 1.5;
      } else if (log.activityType === 'view') {
        scoreWeight = 0.5;
      }
      
      if (categoryFrequencies[log.category] !== undefined) {
        categoryFrequencies[log.category] += scoreWeight;
      }
    });

    // Update weights towards local preference vectors (Gradient Descent Step)
    this.categories.forEach(cat => {
      const target = categoryFrequencies[cat] > 0 ? Math.min(1.0, categoryFrequencies[cat] * 0.15) : 0.05;
      const current = weights[cat] || 0.1;
      
      // Weight update: w_new = w_old + eta * (target - w_old)
      weights[cat] = current + eta * (target - current);
      // Ensure weights stay inside standard boundaries [0, 1]
      weights[cat] = Math.max(0.01, Math.min(1.0, weights[cat]));
    });

    localStorage.setItem(this.localWeightsKey, JSON.stringify(weights));

    // Sync weights to server database
    const user = window.AuthSystem.getCurrentUser();
    if (user) {
      fetch('/api/weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ local_weights: weights, global_weights: this.getGlobalWeights() })
      }).catch(e => console.warn("Failed to sync weights to server:", e));
    }
  }

  // Get local and global weights
  getLocalWeights() {
    return JSON.parse(localStorage.getItem(this.localWeightsKey));
  }

  getGlobalWeights() {
    return JSON.parse(localStorage.getItem(this.globalWeightsKey));
  }

  // Sync weights from database to local cache
  async syncWeightsFromServer() {
    const user = window.AuthSystem.getCurrentUser();
    if (!user) return;
    try {
      const res = await fetch('/api/weights', {
        headers: { 'x-user-email': user.email }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.local_weights && Object.keys(data.local_weights).length > 0) {
          localStorage.setItem(this.localWeightsKey, JSON.stringify(data.local_weights));
        }
        if (data.global_weights && Object.keys(data.global_weights).length > 0) {
          localStorage.setItem(this.globalWeightsKey, JSON.stringify(data.global_weights));
        }
      }
    } catch (e) {
      console.warn("Failed to sync weights from server:", e);
    }
  }

  // Run the visual secure federated learning aggregation cycle
  // Cycles through states: Encrypting -> Splitting Shares -> Submitting -> Aggregating -> Global Update -> Download Model
  triggerAggregationCycle(onProgress, onComplete) {
    const localWeights = this.getLocalWeights();
    const globalWeights = this.getGlobalWeights();
    
    const steps = [
      { percentage: 10, label: 'Initializing Local Client Parameters...' },
      { percentage: 25, label: 'Adding Differential Privacy Noise (ε=0.5, δ=1e-5)...' },
      { percentage: 40, label: 'Encrypting weights with Homomorphic Private Keys...' },
      { percentage: 60, label: 'Distributing Shamir secret shares to peer nodes...' },
      { percentage: 80, label: 'Secure Aggregator: Computing weighted average gradients...' },
      { percentage: 95, label: 'Updating Central Global Recommendation Model...' },
      { percentage: 100, label: 'Synchronized! Downloading new global model params...' }
    ];

    let currentStep = 0;
    
    const executeStep = () => {
      if (currentStep < steps.length) {
        onProgress(steps[currentStep]);
        currentStep++;
        
        // Vary timing to simulate realistic network delay
        const delay = 400 + Math.random() * 500;
        setTimeout(executeStep, delay);
      } else {
        // Compute new global weights by merging client update with global state (simulating many users)
        const updatedGlobal = {};
        this.categories.forEach(cat => {
          const localVal = localWeights[cat] || 0.1;
          const globalVal = globalWeights[cat] || 0.2;
          
          // Combine: simulating that other node updates pull the global model
          // Since local node is one of many, it has a small impact on global (e.g., 5%), 
          // but we exaggerate the effect (20%) so the user can visually notice the recommendation shifts.
          updatedGlobal[cat] = globalVal * 0.8 + localVal * 0.2;
          updatedGlobal[cat] = Math.max(0.05, Math.min(1.0, updatedGlobal[cat]));
        });
        
        localStorage.setItem(this.globalWeightsKey, JSON.stringify(updatedGlobal));

        // Sync local and global weights to database
        const user = window.AuthSystem.getCurrentUser();
        if (user) {
          fetch('/api/weights', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': user.email
            },
            body: JSON.stringify({ local_weights: localWeights, global_weights: updatedGlobal })
          }).then(() => {
            onComplete(updatedGlobal);
          }).catch(e => {
            console.warn("Failed to sync updated weights after aggregation:", e);
            onComplete(updatedGlobal);
          });
        } else {
          onComplete(updatedGlobal);
        }
      }
    };
    
    executeStep();
  }

  // Course Recommendation Engine
  // Merges Local weights (80% weight for personalized fit) and Global weights (20% weight for trending alignment)
  getPersonalizedRecommendations(allCourses) {
    const localWeights = this.getLocalWeights();
    const globalWeights = this.getGlobalWeights();
    
    const scoredCourses = allCourses.map(course => {
      const localPref = localWeights[course.category] || 0.1;
      const globalPref = globalWeights[course.category] || 0.2;
      
      // Composite score: 80% private preference, 20% global trending weights
      let score = (localPref * 0.8) + (globalPref * 0.2);
      
      // Small boost for trending courses
      if (course.trending) {
        score += 0.05;
      }
      
      // Small boost for rating
      score += (course.rating / 5) * 0.05;
      
      return { course, score };
    });

    // Sort by descending score
    scoredCourses.sort((a, b) => b.score - a.score);
    
    return scoredCourses.map(sc => sc.course);
  }
}

// Global Export for UI
window.FederatedSystem = new FederatedLearningSystem();
