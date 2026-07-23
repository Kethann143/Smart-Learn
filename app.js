/**
 * app.js
 * Application Controller and State Orchestrator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global instances from other script dependencies
  const db = window.SmartLearningDB;
  const fl = window.FederatedSystem;
  const ai = window.AITutorSystem;
  const auth = window.AuthSystem;

  let currentUser = null;
  let activeCourseId = null;
  let activeTopicIndex = 0;
  let activeCourseSyllabus = null;
  let chatContextSet = false;

  // Track progress of active courses in storage
  let coursesProgress = JSON.parse(localStorage.getItem('fl_courses_progress')) || {};

  // ── Electron Title Bar Setup ────────────────────────────────────────────
  (function initElectronTitleBar() {
    if (!window.electronAPI || !window.electronAPI.isElectron) return;

    // Show the title bar and add body offset class
    const titleBar = document.getElementById('electron-titlebar');
    if (titleBar) titleBar.style.display = 'flex';
    document.body.classList.add('is-electron');

    // Wire window control buttons
    document.getElementById('tb-minimize')?.addEventListener('click', () => {
      window.electronAPI.minimize();
    });

    const tbMaximize = document.getElementById('tb-maximize');
    tbMaximize?.addEventListener('click', async () => {
      window.electronAPI.maximize();
      // Toggle icon between restore and maximize
      const isMax = await window.electronAPI.isMaximized();
      tbMaximize.title = isMax ? 'Restore' : 'Maximize';
    });

    document.getElementById('tb-close')?.addEventListener('click', () => {
      window.electronAPI.close();
    });

    console.log('[Smart Learn] Running as Electron desktop app ✅');
  })();



  /* ==========================================
     Query Selectors & UI Elements
     ========================================== */
  const views = document.querySelectorAll('.view-container');
  const navItems = document.querySelectorAll('.nav-item');
  const floatNavItems = document.querySelectorAll('.float-nav-item');
  
  // Modals
  const authModal = document.getElementById('auth-modal');
  const profileEditModal = document.getElementById('profile-edit-modal');
  const flModal = document.getElementById('fl-aggregation-modal');
  
  // Theme & Notifications
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const flSyncTriggerBtn = document.getElementById('fl-sync-trigger-btn');
  const homeFlSyncBtn = document.getElementById('home-fl-sync-btn');
  const statsFlBtn = document.getElementById('stats-fl-btn');
  const notificationsBtn = document.getElementById('notifications-trigger-btn');
  const notificationsRedDot = document.getElementById('notifications-red-dot');

  // Search
  const globalSearchInput = document.getElementById('global-search-input');

  /* ==========================================
     Routing & Navigation Engine
     ========================================== */
  function navigateToView(viewId) {
    views.forEach(v => v.classList.remove('active-view'));
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.classList.add('active-view');

    // Update Desktop Sidebar active states
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Mobile Nav active states
    floatNavItems.forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Handle view-specific initializations
    if (viewId === 'home') {
      renderDashboard();
    } else if (viewId === 'courses') {
      renderCoursesCatalog();
    } else if (viewId === 'progress') {
      renderProgressDashboard();
    } else if (viewId === 'profile') {
      renderProfileDetails();
    } else if (viewId === 'tutor') {
      renderChatWorkspace();
    } else if (viewId === 'settings') {
      loadThemeSettings();
    }
  }

  // Hook up event handlers to navigation elements
  function initNavigation() {
    const bindNavClick = (elem) => {
      elem.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = elem.getAttribute('data-view') || elem.parentElement.getAttribute('data-view');
        if (viewId) navigateToView(viewId);
      });
    };

    navItems.forEach(bindNavClick);
    floatNavItems.forEach(bindNavClick);

    // Header actions
    themeToggleBtn.addEventListener('click', toggleTheme);
    flSyncTriggerBtn.addEventListener('click', openFederatedSyncModal);
    if (homeFlSyncBtn) homeFlSyncBtn.addEventListener('click', openFederatedSyncModal);
    if (statsFlBtn) statsFlBtn.addEventListener('click', openFederatedSyncModal);
    
    notificationsBtn.addEventListener('click', () => {
      showNotification("AI Insight Alert", "Your local machine learning parameters have updated. Sync model weights soon to improve recommendation safety.");
      notificationsRedDot.style.display = 'none';
    });

    // Global Search listener (filters courses search)
    globalSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (query.length > 0) {
        navigateToView('courses');
        renderCoursesCatalog(query);
      }
    });
  }

  /* ==========================================
     Theme Configuration Manager
     ========================================== */
  function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    auth.updateSettings({ theme: newTheme });
    
    // Update theme toggle icon
    const icon = themeToggleBtn.querySelector('i');
    if (newTheme === 'dark') {
      icon.className = 'fa-solid fa-moon';
    } else {
      icon.className = 'fa-solid fa-sun';
    }
  }

  function updateFirebaseStatusUI(connected, projectId = null) {
    const statusBox = document.getElementById('firebase-connection-status');
    if (!statusBox) return;
    if (connected) {
      statusBox.innerHTML = `Client database is set to <span style="color:#00e5ff; font-weight:600;"><i class="fa-solid fa-cloud"></i> Connected</span> (Project ID: <strong style="color:var(--text-primary);">${projectId}</strong>). Data will automatically sync with your Firebase Firestore collections in real-time.`;
      
      const statusContainer = statusBox.parentElement;
      if (statusContainer) {
        statusContainer.style.background = 'rgba(0, 229, 255, 0.05)';
        statusContainer.style.borderColor = 'rgba(0, 229, 255, 0.2)';
      }
    } else {
      statusBox.innerHTML = `Client database is set to <span style="color:#4caf50; font-weight:600;">Mock-Offline Mode</span>. Connecting config inputs inside <code>auth.js</code> will instantly sync lists with real Firebase Firestore collections.`;
      
      const statusContainer = statusBox.parentElement;
      if (statusContainer) {
        statusContainer.style.background = 'rgba(245, 130, 13, 0.05)';
        statusContainer.style.borderColor = 'rgba(245, 130, 13, 0.15)';
      }
    }
  }

  function loadThemeSettings() {
    const settings = auth.getSettings();
    if (settings && settings.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
      const icon = themeToggleBtn.querySelector('i');
      if (settings.theme === 'dark') {
        icon.className = 'fa-solid fa-moon';
      } else {
        icon.className = 'fa-solid fa-sun';
      }
      
      // Update toggle settings
      document.getElementById('settings-theme-toggle').checked = (settings.theme === 'light');
      document.getElementById('settings-auto-sync').checked = settings.federatedSync;
      document.getElementById('settings-diff-priv').checked = settings.differentialPrivacy;
      document.getElementById('settings-speech-out').checked = settings.speechOutput;
      document.getElementById('settings-offline-caching').checked = settings.offlineMode;
    }

    // Populate Firebase config inputs
    const fbConfigStr = localStorage.getItem('fl_firebase_config');
    if (fbConfigStr) {
      try {
        const config = JSON.parse(fbConfigStr);
        document.getElementById('firebase-api-key').value = config.apiKey || '';
        document.getElementById('firebase-project-id').value = config.projectId || 'smart-learn-ec890';
        document.getElementById('firebase-auth-domain').value = config.authDomain || 'smart-learn-ec890.firebaseapp.com';
        document.getElementById('firebase-app-id').value = config.appId || '';
        
        if (auth.firebaseConnected) {
          updateFirebaseStatusUI(true, config.projectId);
        } else {
          updateFirebaseStatusUI(false);
        }
      } catch (e) {
        console.warn("Failed to load saved Firebase config:", e);
      }
    } else {
      document.getElementById('firebase-project-id').value = 'smart-learn-ec890';
      document.getElementById('firebase-auth-domain').value = 'smart-learn-ec890.firebaseapp.com';
      updateFirebaseStatusUI(false);
    }
  }

  /* ==========================================
     Simulated Authentication Flows
     ========================================== */
  async function syncProgressFromServer() {
    if (!currentUser) return;

    if (auth.firebaseConnected) {
      try {
        const querySnapshot = await auth.firestore.collection('progress')
          .where('email', '==', currentUser.email)
          .get();
        if (!querySnapshot.empty) {
          const progress = {};
          querySnapshot.forEach(doc => {
            const data = doc.data();
            progress[data.courseId] = data.progress;
          });
          coursesProgress = { ...coursesProgress, ...progress };
          localStorage.setItem('fl_courses_progress', JSON.stringify(coursesProgress));
        }
      } catch (err) {
        console.warn("Failed to sync progress from Firebase:", err);
      }
    }

    try {
      const res = await fetch('/api/progress', {
        headers: { 'x-user-email': currentUser.email }
      });
      if (res.ok) {
        const progress = await res.json();
        coursesProgress = { ...coursesProgress, ...progress };
        localStorage.setItem('fl_courses_progress', JSON.stringify(coursesProgress));
      }
    } catch (e) {
      console.warn("Failed to sync progress from server:", e);
    }
  }

  async function syncBookmarksFromFirebase() {
    if (!currentUser || !auth.firebaseConnected) return;
    try {
      const querySnapshot = await auth.firestore.collection('bookmarks')
        .where('email', '==', currentUser.email)
        .get();
      if (!querySnapshot.empty) {
        const dbBookmarks = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          dbBookmarks.push({ course: data.course, topic: data.topic, courseId: data.courseId || '' });
        });
        const localBookmarks = JSON.parse(localStorage.getItem('fl_user_bookmarks')) || [];
        const combined = [...localBookmarks];
        dbBookmarks.forEach(dbB => {
          if (!combined.some(b => b.topic === dbB.topic && b.course === dbB.course)) {
            combined.push(dbB);
          }
        });
        localStorage.setItem('fl_user_bookmarks', JSON.stringify(combined));
      }
    } catch (err) {
      console.warn("Failed to sync bookmarks from Firebase:", err);
    }
  }

  async function checkAuth() {
    currentUser = auth.getCurrentUser();
    if (!currentUser) {
      // Prompt sign in modal overlay and lock routing
      authModal.style.display = 'flex';
      setupAuthHandlers();
    } else {
      authModal.style.display = 'none';
      updateUserHeaderProfile();
      
      // Load user details, weights, and course progress in parallel
      await Promise.all([
        auth.fetchUserDetails().then(u => { if (u) currentUser = u; }),
        fl.syncWeightsFromServer(),
        syncProgressFromServer(),
        syncBookmarksFromFirebase()
      ]);
      
      updateUserHeaderProfile();
      renderDashboard();
    }
  }

  function updateUserHeaderProfile() {
    if (!currentUser) return;
    
    // Update Sidebar
    document.getElementById('sidebar-user-name').textContent = currentUser.name;
    const avatar = document.getElementById('sidebar-user-avatar');
    const initials = currentUser.name.split(' ').map(n => n[0]).join('');
    avatar.textContent = initials;
    
    // Update Welcome Title on home dashboard
    const welcomeUser = document.getElementById('welcome-username');
    if (welcomeUser) welcomeUser.textContent = currentUser.name;
  }

  function setupAuthHandlers() {
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const googleBtn = document.getElementById('auth-google-btn');
    const forgotLink = document.getElementById('auth-forgot-password-link');

    tabLogin.addEventListener('click', () => {
      tabLogin.style.color = 'var(--accent-cyan)';
      tabLogin.style.fontWeight = '700';
      tabRegister.style.color = 'var(--text-muted)';
      tabRegister.style.fontWeight = '500';
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.style.color = 'var(--accent-cyan)';
      tabRegister.style.fontWeight = '700';
      tabLogin.style.color = 'var(--text-muted)';
      tabLogin.style.fontWeight = '500';
      registerForm.style.display = 'block';
      loginForm.style.display = 'none';
    });

    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      if (!email) {
        alert("Please enter your email address first.");
        return;
      }
      auth.forgotPassword(email)
        .then(msg => alert(msg))
        .catch(err => alert(err));
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      const remember = document.getElementById('login-remember-me').checked;

      auth.loginWithEmail(email, pass, remember)
        .then(async (user) => {
          currentUser = user;
          authModal.style.display = 'none';
          updateUserHeaderProfile();
          
          // Sync database state to client
          await Promise.all([
            fl.syncWeightsFromServer(),
            syncProgressFromServer()
          ]);
          
          updateUserHeaderProfile();
          navigateToView('home');
          showNotification("Welcome back!", `Hello ${user.name}, your secure storage node is active.`);
        })
        .catch(err => alert(err));
    });

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-password').value;

      auth.registerWithEmail(name, email, pass)
        .then(async (user) => {
          currentUser = user;
          authModal.style.display = 'none';
          updateUserHeaderProfile();
          
          // Sync database state to client
          await Promise.all([
            fl.syncWeightsFromServer(),
            syncProgressFromServer()
          ]);

          updateUserHeaderProfile();
          navigateToView('home');
          showNotification("Welcome!", `Account created for ${name}. Let's secure your learning journey!`);
        })
        .catch(err => alert(err));
    });

    googleBtn.addEventListener('click', () => {
      auth.loginWithGoogle()
        .then(async (user) => {
          currentUser = user;
          authModal.style.display = 'none';
          updateUserHeaderProfile();
          
          // Sync database state to client
          await Promise.all([
            fl.syncWeightsFromServer(),
            syncProgressFromServer()
          ]);

          updateUserHeaderProfile();
          navigateToView('home');
          showNotification("Google Login Successful", "Federated login validated securely.");
        })
        .catch(err => alert(err));
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      auth.logout();
      currentUser = null;
      navigateToView('home');
      checkAuth();
    });
  }

  /* ==========================================
     Home Dashboard View Controller
     ========================================== */
  function renderDashboard() {
    if (!currentUser) return;

    // Load static values
    document.getElementById('welcome-hours').textContent = `${currentUser.studyHours.toFixed(1)} hrs`;
    document.getElementById('welcome-topics').textContent = currentUser.completedTopics;
    document.getElementById('home-streak-badge-num').textContent = currentUser.streak;
    document.getElementById('home-streak-days').textContent = currentUser.streak;
    document.getElementById('fl-local-logs-count').textContent = `${fl.getLogsCount()} records`;

    // Last sync indicator
    const lastSync = localStorage.getItem('fl_last_sync_timestamp');
    document.getElementById('fl-sync-last-time').textContent = lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never synchronized';

    // Populate "Continue Learning"
    renderContinueSection();

    // Populate Personalized Recommendations
    renderRecommendations();
  }

  function renderContinueSection() {
    const listContainer = document.getElementById('home-continue-list');
    const sectionTitle = document.getElementById('home-continue-title');
    listContainer.innerHTML = '';

    const activeCourses = Object.keys(coursesProgress);
    if (activeCourses.length === 0) {
      sectionTitle.style.display = 'none';
      listContainer.style.display = 'none';
      return;
    }

    sectionTitle.style.display = 'flex';
    listContainer.style.display = 'flex';

    activeCourses.forEach(cId => {
      const course = db.getCourseById(cId);
      if (!course) return;

      const progress = coursesProgress[cId];
      const card = document.createElement('div');
      card.className = 'course-card-sm glass-card';
      card.innerHTML = `
        <div class="course-icon-bg"><i class="fa-solid fa-code"></i></div>
        <span class="course-category-tag">${course.category}</span>
        <h4 class="course-title-sm">${course.name}</h4>
        <div class="progress-track-wrapper">
          <div class="progress-label-wrap">
            <span>Progress</span>
            <span class="progress-percentage">${progress}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${progress}%;"></div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        startCourseViewer(course.id);
      });

      listContainer.appendChild(card);
    });
  }

  function renderRecommendations() {
    const recContainer = document.getElementById('home-recommendations-list');
    recContainer.innerHTML = '';

    const allCourses = db.getCourses();
    const recommendations = fl.getPersonalizedRecommendations(allCourses);

    // Display top 6 recommendations
    recommendations.slice(0, 6).forEach(course => {
      const card = document.createElement('div');
      card.className = 'course-card-sm glass-card';
      card.innerHTML = `
        <div class="course-icon-bg"><i class="fa-solid fa-brain" style="color:var(--accent-cyan);"></i></div>
        <span class="course-category-tag">${course.category}</span>
        <h4 class="course-title-sm">${course.name}</h4>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; font-size:0.75rem; color:var(--text-muted);">
          <span>Rating: <strong>${course.rating}★</strong></span>
          <span>Level: <strong>${course.difficulty}</strong></span>
        </div>
      `;

      card.addEventListener('click', () => {
        startCourseViewer(course.id);
      });

      recContainer.appendChild(card);
    });
  }

  /* ==========================================
     Courses Section Controller
     ========================================== */
  let activeFilter = 'all';

  function renderCoursesCatalog(searchQuery = '') {
    const grid = document.getElementById('courses-catalog-grid');
    grid.innerHTML = '';

    let courses = db.getCourses();

    // Filter by category selection
    if (activeFilter !== 'all') {
      courses = courses.filter(c => c.category === activeFilter);
    }

    // Filter by search queries
    if (searchQuery.length > 0) {
      courses = courses.filter(c => 
        c.name.toLowerCase().includes(searchQuery) || 
        c.description.toLowerCase().includes(searchQuery)
      );
    }

    courses.forEach(course => {
      const progress = coursesProgress[course.id] || 0;
      
      const card = document.createElement('article');
      card.className = 'course-card glass-card';
      card.innerHTML = `
        <div class="course-card-top">
          <div class="course-card-badges">
            <span class="badge badge-difficulty">${course.difficulty}</span>
            ${course.trending ? '<span class="badge badge-trending">Trending</span>' : ''}
          </div>
          <h3 class="course-title-lg">${course.name}</h3>
          <p class="course-desc-lg">${course.description}</p>
        </div>
        <div>
          <div class="course-meta-grid">
            <div class="course-meta-item"><i class="fa-regular fa-clock"></i> <span>${course.duration}</span></div>
            <div class="course-meta-item"><i class="fa-regular fa-user"></i> <span>${course.students.toLocaleString()} enrolled</span></div>
            <div class="course-meta-item"><i class="fa-regular fa-star"></i> <span>${course.rating}★ rating</span></div>
            <div class="course-meta-item"><i class="fa-solid fa-list-check"></i> <span>5 units syllabus</span></div>
          </div>
          
          ${progress > 0 ? `
            <div class="progress-track-wrapper" style="margin-bottom:15px;">
              <div class="progress-label-wrap">
                <span>Completed</span>
                <span class="progress-percentage">${progress}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${progress}%;"></div>
              </div>
            </div>
          ` : ''}
          
          <button class="neon-btn" style="width:100%; justify-content:center;">
            ${progress > 0 ? 'Continue Studying' : 'Start Learning'} <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      `;

      card.querySelector('button').addEventListener('click', () => {
        startCourseViewer(course.id);
      });

      grid.appendChild(card);
    });
  }

  // Setup course category filter buttons
  document.getElementById('course-filter-bar').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('#course-filter-bar .filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.getAttribute('data-category');
      renderCoursesCatalog();
    }
  });

  /* ==========================================
     Dynamic Course & Syllabus Viewer
     ========================================== */
  function startCourseViewer(courseId) {
    activeCourseId = courseId;
    activeCourseSyllabus = db.generateCourseSyllabus(courseId);
    activeTopicIndex = 0;

    if (!activeCourseSyllabus) return;

    // Reset view container layout
    navigateToView('course-viewer');
    
    // Set course name header
    document.getElementById('cv-sidebar-course-name').textContent = activeCourseSyllabus.course.name;
    document.getElementById('cv-topic-category').textContent = activeCourseSyllabus.course.category;

    renderSyllabusSidebar();
    loadTopicContent();
  }

  function renderSyllabusSidebar() {
    const list = document.getElementById('cv-syllabus-list');
    list.innerHTML = '';

    activeCourseSyllabus.topics.forEach((topic, idx) => {
      const item = document.createElement('li');
      item.className = `syllabus-item ${idx === activeTopicIndex ? 'active' : ''}`;
      item.innerHTML = `
        <span class="syllabus-item-unit">Topic ${idx + 1}</span>
        <span class="syllabus-item-title">${topic.name}</span>
      `;

      item.addEventListener('click', () => {
        activeTopicIndex = idx;
        document.querySelectorAll('#cv-syllabus-list .syllabus-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        loadTopicContent();
      });

      list.appendChild(item);
    });
  }

  function loadTopicContent() {
    const course = activeCourseSyllabus.course;
    const topic = activeCourseSyllabus.topics[activeTopicIndex];
    
    // Log user local training activity strictly in browser
    fl.logEvent(course.category, 'read_lesson', 1.0);
    
    // Generate specialized procedural mock details
    const content = db.generateTopicContent(course.id, course.name, activeTopicIndex);

    // Set textual details
    document.getElementById('cv-topic-title').textContent = content.topicName;
    document.getElementById('cv-topic-desc').textContent = content.topicDesc;
    
    document.getElementById('cv-pane-beginner').innerHTML = `
      <p style="font-size:1.05rem; line-height:1.7; margin-bottom:15px;">${content.introduction}</p>
      <div style="background:rgba(0, 242, 254, 0.05); padding:20px; border-radius:10px; border:1px dashed var(--accent-cyan); margin:15px 0;">
        <h4 style="margin-bottom:8px; display:flex; align-items:center; gap:8px; color:var(--accent-cyan);">
          <i class="fa-solid fa-lightbulb"></i> Beginner Analogy:
        </h4>
        <p>${content.beginnerExplanation}</p>
      </div>
    `;
    
    document.getElementById('cv-pane-intermediate').innerHTML = `
      <p style="line-height:1.7;">${content.intermediateExplanation}</p>
      <div style="margin-top:15px; border-left:3.5px solid var(--accent-purple); padding-left:15px;">
        <em>In ${course.name}, understanding parameters forms the basis of operational development cycles. Maintain scopes locally to improve client security.</em>
      </div>
    `;
    
    document.getElementById('cv-pane-advanced').innerHTML = `
      <p style="line-height:1.7;">${content.advancedExplanation}</p>
      <p style="margin-top:10px; font-weight:500; color:var(--accent-pink);">
        <i class="fa-solid fa-triangle-exclamation"></i> Memory Safeguard: Avoid global namespace variable modifications.
      </p>
    `;

    // Diagram Box
    document.getElementById('cv-diagram-box').textContent = content.diagramText;

    // Code Snippet
    document.getElementById('cv-code-language').textContent = course.name.toUpperCase();
    document.getElementById('cv-code-snippet').textContent = content.codeSnippet;

    // Best practices lists
    const practicesList = document.getElementById('cv-best-practices-list');
    practicesList.innerHTML = '';
    content.bestPractices.forEach(bp => {
      const li = document.createElement('li');
      li.textContent = bp;
      practicesList.appendChild(li);
    });

    const mistakesList = document.getElementById('cv-common-mistakes-list');
    mistakesList.innerHTML = '';
    content.commonMistakes.forEach(cm => {
      const li = document.createElement('li');
      li.textContent = cm;
      mistakesList.appendChild(li);
    });

    // Quiz Questions
    renderQuizWidget(content.quizQuestions);

    // Mini Challenge
    document.getElementById('cv-mini-challenge-text').textContent = content.miniChallenge;

    // Prev/Next buttons logic
    const prevBtn = document.getElementById('cv-prev-topic-btn');
    const nextBtn = document.getElementById('cv-next-topic-btn');

    if (activeTopicIndex === 0) {
      prevBtn.style.visibility = 'hidden';
    } else {
      prevBtn.style.visibility = 'visible';
    }

    if (activeTopicIndex === activeCourseSyllabus.topics.length - 1) {
      nextBtn.textContent = 'Finish Course 🎓';
    } else {
      nextBtn.innerHTML = 'Next Topic <i class="fa-solid fa-chevron-right"></i>';
    }

    // Context updates for AI tutor
    ai.setContext(course.id, course.name, content.topicName, activeTopicIndex);
    chatContextSet = true;
  }

  // Quiz rendering in viewer
  let currentQuizAnswer = -1;
  function renderQuizWidget(questions) {
    const questionEl = document.getElementById('cv-quiz-question');
    const optionsList = document.getElementById('cv-quiz-options-list');
    const feedback = document.getElementById('cv-quiz-feedback');
    const submitBtn = document.getElementById('cv-quiz-submit-btn');

    feedback.style.display = 'none';
    submitBtn.style.display = 'block';
    optionsList.innerHTML = '';

    const quiz = questions[0]; // grab first quiz question
    questionEl.textContent = quiz.question;
    currentQuizAnswer = quiz.answer;

    quiz.options.forEach((opt, idx) => {
      const label = document.createElement('label');
      label.className = 'quiz-option-label';
      label.innerHTML = `
        <input type="radio" name="topic-quiz-option" value="${idx}">
        <span class="quiz-option-bullet"></span>
        <span>${opt}</span>
      `;

      label.addEventListener('click', () => {
        document.querySelectorAll('#cv-quiz-options-list .quiz-option-label').forEach(el => el.classList.remove('selected'));
        label.classList.add('selected');
        label.querySelector('input').checked = true;
      });

      optionsList.appendChild(label);
    });

    // Submit Answer listener
    submitBtn.onclick = () => {
      const selected = document.querySelector('input[name="topic-quiz-option"]:checked');
      if (!selected) {
        alert("Please select an option.");
        return;
      }

      const answerVal = parseInt(selected.value);
      feedback.style.display = 'block';
      submitBtn.style.display = 'none';

      const course = activeCourseSyllabus.course;

      if (answerVal === currentQuizAnswer) {
        feedback.className = 'quiz-feedback quiz-feedback-success';
        feedback.innerHTML = `<strong>Correct!</strong> ${quiz.explanation}`;
        
        // Log positive weight updates locally (high accuracy increases skill scores)
        fl.logEvent(course.category, 'quiz_completed', 1.0);
        updateUserProgress(true);
      } else {
        feedback.className = 'quiz-feedback quiz-feedback-error';
        feedback.innerHTML = `<strong>Incorrect.</strong> The correct answer was: <em>${quiz.options[currentQuizAnswer]}</em>. <br>${quiz.explanation}`;
        
        fl.logEvent(course.category, 'quiz_completed', 0.4);
        updateUserProgress(false);
      }
    };
  }

  function updateUserProgress(passed) {
    if (!currentUser) return;
    
    // Update local course completion percentage
    const stepWeight = 20; // 5 topics = 20% each
    const progress = coursesProgress[activeCourseId] || 0;
    
    if (progress < (activeTopicIndex + 1) * stepWeight) {
      coursesProgress[activeCourseId] = (activeTopicIndex + 1) * stepWeight;
      localStorage.setItem('fl_courses_progress', JSON.stringify(coursesProgress));
      
      // Sync progress to server
      fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({ courseId: activeCourseId, progress: coursesProgress[activeCourseId] })
      }).catch(e => console.warn("Failed to sync progress to server:", e));

      if (auth.firebaseConnected) {
        auth.firestore.collection('progress').doc(`${currentUser.email}_${activeCourseId}`).set({
          email: currentUser.email,
          courseId: activeCourseId,
          progress: coursesProgress[activeCourseId],
          timestamp: new Date().toISOString()
        }, { merge: true }).catch(err => console.error("Firebase progress update failed:", err));
      }

      // Update global user stats
      currentUser.completedLessons += 3;
      currentUser.studyHours += 0.5;
      
      if (activeTopicIndex === activeCourseSyllabus.topics.length - 1) {
        currentUser.completedTopics += 1;
        // Award Skill badge
        if (!currentUser.skillsLearned.includes(activeCourseSyllabus.course.name)) {
          currentUser.skillsLearned.push(activeCourseSyllabus.course.name);
        }
        
        // Unlock completion achievement check
        auth.unlockAchievement(currentUser.email, 'course_finisher');
      }

      auth.updateUserProfile(currentUser.email, currentUser);
    }
  }

  // Viewer controls: previous, next, bookmarks, notes, back buttons
  document.getElementById('back-to-courses-btn').addEventListener('click', () => {
    navigateToView('courses');
  });

  document.getElementById('cv-prev-topic-btn').addEventListener('click', () => {
    if (activeTopicIndex > 0) {
      activeTopicIndex--;
      loadTopicContent();
      renderSyllabusSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.getElementById('cv-next-topic-btn').addEventListener('click', () => {
    if (activeTopicIndex < activeCourseSyllabus.topics.length - 1) {
      activeTopicIndex++;
      loadTopicContent();
      renderSyllabusSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Course completed
      alert(`Congratulations! You have completed all topic levels of ${activeCourseSyllabus.course.name}!`);
      navigateToView('courses');
    }
  });

  document.getElementById('cv-bookmark-btn').addEventListener('click', () => {
    const topic = activeCourseSyllabus.topics[activeTopicIndex];
    showNotification("Bookmark Added", `"${topic.name}" has been stored to your profile.`);
    
    // Save locally
    const bookmarks = JSON.parse(localStorage.getItem('fl_user_bookmarks')) || [];
    const entry = { course: activeCourseSyllabus.course.name, topic: topic.name, courseId: activeCourseId };
    
    // Prevent duplicate saves
    if (!bookmarks.some(b => b.topic === entry.topic && b.course === entry.course)) {
      bookmarks.push(entry);
      localStorage.setItem('fl_user_bookmarks', JSON.stringify(bookmarks));

      if (auth.firebaseConnected) {
        auth.firestore.collection('bookmarks').add({
          email: currentUser.email,
          course: entry.course,
          topic: entry.topic,
          courseId: entry.courseId,
          timestamp: new Date().toISOString()
        }).catch(err => console.error("Firebase bookmark save failed:", err));
      }
    }
  });

  document.getElementById('cv-notes-btn').addEventListener('click', () => {
    const course = activeCourseSyllabus.course.name;
    const topic = activeCourseSyllabus.topics[activeTopicIndex].name;
    
    // Simulated Text Download trigger
    const notesText = `Smart Learning Companion Notes\n===========================\nCourse: ${course}\nTopic: ${topic}\n\nStudy parameters and code blocks saved securely inside your browser workspace.`;
    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.replace(/\s+/g, '_')}_${topic.replace(/\s+/g, '_')}_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('cv-open-tutor-btn').addEventListener('click', () => {
    navigateToView('tutor');
  });

  // Copy code blocks
  document.getElementById('cv-code-copy-btn').addEventListener('click', () => {
    const code = document.getElementById('cv-code-snippet').textContent;
    navigator.clipboard.writeText(code).then(() => {
      alert("Code copied to clipboard!");
    });
  });

  /* ==========================================
     AI Tutor View Controller
     ========================================== */
  const messagesBox = document.getElementById('tutor-messages-box');
  const chatInput = document.getElementById('tutor-chat-input');
  const chatSendBtn = document.getElementById('tutor-send-btn');
  const micBtn = document.getElementById('tutor-mic-btn');
  const quickQuizBtn = document.getElementById('tutor-quick-quiz-btn');

  async function renderChatWorkspace() {
    // Set banner headers context
    if (chatContextSet && activeCourseSyllabus) {
      document.getElementById('tutor-context-course-name').textContent = activeCourseSyllabus.course.name;
      document.getElementById('tutor-context-topic-name').textContent = activeCourseSyllabus.topics[activeTopicIndex].name;
      document.getElementById('tutor-context-divider').style.display = 'inline-block';
      document.getElementById('tutor-context-topic-name').style.display = 'inline-block';
    } else {
      document.getElementById('tutor-context-course-name').textContent = 'General';
      document.getElementById('tutor-context-divider').style.display = 'none';
      document.getElementById('tutor-context-topic-name').style.display = 'none';
    }

    // Set connection lock badge
    document.getElementById('tutor-context-status-badge').textContent = 'Local Session';
    document.getElementById('tutor-context-status-badge').className = 'badge badge-difficulty';

    // Sync chat history from backend first
    await ai.syncChatFromServer(activeCourseId);

    // Populate message bubbles
    messagesBox.innerHTML = '';
    const history = ai.getHistory(activeCourseId);
    
    if (history.length === 0) {
      // Print welcome AI greeting
      printChatMessage('ai', `Hello! I am your AI Companion. ${activeCourseId ? `Ready to study **${activeCourseSyllabus.course.name}** context variables.` : 'Explore courses or ask me a question to start!'}`);
    } else {
      history.forEach(msg => {
        printChatMessage(msg.sender, msg.text, false);
      });
    }

    renderHistorySidebar();
    renderSuggestedPrompts();
  }

  function renderHistorySidebar() {
    const historyList = document.getElementById('tutor-history-list');
    historyList.innerHTML = '';
    
    const allHistory = ai.getHistory();
    // Unique course IDs in history
    const uCourses = [...new Set(allHistory.map(h => h.courseId).filter(Boolean))];
    
    if (uCourses.length === 0) {
      historyList.innerHTML = `<p style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding: 20px;">No threads yet.</p>`;
      return;
    }

    uCourses.forEach(cId => {
      const course = db.getCourseById(cId);
      if (!course) return;

      const item = document.createElement('div');
      item.className = `history-chat-item ${cId === activeCourseId ? 'active' : ''}`;
      item.innerHTML = `
        <div style="font-weight:600; color:var(--accent-cyan);">${course.name}</div>
        <div style="opacity:0.6; font-size:0.7rem; margin-top:2px;">Study Logs Session</div>
      `;

      item.addEventListener('click', () => {
        activeCourseId = cId;
        activeCourseSyllabus = db.generateCourseSyllabus(cId);
        activeTopicIndex = 0;
        chatContextSet = true;
        renderChatWorkspace();
      });

      historyList.appendChild(item);
    });
  }

  function printChatMessage(sender, text, animate = true) {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender}`;

    if (sender === 'ai') {
      // Use the rich markdown renderer from the upgraded AI engine
      const rendered = ai.renderMarkdown(text);
      bubble.innerHTML = rendered;

      // Typewriter reveal effect for new AI messages
      if (animate) {
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(10px)';
        bubble.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        requestAnimationFrame(() => {
          bubble.style.opacity = '1';
          bubble.style.transform = 'translateY(0)';
        });
      }

      // Add text-to-speech button
      const speechBtn = document.createElement('button');
      speechBtn.className = 'speech-btn-inline';
      speechBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      speechBtn.title = 'Read Aloud';
      speechBtn.addEventListener('click', () => ai.speak(text));
      bubble.appendChild(speechBtn);

    } else {
      // User bubble — simple text
      bubble.textContent = text;
    }

    messagesBox.appendChild(bubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  // Render AI quick-action suggestion chips below the input
  function renderSuggestedPrompts() {
    const existingChips = document.getElementById('ai-suggest-chips');
    if (existingChips) existingChips.remove();

    const chips = ai.getSuggestedPrompts(
      activeCourseSyllabus ? activeCourseSyllabus.course.name : null,
      activeCourseSyllabus ? activeCourseSyllabus.topics[activeTopicIndex]?.name : null
    );

    const container = document.createElement('div');
    container.id = 'ai-suggest-chips';
    container.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px; padding:10px 16px 4px; border-top:1px solid rgba(255,255,255,0.05);';

    chips.slice(0, 4).forEach(chip => {
      const btn = document.createElement('button');
      btn.textContent = chip;
      btn.style.cssText = `
        padding: 6px 14px;
        border-radius: 20px;
        border: 1px solid rgba(0,242,254,0.3);
        background: rgba(0,242,254,0.06);
        color: var(--accent-cyan);
        font-size: 0.72rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--font-body);
        white-space: nowrap;
      `;
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(0,242,254,0.15)';
        btn.style.borderColor = 'var(--accent-cyan)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(0,242,254,0.06)';
        btn.style.borderColor = 'rgba(0,242,254,0.3)';
      });
      btn.addEventListener('click', () => {
        chatInput.value = chip;
        sendMessage();
      });
      container.appendChild(btn);
    });

    // Insert before the chat input area
    const inputArea = chatSendBtn.closest('div') || chatSendBtn.parentElement;
    if (inputArea && inputArea.parentElement) {
      inputArea.parentElement.insertBefore(container, inputArea);
    }
  }

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Clear input
    chatInput.value = '';

    // Print User bubble
    printChatMessage('user', text);
    
    // Save to storage context
    ai.saveMessage('user', text, activeCourseId, activeCourseSyllabus ? activeCourseSyllabus.topics[activeTopicIndex].name : 'General');

    // Show typewriter loading dot indicator
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'message-bubble ai';
    loadingBubble.innerHTML = `<span style="font-style:italic; opacity:0.6;"><i class="fa-solid fa-spinner fa-spin"></i> AI is thinking...</span>`;
    messagesBox.appendChild(loadingBubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Trigger Response Generator
    ai.generateResponse(text, (aiResponse) => {
      // Remove loading dots
      loadingBubble.remove();
      
      // Print AI bubble
      printChatMessage('ai', aiResponse);
      ai.saveMessage('ai', aiResponse, activeCourseId, activeCourseSyllabus ? activeCourseSyllabus.topics[activeTopicIndex].name : 'General');
      
      // Speak response if set
      const settings = auth.getSettings();
      if (settings && settings.speechOutput) {
        ai.speak(aiResponse);
      }

      // Refresh sidebar discussion history
      renderHistorySidebar();
    });
  }

  // Key Event triggers
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  chatSendBtn.addEventListener('click', sendMessage);

  // Quick Quiz trigger
  quickQuizBtn.addEventListener('click', () => {
    chatInput.value = 'Generate custom quiz';
    sendMessage();
  });

  // Speech Recognition Mic handler
  micBtn.addEventListener('click', () => {
    if (ai.isListening) {
      ai.stopListening();
      micBtn.classList.remove('active-mic');
      micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    } else {
      micBtn.classList.add('active-mic');
      micBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
      ai.startListening(
        (result) => {
          chatInput.value = result;
          micBtn.classList.remove('active-mic');
          micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
          sendMessage();
        },
        (err) => {
          alert(err);
          micBtn.classList.remove('active-mic');
          micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        },
        () => {
          micBtn.classList.remove('active-mic');
          micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        }
      );
    }
  });

  // Clear Chat histories
  document.getElementById('tutor-clear-chat-btn').addEventListener('click', () => {
    if (confirm("Delete current AI chat logs? This keeps raw database records intact.")) {
      ai.clearHistory(activeCourseId);
      renderChatWorkspace();
    }
  });

  /* ==========================================
     Progress Section Controller
     ========================================== */
  function renderProgressDashboard() {
    if (!currentUser) return;

    document.getElementById('stats-duration').textContent = `${currentUser.studyHours.toFixed(1)}h`;
    document.getElementById('stats-streak').textContent = `${currentUser.streak} days`;
    document.getElementById('stats-topics').textContent = currentUser.completedTopics;
    
    // Populate Weights parameters List
    const wContainer = document.getElementById('stats-weights-list');
    wContainer.innerHTML = '';

    const weights = fl.getLocalWeights();
    
    Object.keys(weights).forEach(cat => {
      const val = weights[cat];
      const row = document.createElement('div');
      row.className = 'weight-row-bar-wrap';
      row.innerHTML = `
        <span class="weight-row-label-text">${cat}</span>
        <div class="weight-row-fill-bg">
          <div class="weight-row-fill-val" style="width: ${val * 100}%;"></div>
        </div>
        <span style="font-weight:600; width:35px; text-align:right;">${Math.round(val * 100)}%</span>
      `;
      wContainer.appendChild(row);
    });
  }

  /* ==========================================
     Profile Section Controller
     ========================================== */
  const bioEditForm = document.getElementById('profile-edit-form');

  function renderProfileDetails() {
    if (!currentUser) return;

    document.getElementById('profile-full-name').textContent = currentUser.name;
    document.getElementById('profile-bio').textContent = currentUser.bio;

    // Avatar initials
    const initials = currentUser.name.split(' ').map(n => n[0]).join('');
    document.getElementById('profile-avatar-letters').textContent = initials;

    // Populates achievements grid
    const aList = document.getElementById('profile-achievements-list');
    aList.innerHTML = '';

    currentUser.achievements.forEach(ach => {
      const card = document.createElement('div');
      card.className = `achievement-card glass-card ${ach.unlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <span class="achievement-icon">${ach.icon}</span>
        <div class="achievement-info">
          <span class="achievement-name">${ach.name}</span>
          <span class="achievement-desc">${ach.desc}</span>
        </div>
      `;
      aList.appendChild(card);
    });

    // Populate Bookmarks
    const bList = document.getElementById('profile-bookmarks-list');
    const bookmarks = JSON.parse(localStorage.getItem('fl_user_bookmarks')) || [];
    
    if (bookmarks.length === 0) {
      bList.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No bookmarks saved yet. Click the bookmark icon inside topic pages.</p>`;
    } else {
      bList.innerHTML = '';
      bookmarks.forEach(b => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justify = 'space-between';
        item.style.padding = '12px';
        item.style.borderRadius = '8px';
        item.style.background = 'rgba(255,255,255,0.02)';
        item.style.cursor = 'pointer';
        item.innerHTML = `
          <span><strong>${b.course}</strong>: ${b.topic}</span>
          <i class="fa-solid fa-arrow-right" style="color:var(--accent-cyan);"></i>
        `;

        item.addEventListener('click', () => {
          startCourseViewer(b.courseId);
        });

        bList.appendChild(item);
      });
    }
  }

  // Edit Bio Profile Modal handlers
  document.getElementById('profile-edit-btn').addEventListener('click', () => {
    document.getElementById('edit-profile-name').value = currentUser.name;
    document.getElementById('edit-profile-bio').value = currentUser.bio;
    profileEditModal.style.display = 'flex';
  });

  document.getElementById('profile-modal-close-btn').addEventListener('click', () => {
    profileEditModal.style.display = 'none';
  });

  bioEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-profile-name').value;
    const bioText = document.getElementById('edit-profile-bio').value;

    currentUser.name = name;
    currentUser.bio = bioText;

    auth.updateUserProfile(currentUser.email, currentUser);
    profileEditModal.style.display = 'none';
    
    updateUserHeaderProfile();
    renderProfileDetails();
    showNotification("Profile Updated", "Local bio details saved successfully.");
  });

  /* ==========================================
     Settings configurations controller
     ========================================== */
  async function syncLocalDataToFirebase() {
    if (!currentUser || !auth.firebaseConnected) return;
    const email = currentUser.email;
    const db = auth.firestore;
    
    showNotification("Firebase Syncing", "Uploading your learning records and seeding collections.");
    
    try {
      // 1. Sync User Profile
      await db.collection('users').doc(email).set({
        email: email,
        name: currentUser.name,
        bio: currentUser.bio || '',
        streak: currentUser.streak || 0,
        studyHours: currentUser.studyHours || 0,
        completedTopics: currentUser.completedTopics || 0,
        completedLessons: currentUser.completedLessons || 0,
        joinedDate: currentUser.joinedDate || '',
        skillsLearned: currentUser.skillsLearned || [],
        achievements: currentUser.achievements || [],
        password: currentUser.password || 'password123'
      }, { merge: true });
      
      // 2. Sync Settings
      const settings = auth.getSettings();
      if (settings) {
        await db.collection('settings').doc(email).set(settings, { merge: true });
      }
      
      // 3. Sync Course Progress
      for (const [courseId, progress] of Object.entries(coursesProgress)) {
        await db.collection('progress').doc(`${email}_${courseId}`).set({
          email: email,
          courseId: courseId,
          progress: progress,
          timestamp: new Date().toISOString()
        }, { merge: true });
      }
      
      // 4. Sync Bookmarks
      const bookmarks = JSON.parse(localStorage.getItem('fl_user_bookmarks')) || [];
      for (const b of bookmarks) {
        const query = await db.collection('bookmarks')
          .where('email', '==', email)
          .where('course', '==', b.course)
          .where('topic', '==', b.topic)
          .get();
        if (query.empty) {
          await db.collection('bookmarks').add({
            email: email,
            course: b.course,
            topic: b.topic,
            courseId: b.courseId || '',
            timestamp: b.timestamp || new Date().toISOString()
          });
        }
      }
      
      // 5. Seed courses to Firebase if empty
      const coursesSnapshot = await db.collection('courses').limit(1).get();
      if (coursesSnapshot.empty) {
        const coursesData = window.SmartLearningDB.getCourses();
        for (const course of coursesData) {
          await db.collection('courses').doc(course.id).set(course);
        }
        console.log('[Firebase] Seeded /courses collection');
      }

      // 6. Sync Chat History
      const chatHistory = JSON.parse(localStorage.getItem('fl_chat_history')) || [];
      for (const msg of chatHistory) {
        const query = await db.collection('ai_chat_history')
          .where('email', '==', email)
          .where('timestamp', '==', msg.timestamp)
          .where('sender', '==', msg.sender)
          .get();
        if (query.empty) {
          await db.collection('ai_chat_history').add({
            email: email,
            timestamp: msg.timestamp,
            sender: msg.sender,
            text: msg.text,
            courseId: msg.courseId || '',
            topicName: msg.topicName || ''
          });
        }
      }
      
      showNotification("Sync Success", "All learning data fully synchronized with cloud Firestore!");
    } catch (e) {
      console.error("Firebase sync error:", e);
      showNotification("Sync Warning", "Completed connection. Some items did not sync: " + e.message);
    }
  }

  document.getElementById('settings-theme-toggle').addEventListener('change', toggleTheme);

  document.getElementById('settings-auto-sync').addEventListener('change', (e) => {
    auth.updateSettings({ federatedSync: e.target.checked });
  });

  document.getElementById('settings-diff-priv').addEventListener('change', (e) => {
    auth.updateSettings({ differentialPrivacy: e.target.checked });
  });

  document.getElementById('settings-speech-out').addEventListener('change', (e) => {
    auth.updateSettings({ speechOutput: e.target.checked });
    if (!e.target.checked) {
      ai.stopSpeaking();
    }
  });

  document.getElementById('settings-offline-caching').addEventListener('change', (e) => {
    auth.updateSettings({ offlineMode: e.target.checked });
  });

  document.getElementById('settings-reset-logs-btn').addEventListener('click', () => {
    if (confirm("WARNING: This will clear local database logs, weights, streaks, and reset auth configurations. Proceed?")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  });

  // Firebase configuration connection trigger
  document.getElementById('firebase-connect-btn').addEventListener('click', async () => {
    const apiKey = document.getElementById('firebase-api-key').value.trim();
    const projectId = document.getElementById('firebase-project-id').value.trim();
    const authDomain = document.getElementById('firebase-auth-domain').value.trim();
    const appId = document.getElementById('firebase-app-id').value.trim();
    
    if (!apiKey || !projectId) {
      showNotification("Config Missing", "Please enter at least API Key and Project ID.");
      return;
    }
    
    const connectBtn = document.getElementById('firebase-connect-btn');
    const originalText = connectBtn.innerHTML;
    connectBtn.disabled = true;
    connectBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';
    
    const config = {
      apiKey,
      projectId,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      appId: appId || ""
    };
    
    try {
      await auth.connectFirebase(config);
      updateFirebaseStatusUI(true, projectId);
      showNotification("Connected", "Successfully connected to Firebase Firestore!");
      
      if (currentUser) {
        await syncLocalDataToFirebase();
      }
    } catch (err) {
      console.error(err);
      showNotification("Connection Failed", "Check credentials or network: " + err.message);
      updateFirebaseStatusUI(false);
    } finally {
      connectBtn.disabled = false;
      connectBtn.innerHTML = originalText;
    }
  });

  /* ==========================================
     Federated Sync Modal Animation & Graphs
     ========================================== */
  const flModalSyncBtn = document.getElementById('fl-modal-sync-trigger');
  const flProgressFill = document.getElementById('fl-progress-fill-bar');
  const flStatusLabel = document.getElementById('fl-progress-status-label');
  const flChartsGrid = document.getElementById('fl-modal-charts-grid');
  
  function openFederatedSyncModal() {
    flModal.style.display = 'flex';
    flChartsGrid.style.display = 'none';
    flProgressFill.style.width = '0%';
    flStatusLabel.textContent = 'Ready to begin parameter secure aggregation...';
    flModalSyncBtn.style.display = 'inline-block';
  }

  document.getElementById('fl-modal-close-btn').addEventListener('click', () => {
    flModal.style.display = 'none';
  });

  flModalSyncBtn.addEventListener('click', () => {
    flModalSyncBtn.style.display = 'none';
    
    // Trigger local simulation process
    fl.triggerAggregationCycle(
      (progress) => {
        // Step callback
        flProgressFill.style.width = `${progress.percentage}%`;
        flStatusLabel.textContent = progress.label;
      },
      (newGlobalWeights) => {
        // Complete callback
        flProgressFill.style.width = '100%';
        flStatusLabel.innerHTML = `<span style="color:#4caf50;"><i class="fa-solid fa-circle-check"></i> Federated model aggregated! Recommendations personalized.</span>`;
        
        // Show aggregation weight graphs
        flChartsGrid.style.display = 'grid';
        renderSyncCharts(newGlobalWeights);
        
        // Update variables in profile db
        localStorage.setItem('fl_last_sync_timestamp', new Date().toISOString());
        
        if (currentUser) {
          // Unlock achievement
          const update = auth.unlockAchievement(currentUser.email, 'privacy_champion');
          if (update) {
            showNotification("Achievement Unlocked! 🛡️", "Privacy Guard: Run a Secure Aggregation local update cycle.");
          }
        }
        
        // Refresh Dashboard
        renderDashboard();
      }
    );
  });

  function renderSyncCharts(globalWeights) {
    const localBars = document.getElementById('fl-local-weights-bars');
    const globalBars = document.getElementById('fl-global-weights-bars');
    
    localBars.innerHTML = '';
    globalBars.innerHTML = '';
    
    const localWeights = fl.getLocalWeights();
    
    Object.keys(localWeights).forEach(cat => {
      const valLocal = localWeights[cat];
      const valGlobal = globalWeights[cat];
      
      // Local Bar
      const lRow = document.createElement('div');
      lRow.className = 'weight-row-bar-wrap';
      lRow.innerHTML = `
        <span class="weight-row-label-text" style="width: 80px;">${cat}</span>
        <div class="weight-row-fill-bg">
          <div class="weight-row-fill-val" style="width: ${valLocal * 100}%;"></div>
        </div>
        <span style="font-weight:600; width:30px;">${Math.round(valLocal * 100)}%</span>
      `;
      localBars.appendChild(lRow);

      // Global Bar
      const gRow = document.createElement('div');
      gRow.className = 'weight-row-bar-wrap';
      gRow.innerHTML = `
        <span class="weight-row-label-text" style="width: 80px;">${cat}</span>
        <div class="weight-row-fill-bg">
          <div class="weight-row-fill-val" style="width: ${valGlobal * 100}%;"></div>
        </div>
        <span style="font-weight:600; width:30px;">${Math.round(valGlobal * 100)}%</span>
      `;
      globalBars.appendChild(gRow);
    });
  }

  /* ==========================================
     Helper Notifications Manager
     ========================================== */
  function showNotification(title, body) {
    // Web notifications or simple UI Toast alerts
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.top = '30px';
    toast.style.right = '30px';
    toast.style.zIndex = '99999';
    toast.style.padding = '20px 25px';
    toast.style.borderRadius = '16px';
    toast.style.background = 'rgba(15, 11, 41, 0.95)';
    toast.style.border = '1px solid var(--accent-cyan)';
    toast.style.boxShadow = '0 10px 30px rgba(0, 242, 254, 0.3)';
    toast.style.color = '#fff';
    toast.style.maxWidth = '360px';
    toast.style.fontFamily = 'var(--font-body)';
    toast.style.animation = 'fadeIn 0.3s ease';
    
    toast.innerHTML = `
      <div style="font-weight:700; font-family:var(--font-display); display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span class="gradient-text">${title}</span>
        <button style="background:transparent; border:none; color:#fff; font-size:1rem; cursor:pointer;" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
      <p style="font-size:0.8rem; opacity:0.85; line-height:1.4;">${body}</p>
    `;

    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 5000);

    // Turn on dot notifier indicator
    notificationsRedDot.style.display = 'block';
  }

  // Close modals clicking outside
  window.onclick = function(event) {
    if (event.target === profileEditModal) {
      profileEditModal.style.display = 'none';
    } else if (event.target === flModal) {
      flModal.style.display = 'none';
    }
  };

  /* ==========================================
     Application Startup Initializes
     ========================================== */
  initNavigation();
  loadThemeSettings();
  checkAuth();

  // Register PWA service worker offline cache handler
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('ServiceWorker registration successful with scope: ', reg.scope))
        .catch(err => console.log('ServiceWorker registration failed: ', err));
    });
  }

  // =====================================================================
  // 🟢 Global Ripple + Click Feedback (applies to ALL buttons/clickables)
  // =====================================================================
  function createRipple(event, target) {
    // Remove old ripple elements on this target
    target.querySelectorAll('.btn-ripple').forEach(r => r.remove());

    const circle = document.createElement('span');
    const diameter = Math.max(target.clientWidth, target.clientHeight);
    const rect = target.getBoundingClientRect();

    circle.classList.add('btn-ripple');
    circle.style.width  = circle.style.height = `${diameter}px`;
    circle.style.left   = `${event.clientX - rect.left - diameter / 2}px`;
    circle.style.top    = `${event.clientY - rect.top  - diameter / 2}px`;

    target.appendChild(circle);

    // Remove after animation completes
    circle.addEventListener('animationend', () => circle.remove(), { once: true });
  }

  // Delegate ripple to all buttons and clickable UI components
  const RIPPLE_SELECTORS = [
    'button',
    '.neon-btn',
    '.neon-btn-secondary',
    '.filter-btn',
    '.tab-btn',
    '.icon-btn',
    '.chat-action-btn',
    '.quiz-option-label',
    '.syllabus-item',
    '.history-chat-item',
    '.speech-btn-inline',
    '.mobile-nav-item'
  ].join(',');

  document.addEventListener('click', (e) => {
    const target = e.target.closest(RIPPLE_SELECTORS);
    if (target && !target.disabled) {
      createRipple(e, target);
    }
  }, true); // capture phase so ripple fires before other handlers

});

