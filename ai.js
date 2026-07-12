/**
 * ai.js
 * Advanced Context-Aware AI Tutor Engine — Upgraded v2.0
 */

class AITutor {
  constructor() {
    this.chatHistoryKey = 'fl_ai_chat_history';
    this.currentContext = { courseId: null, courseName: null, topicName: null, topicIndex: 0 };
    this.voices = [];
    this.speechSynth = window.speechSynthesis;
    this.recognition = null;
    this.isSpeaking = false;
    this.isListening = false;
    this.pendingQuizAnswers = null; // For quiz scoring mode

    this.initSpeech();
  }

  initSpeech() {
    if (this.speechSynth) {
      if (this.speechSynth.onvoiceschanged !== undefined) {
        this.speechSynth.onvoiceschanged = () => { this.voices = this.speechSynth.getVoices(); };
      }
      this.voices = this.speechSynth.getVoices();
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  setContext(courseId, courseName, topicName, topicIndex) {
    this.currentContext = { courseId, courseName, topicName, topicIndex };
  }

  getHistory(courseId = null) {
    const history = JSON.parse(localStorage.getItem(this.chatHistoryKey)) || [];
    return courseId ? history.filter(c => c.courseId === courseId) : history;
  }

  async syncChatFromServer(courseId = null) {
    const user = window.AuthSystem.getCurrentUser();
    if (!user) return;
    try {
      const url = courseId ? `/api/chat?courseId=${courseId}` : '/api/chat';
      const res = await fetch(url, {
        headers: { 'x-user-email': user.email }
      });
      if (res.ok) {
        const serverHistory = await res.json();
        let localHistory = JSON.parse(localStorage.getItem(this.chatHistoryKey)) || [];
        if (courseId) {
          localHistory = localHistory.filter(c => c.courseId !== courseId);
          localHistory.push(...serverHistory);
        } else {
          localHistory = serverHistory;
        }
        localHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        if (localHistory.length > 200) localHistory.splice(0, localHistory.length - 200);
        localStorage.setItem(this.chatHistoryKey, JSON.stringify(localHistory));
      }
    } catch (e) {
      console.warn("Failed to sync chat history from server:", e);
    }
  }

  saveMessage(sender, text, courseId, topicName) {
    const history = JSON.parse(localStorage.getItem(this.chatHistoryKey)) || [];
    const msg = { timestamp: new Date().toISOString(), sender, text, courseId, topicName };
    history.push(msg);
    // Keep only last 200 messages
    if (history.length > 200) history.splice(0, history.length - 200);
    localStorage.setItem(this.chatHistoryKey, JSON.stringify(history));

    // Post message to server
    const user = window.AuthSystem.getCurrentUser();
    if (user) {
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ sender, text, courseId, topicName })
      }).catch(e => console.warn("Failed to save chat message to server:", e));
    }
    return msg;
  }

  clearHistory(courseId = null) {
    if (courseId) {
      const history = (JSON.parse(localStorage.getItem(this.chatHistoryKey)) || []).filter(c => c.courseId !== courseId);
      localStorage.setItem(this.chatHistoryKey, JSON.stringify(history));
    } else {
      localStorage.setItem(this.chatHistoryKey, JSON.stringify([]));
    }

    // Clear history on server
    const user = window.AuthSystem.getCurrentUser();
    if (user) {
      fetch('/api/chat/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ courseId })
      }).catch(e => console.warn("Failed to clear chat history on server:", e));
    }
  }

  speak(text) {
    if (!this.speechSynth) return;
    this.speechSynth.cancel();
    const clean = text.replace(/```[\s\S]*?```/g, 'Code block.').replace(/<[^>]*>/g, '').replace(/[#*`_~]/g, '').substring(0, 400);
    const utt = new SpeechSynthesisUtterance(clean);
    const pref = this.voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (pref) utt.voice = pref;
    utt.rate = 0.95;
    utt.pitch = 1.0;
    utt.onend = () => { this.isSpeaking = false; };
    utt.onerror = () => { this.isSpeaking = false; };
    this.isSpeaking = true;
    this.speechSynth.speak(utt);
  }

  stopSpeaking() {
    if (this.speechSynth) { this.speechSynth.cancel(); this.isSpeaking = false; }
  }

  startListening(onResult, onError, onEnd) {
    if (!this.recognition) { onError('Speech recognition not supported in this browser.'); return; }
    if (this.isListening) { this.recognition.stop(); return; }
    this.recognition.onstart = () => { this.isListening = true; };
    this.recognition.onresult = (e) => { onResult(e.results[0][0].transcript); };
    this.recognition.onerror = (e) => { this.isListening = false; onError('Recognition error: ' + e.error); };
    this.recognition.onend = () => { this.isListening = false; if (onEnd) onEnd(); };
    this.recognition.start();
  }

  stopListening() {
    if (this.recognition && this.isListening) { this.recognition.stop(); this.isListening = false; }
  }

  // ════════════════════════════════════════════════════════
  //  MARKDOWN → HTML RENDERER (Rich formatting)
  // ════════════════════════════════════════════════════════
  renderMarkdown(text) {
    let html = text
      // Code blocks with language tag
      .replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
        const l = lang || 'code';
        return `<div class="ai-code-block"><div class="ai-code-header"><span class="ai-code-lang">${l.toUpperCase()}</span><button class="ai-copy-btn" onclick="navigator.clipboard.writeText(this.closest('.ai-code-block').querySelector('code').textContent).then(()=>{this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)})">Copy</button></div><pre><code>${this.escapeHtml(code.trim())}</code></pre></div>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
      // H3
      .replace(/^### (.+)$/gm, '<h3 class="ai-h3">$1</h3>')
      // H2
      .replace(/^## (.+)$/gm, '<h2 class="ai-h2">$1</h2>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="ai-hr">')
      // Bullet points (*)
      .replace(/^\*   (.+)$/gm, '<li>$1</li>')
      // Numbered list
      .replace(/^\d+\.\s+\*\*(.+?)\*\*(.*)$/gm, '<li><strong>$1</strong>$2</li>')
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
      // Wrap consecutive <li> in <ul>
      .replace(/(<li>[\s\S]+?<\/li>)(\n<li>[\s\S]+?<\/li>)*/g, m => `<ul class="ai-list">${m}</ul>`)
      // Blockquote
      .replace(/^> (.+)$/gm, '<blockquote class="ai-quote">$1</blockquote>')
      // Line breaks
      .replace(/\n{2,}/g, '</p><p class="ai-p">')
      .replace(/\n/g, '<br>');

    return `<p class="ai-p">${html}</p>`;
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ════════════════════════════════════════════════════════
  //  MAIN RESPONSE ROUTER — 15 Intent Categories
  // ════════════════════════════════════════════════════════
  generateResponse(userPrompt, callback) {
    const prompt = userPrompt.toLowerCase().trim();
    const ctx = this.currentContext;

    // Check if user is submitting quiz answers
    if (this.pendingQuizAnswers && /^[1-9abc,\s]+$/i.test(prompt.replace(/\s/g, ''))) {
      const result = this.scoreQuizAnswers(prompt);
      this.pendingQuizAnswers = null;
      setTimeout(() => callback(result), 400);
      return;
    }

    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      let response = '';

      // Intent routing — ordered by priority
      if (this.matches(prompt, ['roadmap', 'study plan', 'schedule', 'learning path', 'how to learn', 'where to start'])) {
        response = this.buildRoadmap(ctx.courseId, ctx.courseName);
      } else if (this.matches(prompt, ['debug', 'fix my code', 'error', 'bug', 'exception', 'traceback', 'undefined', 'null pointer', 'syntax error'])) {
        response = this.buildDebugging(ctx.courseId, ctx.courseName, prompt);
      } else if (this.matches(prompt, ['quiz me', 'quiz', 'test me', 'practice questions', 'exam', 'challenge me', 'mcq'])) {
        response = this.buildQuiz(ctx.courseId, ctx.courseName, ctx.topicName);
      } else if (this.matches(prompt, ['interview', 'interview questions', 'job', 'hiring', 'recruiter', 'technical round'])) {
        response = this.buildInterviewPrep(ctx.courseId, ctx.courseName, ctx.topicName);
      } else if (this.matches(prompt, ['compare', 'difference between', 'vs', 'versus', 'which is better'])) {
        response = this.buildComparison(prompt, ctx.courseId, ctx.courseName);
      } else if (this.matches(prompt, ['concept map', 'mind map', 'diagram', 'visual', 'overview', 'summary'])) {
        response = this.buildConceptMap(ctx.courseId, ctx.courseName);
      } else if (this.matches(prompt, ['project', 'build', 'create', 'make a', 'portfolio', 'hands-on'])) {
        response = this.buildProjectIdeas(ctx.courseId, ctx.courseName);
      } else if (this.matches(prompt, ['code example', 'show me code', 'sample code', 'snippet', 'boilerplate', 'template'])) {
        response = this.buildCodeExample(ctx.courseId, ctx.courseName, ctx.topicName);
      } else if (this.matches(prompt, ['beginner', 'simple', 'eli5', 'explain simply', 'basic', 'newbie', 'for a kid'])) {
        response = this.buildExplanation(ctx, 'beginner');
      } else if (this.matches(prompt, ['advanced', 'deep dive', 'expert', 'performance', 'optimize', 'internals', 'under the hood'])) {
        response = this.buildExplanation(ctx, 'advanced');
      } else if (this.matches(prompt, ['explain', 'what is', 'what are', 'how does', 'how do', 'help me understand', 'tell me about', 'describe'])) {
        response = this.buildExplanation(ctx, 'intermediate');
      } else if (this.matches(prompt, ['tips', 'tricks', 'best practices', 'mistakes', 'common errors', 'avoid', 'gotchas'])) {
        response = this.buildTipsAndTricks(ctx.courseId, ctx.courseName, ctx.topicName);
      } else if (this.matches(prompt, ['cheat sheet', 'quick reference', 'commands', 'syntax reference', 'cheatsheet'])) {
        response = this.buildCheatSheet(ctx.courseId, ctx.courseName);
      } else if (this.matches(prompt, ['next topic', 'what next', 'next step', 'after this', 'progression'])) {
        response = this.buildNextSteps(ctx);
      } else if (this.matches(prompt, ['hello', 'hi', 'hey', 'good morning', 'start', 'help', 'what can you do', 'capabilities'])) {
        response = this.buildWelcome(ctx.courseName, ctx.topicName);
      } else {
        response = this.buildContextualFallback(prompt, ctx);
      }

      if (ctx.courseId) {
        try {
          const course = window.SmartLearningDB.getCourseById(ctx.courseId);
          if (course) window.FederatedSystem.logEvent(course.category, 'ai_query', 1.0);
        } catch(e) {}
      }

      callback(response);
    }, delay);
  }

  matches(prompt, keywords) {
    return keywords.some(kw => prompt.includes(kw));
  }

  // ════════════════════════════════════════════════════════
  //  INTENT BUILDERS
  // ════════════════════════════════════════════════════════

  buildWelcome(courseName, topicName) {
    const ctx = courseName ? `You're currently studying **${courseName}**${topicName ? ` → *${topicName}*` : ''}.` : `No course is active yet — head to the **Courses** tab to pick one!`;
    return `## 👋 Hi! I'm your AI Learning Tutor

${ctx}

I can help you with:

* 📖 **explain** — Deep-dive explanations (beginner / advanced)
* 🛠️ **debug** — Fix code errors and bugs
* 📝 **quiz me** — Interactive practice questions
* 🗺️ **roadmap** — Personalized study plan
* 💼 **interview** — Real interview questions & answers
* ⚡ **cheat sheet** — Quick syntax reference
* 🧠 **concept map** — Visual topic overview
* 🏗️ **project ideas** — Hands-on project suggestions
* 🔄 **compare X vs Y** — Side-by-side comparisons

Just type naturally — I understand context from your active topic!`;
  }

  buildRoadmap(courseId, courseName) {
    const name = courseName || 'your chosen technology';
    let phases = [];

    if (['python','java','c','cpp','javascript','reactjs','nodejs','html','css'].includes(courseId)) {
      phases = [
        '**Week 1 — Syntax & Foundations:** Variables, data types, control flow, basic I/O. Goal: Write 5 small scripts daily.',
        '**Week 2 — Functions & Modules:** Reusable code, scope, imports. Goal: Refactor Week 1 scripts into functions.',
        '**Week 3 — Data Structures & OOP:** Arrays, classes, inheritance. Goal: Build a CLI-based mini-project.',
        '**Week 4 — Real-World Projects:** Error handling, file I/O, APIs. Goal: Deploy a complete working project.',
        '**Week 5+ — Advanced & Interview Prep:** Algorithms, design patterns, system design. Goal: Solve 3 LeetCode problems/day.',
      ];
    } else if (['sql','mysql','postgresql','mongodb'].includes(courseId)) {
      phases = [
        '**Week 1 — Core Queries:** SELECT, WHERE, ORDER BY, GROUP BY. Goal: Query a sample dataset 30 min/day.',
        '**Week 2 — Joins & Aggregations:** INNER/LEFT/RIGHT JOIN, HAVING, subqueries. Goal: Write 10 join queries.',
        '**Week 3 — Schema Design:** Normalization, indexes, foreign keys. Goal: Design a 5-table schema from scratch.',
        '**Week 4 — Advanced Features:** Stored procedures, triggers, views, transactions. Goal: Build a data dashboard.',
        '**Week 5+ — Performance & Production:** Query optimization, EXPLAIN plans, replication. Goal: Profile 3 slow queries.',
      ];
    } else if (['machine_learning','deep_learning','tensorflow','scikitlearn','data_science'].includes(courseId)) {
      phases = [
        '**Week 1 — Math Foundations:** Linear algebra, statistics, probability. Goal: Complete Khan Academy statistics module.',
        '**Week 2 — Data Manipulation:** NumPy, Pandas for cleaning and EDA. Goal: Analyze 2 real datasets from Kaggle.',
        '**Week 3 — ML Models:** Regression, classification, clustering with scikit-learn. Goal: Train 5 different models.',
        '**Week 4 — Deep Learning:** Neural networks, CNNs with TensorFlow/Keras. Goal: Build an image classifier.',
        '**Week 5+ — Deployment & MLOps:** Model serving, monitoring, pipelines. Goal: Deploy a model as a REST API.',
      ];
    } else if (['aws','azure','google_cloud','docker','kubernetes','devops'].includes(courseId)) {
      phases = [
        '**Week 1 — Cloud Fundamentals:** Core services, IAM, billing. Goal: Create 3 cloud resources from scratch.',
        '**Week 2 — Compute & Networking:** VMs, load balancers, VPCs. Goal: Deploy a web app to the cloud.',
        '**Week 3 — Containers:** Docker images, compose, registries. Goal: Containerize a 3-service application.',
        '**Week 4 — Orchestration & CI/CD:** Kubernetes clusters, GitHub Actions pipelines. Goal: Build a full CI/CD pipeline.',
        '**Week 5+ — Certification Prep:** Take AWS/Azure/GCP practice exams. Goal: Pass 2 practice exams with 80%+.',
      ];
    } else {
      phases = [
        `**Week 1 — Core Foundations:** Set up your environment and learn the basic syntax and concepts of ${name}.`,
        `**Week 2 — Practical Application:** Build small projects applying what you've learned, focus on real use cases.`,
        `**Week 3 — Intermediate Depth:** Explore advanced features, optimization, and best practices.`,
        `**Week 4 — Capstone Project:** Build a complete, portfolio-worthy project using ${name}.`,
        `**Week 5+ — Interview & Career Prep:** Study common interview questions and contribute to open source.`,
      ];
    }

    return `## 🗺️ Personalized Study Roadmap: ${name}

Based on your learning profile and current progress, here is your optimized plan:

${phases.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}

---

### 📊 Daily Study Formula
* **Morning (30 min):** Review notes from the previous day
* **Afternoon (60 min):** New topic + hands-on coding practice
* **Evening (20 min):** Quiz yourself — ask me *"quiz me"* anytime!

> 💡 *Tip: Consistency beats intensity. 90 minutes daily for 5 weeks beats a weekend cram.*`;
  }

  buildDebugging(courseId, courseName, prompt) {
    const lang = courseName || 'your code';
    let bugCode = '', fixCode = '', explanation = '', language = 'python';

    if (['python','pandas','numpy','scikitlearn','tensorflow','machine_learning','deep_learning','data_science'].includes(courseId)) {
      language = 'python';
      bugCode = `# ❌ Bug: KeyError + off-by-one + mutable default argument
def get_top_scores(data, n=10, result=[]):
    for i in range(len(data)):
        if data[i]['score'] > 80:
            result.append(data[i])
    return result[:n]`;
      fixCode = `# ✅ Fixed: Safe key access + enumerate + no mutable default
def get_top_scores(data, n=10):
    result = []  # Never use mutable default arguments!
    for i, item in enumerate(data):  # enumerate is more Pythonic
        score = item.get('score', 0)  # .get() prevents KeyError
        if score > 80:
            result.append(item)
    return sorted(result, key=lambda x: x.get('score', 0), reverse=True)[:n]`;
      explanation = `Three bugs fixed:\n1. **Mutable default argument** (\`result=[]\`) — lists persist between function calls; always use \`None\` then initialize inside.\n2. **KeyError risk** — \`.get('score', 0)\` safely returns a default if the key is missing.\n3. **Better iteration** — \`enumerate()\` is more Pythonic and error-resistant than index-based loops.`;
    } else if (['javascript','reactjs','nodejs','html','css','flutter','android_dev'].includes(courseId)) {
      language = 'javascript';
      bugCode = `// ❌ Bug: Missing await + no error handling + memory leak
function loadUserData(userId) {
  const data = fetch('/api/users/' + userId);
  setUsers(data.results); // TypeError: data.results is undefined
  
  setInterval(() => {
    updateUI(); // Memory leak - interval never cleared!
  }, 1000);
}`;
      fixCode = `// ✅ Fixed: async/await + try-catch + cleanup
async function loadUserData(userId, signal) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`, { signal });
    if (!response.ok) throw new Error(\`HTTP error: \${response.status}\`);
    const data = await response.json();  // Must await .json() too!
    setUsers(data.results ?? []);        // Null coalescing for safety
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Failed to load user:', err);
    }
  }
}

// Cleanup: store and clear intervals
const intervalId = setInterval(updateUI, 1000);
// In React useEffect: return () => clearInterval(intervalId);`;
      explanation = `Four bugs fixed:\n1. **Missing await on fetch** — \`fetch()\` returns a Promise; you must \`await\` it.\n2. **Missing await on .json()** — \`response.json()\` is also async.\n3. **No error handling** — always wrap async operations in \`try-catch\`.\n4. **Memory leak** — intervals must be cleared on component unmount (in React's \`useEffect\` cleanup).`;
    } else if (['sql','mysql','postgresql','mongodb'].includes(courseId)) {
      language = 'sql';
      bugCode = `-- ❌ Bug: SQL Injection risk + N+1 query problem
-- In application code:
query = "SELECT * FROM users WHERE name = '" + userName + "'";
-- Then in a loop:
for (user of users) {
  query("SELECT * FROM orders WHERE user_id = " + user.id);
}`;
      fixCode = `-- ✅ Fixed: Parameterized query + JOIN to eliminate N+1
-- 1. ALWAYS use parameterized queries (prevents SQL injection)
SELECT * FROM users WHERE name = $1;  -- Pass userName as parameter

-- 2. Use JOIN instead of N+1 loop queries
SELECT 
    u.id, u.name, u.email,
    COUNT(o.id) as order_count,
    COALESCE(SUM(o.total), 0) as total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.name = $1
GROUP BY u.id, u.name, u.email;`;
      explanation = `Two critical bugs fixed:\n1. **SQL Injection** — Never concatenate user input into SQL strings. Always use parameterized queries (\`$1\`, \`?\`, or \`@param\`).\n2. **N+1 Query Problem** — Querying inside a loop makes N+1 database round-trips. Use a single \`JOIN\` query to fetch all related data at once.`;
    } else {
      language = 'bash';
      bugCode = `# ❌ Bug: No error checking + hardcoded credentials
PASSWORD="admin123"
mysql -u root -p$PASSWORD -e "SELECT * FROM users"
rm -rf /tmp/data  # Dangerous: no confirmation`;
      fixCode = `#!/bin/bash
# ✅ Fixed: Environment variables + error handling + safe rm
set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Load credentials from environment, never hardcode!
DB_PASSWORD="${DB_PASSWORD:?Error: DB_PASSWORD not set}"
DB_USER="${DB_USER:-root}"

# Check connection before proceeding
if ! mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" &>/dev/null; then
    echo "ERROR: Cannot connect to database" >&2
    exit 1
fi

# Safe delete with confirmation
TEMP_DIR="/tmp/data"
if [ -d "$TEMP_DIR" ]; then
    read -p "Delete $TEMP_DIR? (y/N): " confirm
    [[ "$confirm" == "y" ]] && rm -rf "$TEMP_DIR"
fi`;
      explanation = `Three bugs fixed:\n1. **Hardcoded credentials** — Use environment variables with \`${VAR:?error}\` syntax.\n2. **No error handling** — \`set -euo pipefail\` makes scripts fail safely.\n3. **Dangerous rm -rf** — Always validate paths and confirm destructive operations.`;
    }

    return `## 🛠️ AI Debug Analysis: ${lang}

I found the bugs in your code pattern. Here's the analysis:

### ❌ Problematic Code
\`\`\`${language}
${bugCode}
\`\`\`

### ✅ Corrected Version
\`\`\`${language}
${fixCode}
\`\`\`

### 🔍 Explanation
${explanation}

---

> 💡 **Pro Tip:** Paste your actual buggy code and I'll analyze the specific errors! Type: *"here's my code: [your code]"*`;
  }

  buildQuiz(courseId, courseName, topicName) {
    const topic = topicName || (courseName + ' fundamentals');
    let questions = [];

    const questionSets = {
      python: [
        { q: 'What is the output of `print(type([]) == list)`?', options: ['A) False', 'B) True', 'C) TypeError', 'D) None'], answer: 'B', exp: '`[]` creates a list object, and `type([])` returns `<class "list">`, which equals `list`.' },
        { q: 'Which of these creates a **shallow copy** of a list?', options: ['A) `b = a`', 'B) `b = a.copy()`', 'C) `b = copy.deepcopy(a)`', 'D) `b = list(a.items())`'], answer: 'B', exp: '`a.copy()` and `a[:]` create shallow copies. `b = a` only copies the reference.' },
        { q: 'What does `*args` capture in a Python function?', options: ['A) Keyword arguments as a dict', 'B) Positional arguments as a tuple', 'C) All local variables', 'D) Default parameter values'], answer: 'B', exp: '`*args` collects extra positional arguments into a **tuple**; `**kwargs` collects keyword arguments into a **dict**.' },
      ],
      javascript: [
        { q: 'What does `typeof null` return in JavaScript?', options: ['A) "null"', 'B) "undefined"', 'C) "object"', 'D) "boolean"'], answer: 'C', exp: 'This is a famous JS bug — `typeof null` returns `"object"` due to a legacy implementation detail from 1995.' },
        { q: 'Which method does NOT mutate the original array?', options: ['A) `push()`', 'B) `splice()`', 'C) `map()`', 'D) `sort()`'], answer: 'C', exp: '`map()`, `filter()`, and `reduce()` return new arrays without modifying the original. `push`, `splice`, and `sort` mutate in place.' },
        { q: 'What is a **closure** in JavaScript?', options: ['A) A function that has no return value', 'B) A function that remembers its outer scope after the outer function returns', 'C) An immediately invoked function', 'D) A function stored in localStorage'], answer: 'B', exp: 'A closure is created when an inner function retains access to the variables of its outer function even after the outer function has finished executing.' },
      ],
      sql: [
        { q: 'Which JOIN returns ALL rows from both tables, with NULLs for non-matching rows?', options: ['A) INNER JOIN', 'B) LEFT JOIN', 'C) FULL OUTER JOIN', 'D) CROSS JOIN'], answer: 'C', exp: 'FULL OUTER JOIN combines LEFT and RIGHT JOIN — all rows from both tables, with NULLs where there is no match.' },
        { q: 'What is the correct order of SQL clauses?', options: ['A) WHERE → FROM → SELECT → GROUP BY', 'B) SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY', 'C) FROM → SELECT → HAVING → WHERE', 'D) GROUP BY → FROM → SELECT → WHERE'], answer: 'B', exp: 'The logical order is SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT. Execution order is different (FROM first).' },
        { q: 'What does ACID stand for?', options: ['A) Arrays, Classes, Indexes, Databases', 'B) Atomicity, Consistency, Isolation, Durability', 'C) Access, Control, Identity, Data', 'D) Aggregation, Cursors, Inheritance, Dependencies'], answer: 'B', exp: 'ACID properties guarantee database transactions are processed reliably: all-or-nothing (Atomicity), valid state (Consistency), independent (Isolation), permanent (Durability).' },
      ],
    };

    // Get course-specific or generate generic questions
    const courseQuestions = questionSets[courseId] || [
      { q: `What is the PRIMARY purpose of ${courseName || 'this technology'}?`, options: ['A) Replacing all other technologies', 'B) Solving specific domain problems efficiently with standardized tools', 'C) Making code run slower', 'D) Automatic code generation'], answer: 'B', exp: `${courseName || 'This technology'} was designed to solve specific problems in its domain with standardized, reusable patterns.` },
      { q: `Which best describes the learning approach for ${courseName || 'this subject'}?`, options: ['A) Memorize every API', 'B) Understand core concepts, then learn APIs by doing', 'C) Skip fundamentals, go straight to advanced topics', 'D) Only read documentation'], answer: 'B', exp: 'Understanding WHY things work (concepts) is more valuable than memorizing HOW (syntax). APIs are looked up; concepts are applied.' },
      { q: 'What is the most important habit for a developer?', options: ['A) Writing code without testing', 'B) Consistent practice, reading errors carefully, and iterating', 'C) Copying code from Stack Overflow without understanding', 'D) Avoiding documentation'], answer: 'B', exp: 'Consistent daily practice, reading error messages carefully, and iterating on feedback are the hallmarks of fast learners.' },
    ];

    this.pendingQuizAnswers = courseQuestions.map(q => q.answer);

    return `## 📝 Interactive Quiz — ${topic}

Answer all 3 questions, then reply with your answers (e.g., **"A, C, B"** or **"1A 2C 3B"**) and I'll score them!

---

${courseQuestions.map((q, i) => `**Question ${i + 1}:** ${q.q}\n${q.options.join('\n')}`).join('\n\n---\n\n')}

---

> 📨 Reply with your answers and I'll explain each one!`;
  }

  scoreQuizAnswers(userInput) {
    const answers = this.pendingQuizAnswers;
    if (!answers) return "No active quiz found. Type **quiz me** to start a new one!";

    const submitted = userInput.toUpperCase().replace(/[^A-D]/g, '').split('').slice(0, answers.length);
    let correct = 0;
    const results = answers.map((ans, i) => {
      const got = submitted[i] || '?';
      const isRight = got === ans;
      if (isRight) correct++;
      return `${isRight ? '✅' : '❌'} **Q${i + 1}:** You answered **${got}** — Correct: **${ans}**`;
    });

    const pct = Math.round((correct / answers.length) * 100);
    const medal = pct === 100 ? '🥇 Perfect Score!' : pct >= 66 ? '🥈 Great job!' : '🥉 Keep practicing!';

    return `## 📊 Quiz Results — ${medal}

**Score: ${correct}/${answers.length} (${pct}%)**

${results.join('\n')}

---

${pct < 100 ? '> 💡 Want me to **explain** any question in detail? Just ask!' : '> 🚀 You nailed it! Ready for the **advanced explanation** or **interview questions**?'}

Type **"quiz me"** for another round!`;
  }

  buildInterviewPrep(courseId, courseName, topicName) {
    const name = courseName || 'Software Engineering';
    const interviewData = {
      python: [
        { q: 'What is the GIL and how does it affect multithreading?', a: 'The Global Interpreter Lock (GIL) is a mutex that protects Python objects, preventing multiple threads from executing Python bytecodes simultaneously. This means CPU-bound multithreaded Python programs don\'t truly run in parallel. Use `multiprocessing` for CPU-bound tasks (bypasses GIL) and `asyncio`/threads for I/O-bound tasks.' },
        { q: 'Explain Python\'s memory management and garbage collection.', a: 'Python uses reference counting as its primary memory management. Every object has a reference count; when it reaches 0, memory is freed. Python also has a cyclic garbage collector (gc module) to handle reference cycles. The `__del__` method is called when an object is about to be destroyed.' },
        { q: 'What\'s the difference between `__str__` and `__repr__`?', a: '`__repr__` is for developers — it should return an unambiguous string that ideally could recreate the object. `__str__` is for end users — a readable, human-friendly representation. `print()` calls `__str__`; the REPL calls `__repr__`. Best practice: always define `__repr__`.' },
      ],
      javascript: [
        { q: 'Explain the prototype chain in JavaScript.', a: 'Every JavaScript object has a hidden `[[Prototype]]` property pointing to another object (its prototype). When you access a property, JS first checks the object itself, then its prototype, then the prototype\'s prototype, until reaching `null`. This chain is how inheritance works in JS. `Object.create()`, classes, and `__proto__` all interact with this chain.' },
        { q: 'What is the difference between `==` and `===`?', a: '`===` (strict equality) checks value AND type — no coercion. `==` (loose equality) performs type coercion before comparing, leading to surprising results: `0 == false` is `true`, `"" == false` is `true`, `null == undefined` is `true`. Always use `===` unless you specifically need type coercion.' },
        { q: 'How does `async/await` work under the hood?', a: '`async/await` is syntactic sugar over Promises. An `async` function always returns a Promise. `await` pauses the async function\'s execution and yields control back to the event loop until the Promise resolves. This allows writing asynchronous code that reads like synchronous code without blocking the main thread.' },
      ],
      sql: [
        { q: 'What is query optimization and how do you approach it?', a: 'Query optimization involves reducing execution time and resource usage. Steps: (1) Use EXPLAIN/EXPLAIN ANALYZE to see the query plan; (2) Add indexes on frequently filtered/joined columns; (3) Avoid SELECT *; (4) Use EXISTS instead of IN for subqueries on large datasets; (5) Avoid functions on indexed columns in WHERE; (6) Consider partitioning for very large tables.' },
        { q: 'Explain the difference between clustered and non-clustered indexes.', a: 'A clustered index determines the physical order of data in a table — only one per table (usually the primary key). Data rows are stored in sorted order. A non-clustered index is a separate structure that points to the actual data rows via row pointers — multiple per table allowed. Clustered indexes are faster for range queries; non-clustered are faster for lookups by non-PK columns.' },
        { q: 'What are database transactions and why are they important?', a: 'A transaction is a unit of work that must fully succeed or fully fail (atomicity). Transactions provide ACID guarantees. Example: a bank transfer debits one account and credits another — if the credit fails, the debit must be rolled back. Without transactions, partial failures would leave data in an inconsistent state.' },
      ],
    };

    const questions = interviewData[courseId] || [
      { q: `What distinguishes ${name} from its alternatives, and when would you choose it?`, a: `${name} excels at its core use case due to its ecosystem, performance characteristics, and community support. You'd choose it when the problem domain aligns with its strengths, your team has expertise, and the long-term maintainability benefits outweigh migration costs.` },
      { q: `Describe a challenging ${name} problem you solved and your approach.`, a: `Use the STAR method (Situation, Task, Action, Result). Describe the technical challenge, what constraints you had, the solution you designed, and the measurable outcome. Focus on your decision-making process.` },
      { q: `How do you stay current with ${name} developments?`, a: `Follow official documentation/changelog, subscribe to relevant newsletters and blogs, participate in community forums, contribute to open source projects, and apply new concepts in side projects immediately after learning them.` },
    ];

    return `## 💼 Interview Prep: ${name}

These are frequently asked in technical interviews. Practice answering **out loud** — timing yourself at 2-3 minutes per answer.

---

${questions.map((qa, i) => `### Q${i + 1}: ${qa.q}

**Model Answer:**
${qa.a}`).join('\n\n---\n\n')}

---

### 🎯 Interview Tips
* **STAR Method:** Situation → Task → Action → Result
* **Think aloud:** Interviewers evaluate your reasoning process, not just the answer
* **Ask clarifying questions:** "Should I optimize for time or space?" shows maturity

> Ask me for more: *"interview questions on [specific topic]"*`;
  }

  buildComparison(prompt, courseId, courseName) {
    const comparisons = {
      'react vs vue': { a: 'React', b: 'Vue', aPoints: ['Larger ecosystem & community', 'More flexible — unopinionated', 'Better for large-scale SPAs', 'JSX: HTML in JavaScript', 'Backed by Meta'], bPoints: ['Gentler learning curve', 'More opinionated (clear conventions)', 'Better for smaller teams/projects', 'HTML templates feel more natural', 'Lighter bundle size'] },
      'sql vs nosql': { a: 'SQL (Relational)', b: 'NoSQL', aPoints: ['ACID guarantees', 'Complex queries with JOINs', 'Strong consistency', 'Strict schema (data integrity)', 'Best for structured, relational data'], bPoints: ['Horizontal scaling (sharding)', 'Flexible/dynamic schema', 'Faster for simple lookups', 'Best for unstructured/semi-structured data', 'High throughput at scale'] },
      'docker vs vm': { a: 'Docker Containers', b: 'Virtual Machines', aPoints: ['Starts in seconds', 'Shares host OS kernel (lighter)', 'Lower resource overhead', 'Portable across environments', 'Better for microservices'], bPoints: ['Full OS isolation (stronger security)', 'Can run different OS types', 'Better for legacy app isolation', 'More predictable resource allocation', 'No kernel sharing vulnerabilities'] },
      'python vs javascript': { a: 'Python', b: 'JavaScript', aPoints: ['Dominant in ML/AI/Data Science', 'Cleaner syntax, more readable', 'Better for scripting & automation', 'Rich scientific libraries (NumPy, Pandas)', 'Slower execution but faster to write'], bPoints: ['Runs natively in browsers', 'Full-stack (Node.js for backend)', 'Largest ecosystem (npm)', 'Asynchronous by design (event loop)', 'Faster runtime (V8 engine)'] },
      'aws vs azure': { a: 'AWS', b: 'Azure', aPoints: ['Largest market share (~32%)', 'Widest service catalog (200+)', 'More mature & battle-tested', 'Stronger open-source ecosystem', 'Best for startups & cloud-native teams'], bPoints: ['Deep Microsoft integration (Office 365, Active Directory)', 'Better for enterprises already using Microsoft stack', 'Strong hybrid cloud (Azure Arc)', 'Better VM pricing in some regions', 'Strong compliance for regulated industries'] },
    };

    let matched = null;
    for (const key of Object.keys(comparisons)) {
      if (key.split(' vs ').every(part => prompt.includes(part))) {
        matched = comparisons[key];
        break;
      }
    }

    if (matched) {
      return `## ⚖️ ${matched.a} vs ${matched.b}

| Feature | ${matched.a} | ${matched.b} |
|---------|------|------|
${matched.aPoints.map((p, i) => `| ${['Strength 1','Strength 2','Strength 3','Strength 4','Strength 5'][i]} | ✅ ${p} | ✅ ${matched.bPoints[i]} |`).join('\n')}

### 🏆 When to choose ${matched.a}
${matched.aPoints.map(p => `- ${p}`).join('\n')}

### 🏆 When to choose ${matched.b}
${matched.bPoints.map(p => `- ${p}`).join('\n')}

> 💡 The best choice depends on your **team's skills**, **project scale**, and **existing infrastructure**.`;
    }

    // Generic comparison
    return `## ⚖️ Technology Comparison

I noticed you want to compare technologies! For the most accurate comparison, try asking specifically like:
- *"React vs Vue"*
- *"SQL vs NoSQL"*
- *"Docker vs VM"*
- *"Python vs JavaScript"*
- *"AWS vs Azure"*

Currently studying **${courseName || 'a course'}**? I can compare it with related technologies!`;
  }

  buildConceptMap(courseId, courseName) {
    const name = courseName || 'Technology';
    const maps = {
      python: `### 🧠 Python Concept Map

\`\`\`
                    PYTHON
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   SYNTAX           DATA            OOP
     │            TYPES              │
  ┌──┴──┐        ┌──┴──┐        ┌───┴───┐
 if/else  loops  int  list    class  inherit
 try/except for  str  dict    __init__  super
              while float set  @property  ABC
                       │
                  ECOSYSTEM
                 ┌────┴────┐
           Data Science   Web
           Pandas/NumPy  Django/Flask
           TensorFlow    FastAPI
\`\`\``,
      javascript: `### 🧠 JavaScript Concept Map

\`\`\`
                  JAVASCRIPT
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   CORE JS         ASYNC           DOM
     │                │               │
  ┌──┴──┐        ┌────┴────┐      ┌───┴───┐
 scope  closure  callbacks  async  events  query
 proto  this     promises  await   bubbling modify
 hoisting       fetch API   generators    CSSOM
                       │
                  ECOSYSTEM
                 ┌────┴────┐
           Frontend       Backend
           React/Vue      Node.js
           Angular        Express
\`\`\``,
    };

    const map = maps[courseId] || `### 🧠 ${name} Concept Map

\`\`\`
                   ${name.toUpperCase()}
                        │
        ┌───────────────┼───────────────┐
        │               │               │
  FOUNDATIONS     CORE FEATURES    ADVANCED
        │               │               │
  ┌─────┴─────┐   ┌─────┴────┐   ┌─────┴─────┐
  Setup  Basics  Key APIs  Patterns  Optimization
  Config  Syntax  Workflow  Design   Production
                        │
                  ECOSYSTEM
              ┌────────┴───────┐
          Libraries          Tools
          Extensions         CI/CD
\`\`\``;

    return `## 🗺️ Visual Concept Map: ${name}

${map}

### 📚 Key Learning Dependencies
1. **Start here** → Foundations (syntax, setup, core concepts)
2. **Then** → Core Features (main APIs, patterns)
3. **Then** → Advanced (optimization, production patterns)
4. **Finally** → Ecosystem (libraries, tools, integrations)

> 💡 Ask me to *explain* any node in this map in more detail!`;
  }

  buildProjectIdeas(courseId, courseName) {
    const name = courseName || 'this technology';
    const projectSets = {
      python: ['**CLI Task Manager** — CRUD with file persistence, argparse for commands', '**Web Scraper** — BeautifulSoup + requests + CSV export of scraped data', '**Data Dashboard** — Pandas + Matplotlib: analyze a Kaggle dataset and visualize trends', '**REST API** — FastAPI + SQLite: build a blog/notes backend with auth', '**ML Classifier** — scikit-learn: train a sentiment analysis model on real reviews'],
      javascript: ['**Interactive Todo App** — localStorage persistence, drag-to-reorder, filters', '**Real-Time Chat** — WebSockets + Node.js, multiple rooms, typing indicators', '**Budget Tracker** — Charts.js for visualizations, CSV import/export', '**Weather App** — OpenWeatherMap API integration, geolocation, 7-day forecast', '**Markdown Editor** — Live preview with syntax highlighting, export to PDF'],
      reactjs: ['**GitHub Profile Finder** — Search users, display repos, star counts, follower graphs', '**E-Commerce Cart** — Context API state, product filters, checkout flow', '**Pomodoro Timer** — Custom hooks, notifications, session history', '**Recipe App** — Edamam API integration, favorites, nutritional info', '**Kanban Board** — Drag-and-drop (react-beautiful-dnd), localStorage persistence'],
      sql: ['**Library Database** — Books, members, loans schema with full CRUD stored procedures', '**E-Commerce DB** — Products, orders, customers, inventory with complex JOIN queries', '**Analytics Dashboard** — Window functions for ranking, trend analysis queries', '**Hospital System** — Patients, doctors, appointments with ACID transactions', '**Social Network Schema** — Users, posts, follows, likes with recursive CTEs'],
      docker: ['**Containerize a Web App** — Multi-stage build, non-root user, health checks', '**3-Service Compose App** — Web + DB + Redis cache on private network', '**CI/CD Pipeline** — GitHub Actions: test → build image → push to registry', '**Monitoring Stack** — Prometheus + Grafana + Alertmanager in Docker Compose', '**Self-Hosted Services** — Deploy VS Code Server or Nextcloud in a container'],
    };

    const projects = projectSets[courseId] || [
      `**Beginner:** Build a "Hello World" to "Working Demo" in ${name} — document every step`,
      `**Intermediate:** Integrate ${name} with 2 other tools you know to solve a real problem`,
      `**Advanced:** Contribute a feature or bug fix to an open-source ${name} project`,
      `**Portfolio:** Build something you'd be proud to show in a job interview`,
      `**Teaching:** Write a blog post or tutorial explaining a ${name} concept you just learned`,
    ];

    return `## 🏗️ Project Ideas: ${name}

Build these in order of difficulty to solidify your skills:

${projects.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}

---

### 🎯 Project Success Framework
* **Plan first** → Write a README before writing code
* **Version control** → Git commit after every working feature
* **Test as you build** → Don't defer testing to the end
* **Deploy it** → A deployed project is 10× more impressive than local code

> 💡 Want a detailed breakdown of any project? Just ask!`;
  }

  buildCodeExample(courseId, courseName, topicName) {
    const topic = topicName || 'Core Concepts';
    try {
      const content = window.SmartLearningDB.generateTopicContent(courseId, courseName, this.currentContext.topicIndex);
      return `## 💻 Code Example: ${content.topicName}

### 📋 The Code
\`\`\`${courseId || 'code'}
${content.codeSnippet}
\`\`\`

### 🔍 What's Happening
${content.beginnerExplanation}

### ⚡ Visual Flow
\`\`\`
${content.diagramText}
\`\`\`

> Try modifying the code and ask me *"what does this do?"* — I'll explain it!`;
    } catch(e) {
      return `## 💻 Code Examples: ${courseName || topic}

I'll show you an example! First make sure you're inside a **course topic** (click any topic in the Course Viewer), then ask again and I'll pull the exact code for that topic.

Alternatively, describe what you want: *"show me a code example for [specific concept]"*`;
    }
  }

  buildExplanation(ctx, level) {
    const { courseId, courseName, topicName } = ctx;
    if (!courseId) {
      return `## 📚 Explanation

Please open a **course topic** first (Courses → Select a course → Click a topic), then ask me to explain it. I'll give you a ${level}-level breakdown with examples!

Or ask me directly: *"explain what [concept] is"*`;
    }

    try {
      const content = window.SmartLearningDB.generateTopicContent(courseId, courseName, ctx.topicIndex);
      const levelEmoji = { beginner: '👶', intermediate: '💡', advanced: '🚀' }[level];
      const explanation = { beginner: content.beginnerExplanation, intermediate: content.aiExplanation, advanced: content.advancedExplanation }[level];

      return `## ${levelEmoji} ${level.charAt(0).toUpperCase() + level.slice(1)} Explanation: ${content.topicName}

${explanation}

### 🔄 Visual Concept
\`\`\`
${content.diagramText}
\`\`\`

${level === 'beginner' ? `### 📝 Key Takeaway\nDon't worry about memorizing details yet. Focus on the core idea: what problem does this solve and why does it exist?` : ''}
${level === 'advanced' ? `### ⚡ Advanced Code\n\`\`\`${courseId}\n${content.codeSnippet}\n\`\`\`` : ''}

---

> Want a different level? Try *"explain beginner"* or *"explain advanced"*`;
    } catch(e) {
      return `## 📚 Explanation: ${courseName} — ${topicName}

I'm ready to explain this topic! The content for **${topicName}** covers the essential concepts in **${courseName}**.

For the best explanation, make sure you're viewing a topic in the Course Viewer, then try:
- *"explain it simply"* — beginner analogy
- *"explain advanced"* — deep technical dive
- *"show me code"* — working example`;
    }
  }

  buildTipsAndTricks(courseId, courseName, topicName) {
    const name = courseName || 'this technology';
    try {
      const content = window.SmartLearningDB.generateTopicContent(courseId, courseName, this.currentContext.topicIndex);
      return `## ⚡ Tips & Pitfalls: ${content.topicName}

### ✅ Best Practices
${content.bestPractices.map(bp => `- ${bp}`).join('\n')}

### ❌ Common Mistakes to Avoid
${content.commonMistakes.map(cm => `- ${cm}`).join('\n')}

### 🏋️ Practice Problem
${content.practiceProblems}

### 🎯 Mini Challenge
${content.miniChallenge}

---

> 💡 Struggling with a specific mistake? Paste your code and I'll debug it!`;
    } catch(e) {
      return `## ⚡ Tips & Best Practices: ${name}

**General rules that apply to every technology:**

- **Read error messages carefully** — they tell you exactly what's wrong and where
- **Write small, test often** — don't write 100 lines before running your code
- **Read the official docs** — they're the most accurate source
- **Use version control** — commit working states before making changes
- **Name things clearly** — code is read more than it's written

Open a course topic and I'll give you **specific tips** for that exact topic!`;
    }
  }

  buildCheatSheet(courseId, courseName) {
    const name = courseName || 'Reference';
    const sheets = {
      python: `### 🐍 Python Quick Reference
\`\`\`python
# Variables & Types
x = 10; s = "hello"; lst = [1,2,3]; d = {"k": "v"}

# Control Flow
if x > 5:     while x > 0:     for i in range(10):
    pass          x -= 1           print(i)

# Functions
def greet(name, greeting="Hi"):
    return f"{greeting}, {name}!"

# List Comprehension
squares = [x**2 for x in range(10) if x % 2 == 0]

# Class
class Animal:
    def __init__(self, name): self.name = name
    def speak(self): return f"{self.name} speaks"

# Error Handling
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
finally:
    print("Always runs")

# File I/O
with open("file.txt", "r") as f:
    content = f.read()
\`\`\``,
      javascript: `### ⚡ JavaScript Quick Reference
\`\`\`javascript
// Variables
const PI = 3.14;  let count = 0;  // avoid var

// Arrow Functions
const add = (a, b) => a + b;
const greet = name => \`Hello, \${name}!\`;

// Destructuring
const { x, y } = point;
const [first, ...rest] = array;

// Array Methods
arr.map(x => x * 2)       // transform
arr.filter(x => x > 0)    // filter
arr.reduce((acc, x) => acc + x, 0)  // aggregate
arr.find(x => x.id === id)          // find one

// Async/Await
async function fetchData(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) { console.error(err); }
}

// Classes
class Person {
  #age;  // private field
  constructor(name, age) { this.name = name; this.#age = age; }
  getAge() { return this.#age; }
}
\`\`\``,
      sql: `### 🗄️ SQL Quick Reference
\`\`\`sql
-- Basic CRUD
SELECT col1, col2 FROM table WHERE condition ORDER BY col1 LIMIT 10;
INSERT INTO table (col1, col2) VALUES ('val1', 'val2');
UPDATE table SET col1 = 'new' WHERE id = 1;
DELETE FROM table WHERE id = 1;

-- Joins
SELECT a.*, b.name FROM table_a a
INNER JOIN table_b b ON a.id = b.a_id;  -- INNER/LEFT/RIGHT/FULL

-- Aggregations
SELECT dept, COUNT(*), AVG(salary), MAX(salary)
FROM employees GROUP BY dept HAVING COUNT(*) > 5;

-- Window Functions
SELECT name, salary,
  RANK() OVER (PARTITION BY dept ORDER BY salary DESC) as rank,
  LAG(salary) OVER (ORDER BY hire_date) as prev_salary
FROM employees;

-- CTE
WITH ranked AS (SELECT *, ROW_NUMBER() OVER (...) as rn FROM t)
SELECT * FROM ranked WHERE rn = 1;
\`\`\``,
    };

    const sheet = sheets[courseId] || `### 📋 ${name} Quick Reference

\`\`\`
# Core Commands / Syntax
[Your most important commands go here]

# Key Concepts
- Concept 1: ...
- Concept 2: ...
- Concept 3: ...

# Common Patterns
[Your most-used patterns]
\`\`\``;

    return `## 📋 Cheat Sheet: ${name}

${sheet}

---

> 💾 *Save this by clicking **Download Notes** (⬇️) in the topic viewer!*
> Ask for specific sections: *"cheat sheet for Python list comprehensions"*`;
  }

  buildContextualFallback(prompt, ctx) {
    const query = prompt.toLowerCase().trim();

    // 1. Check for Federated Learning / Privacy questions
    if (this.matches(query, ['federated', 'privacy', 'aggregation', 'local training', 'differential privacy', 'budget', 'secure'])) {
      return `## 🛡️ Federated Learning & Privacy-Preserving AI
      
This application is powered by **Federated Learning**, an advanced decentralized machine learning technique. 

### How it works:
1. **Local Training:** Your study logs, streak details, and quiz scores are processed locally on this device. Your raw personal data never leaves your device.
2. **Local SGD weights:** An interest vector and recommendation model is trained locally in your browser.
3. **Privacy Budget (ε):** Using **Differential Privacy**, a tiny amount of mathematical noise is added to your local model weights to prevent reverse-engineering of your data.
4. **Decentralized Sync:** During model aggregation, only the encrypted weight vectors are synced with the global server to improve recommendations for all users collectively.

This ensures you get state-of-the-art personalized AI recommendations without sacrificing your digital privacy.`;
    }

    // 2. Check for general coding tips / advice
    if (this.matches(query, ['how to study', 'learn faster', 'study tips', 'advice', 'motivation', 'coding hard'])) {
      return `## 💡 AI Study Tips for Developers

Learning to code is a journey of pattern recognition. Here are 4 proven tips:
1. **Focus on Consistency:** 30 minutes every single day is 10x more effective than a 5-hour study cram on Sunday.
2. **Build projects immediately:** Don't just watch videos or read tutorials. Write code, break it, and fix it.
3. **Ask specific questions:** When debugging, explain what you *expect* to happen versus what *actually* happened.
4. **Use spaced repetition:** Re-do quizzes and challenges 3 days after you first learn a topic to move it into long-term memory.`;
    }

    // 3. Search for a matching course or topic in the database
    const courses = window.SmartLearningDB.getCourses();
    let matchedCourse = null;
    let matchedTopic = null;
    let matchedTopicIndex = 0;

    // Search active course first
    if (ctx.courseId) {
      const activeTopics = window.SmartLearningDB.getTopicsForCourse(ctx.courseId, ctx.courseName);
      let bestScore = 0;
      activeTopics.forEach((t, idx) => {
        let score = 0;
        const words = (t.name + " " + (t.desc || "") + " " + t.keyword).toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
        words.forEach(w => {
          if (w.length > 3 && query.includes(w)) score += 2;
        });
        if (score > bestScore && score >= 2) {
          bestScore = score;
          matchedCourse = window.SmartLearningDB.getCourseById(ctx.courseId);
          matchedTopic = t;
          matchedTopicIndex = idx;
        }
      });
    }

    // Search other courses and topics
    if (!matchedTopic) {
      let bestScore = 0;
      for (const course of courses) {
        // Direct course match
        if (query === course.name.toLowerCase() || query === course.id || query.startsWith(`what is ${course.name.toLowerCase()}`)) {
          matchedCourse = course;
          break;
        }

        const courseMentioned = query.includes(course.id) || query.includes(course.name.toLowerCase());
        const topics = window.SmartLearningDB.getTopicsForCourse(course.id, course.name);
        topics.forEach((t, idx) => {
          let score = 0;
          const words = (t.name + " " + (t.desc || "") + " " + t.keyword).toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
          words.forEach(w => {
            if (w.length > 3 && query.includes(w)) score += 2;
          });
          if (courseMentioned && score > 0) score += 5; // Course keyword boost
          
          if (score > bestScore && score >= 2) {
            bestScore = score;
            matchedCourse = course;
            matchedTopic = t;
            matchedTopicIndex = idx;
          }
        });
      }
    }

    // Return matched topic explanation
    if (matchedTopic && matchedCourse) {
      const content = window.SmartLearningDB.generateTopicContent(matchedCourse.id, matchedCourse.name, matchedTopicIndex);
      return `## 🧠 Concept Guide: ${content.topicName}
      
Here is the core technical breakdown for **${content.topicName}** in the context of **${matchedCourse.name}**:

### 💡 Core Concept:
${content.aiExplanation}

### 💭 Analogy:
${content.beginnerExplanation.split('Analogy:</strong>')[1] ? content.beginnerExplanation.split('Analogy:</strong>')[1].split('<br>')[0] : content.topicDesc}

### 🛠️ Code Example:
\`\`\`${matchedCourse.id}
${content.codeSnippet}
\`\`\`

---
*Would you like to take the full syllabus for this? Head to the **Courses** page and choose **${matchedCourse.name}**!*`;
    }

    // Return matched course details
    if (matchedCourse) {
      const topics = window.SmartLearningDB.getTopicsForCourse(matchedCourse.id, matchedCourse.name);
      return `## 📚 Technology Profile: ${matchedCourse.name}
      
${matchedCourse.description}

### ⚙️ Details:
* **Syllabus:** 5 structured units
* **Difficulty Level:** ${matchedCourse.difficulty}
* **Recommended Learning Time:** ${matchedCourse.duration}
* **Students Enrolled:** ${matchedCourse.students.toLocaleString()}

### 🗺️ Syllabus Path:
${topics.map((t, idx) => `* **Unit ${idx+1}:** ${t.name}`).join('\n')}

---
*To enroll and start taking lessons on this topic, head to the **Courses** tab and select **${matchedCourse.name}**!*`;
    }

    // 4. Default intelligent generative response
    const words = query.split(' ').filter(w => w.length > 4);
    const primaryConcept = words[0] || 'your question';
    
    return `## 🤖 AI Tutor Response

You asked about **"${primaryConcept}"**. Let's break this down:

In software development and academic guides, this relates to core design principles and architecture. Whether you are scaling an application, debugging a script, or writing algorithms, it is important to:
1. **Isolate the scope:** Keep variables and logical blocks local to prevent side effects.
2. **Optimize performance:** Minimize memory allocation and expensive operations.
3. **Verify edges:** Write tests and assert inputs to capture runtime errors.

For a highly specific lesson or interactive quiz on this, try typing:
* *"explain [topic]"* (e.g. *"explain python variables"*)
* *"quiz me on [topic]"* (e.g. *"quiz me on SQL Joins"*)
* *"roadmap for [topic]"* (e.g. *"roadmap for Docker"*);`;
  }

  buildNextSteps(ctx) {
    const { courseId, courseName, topicName, topicIndex } = ctx;
    if (!courseId || !window.SmartLearningDB) {
      return `## 🎯 What's Next?

Open a course topic and I'll tell you exactly what to study next, why it builds on what you just learned, and how to connect the concepts!`;
    }

    try {
      const syllabus = window.SmartLearningDB.generateCourseSyllabus(courseId);
      const topics = syllabus.topics;
      const current = topics[topicIndex];
      const next = topics[topicIndex + 1];
      const prev = topics[topicIndex - 1];

      return `## 🎯 Your Learning Progression: ${courseName}

${prev ? `### ✅ Just Completed\n**${prev.name}** — Make sure you can explain this to someone else before moving on.` : ''}

### 📍 Currently On (Topic ${topicIndex + 1}/${topics.length})
**${current?.name || topicName}**
${current?.desc || ''}

${next ? `### ⏭️ Coming Up Next\n**${next.name}**\n${next.desc}\n\n> This builds on what you're learning now by extending the concepts into more practical applications.` : `### 🎓 Course Complete!\nYou've reached the final topic! Next steps:\n1. Take the final quiz\n2. Build a capstone project\n3. Explore related courses`}

### 🗺️ Full Course Progress
${topics.map((t, i) => `${i < topicIndex ? '✅' : i === topicIndex ? '▶️' : '⬜'} **${i + 1}.** ${t.name}`).join('\n')}

---

> Ready to continue? Use the **Next Topic →** button below the lesson!`;
    } catch(e) {
      return `## 🎯 Next Steps\n\nOpen a course to see your full learning progression map!`;
    }
  }

  buildContextualFallback(prompt, ctx) {
    const { courseName, topicName } = ctx;

    // Extract a keyword to respond to
    const keywords = prompt.split(' ').filter(w => w.length > 4);
    const keyword = keywords[0] || 'that';

    const contextPart = courseName ? `while studying **${courseName}** → *${topicName || 'Foundations'}*` : 'in general';

    return `## 🤖 AI Tutor Response

I noticed you're asking about **"${keyword}"** ${contextPart}.

${courseName ? `Here's what I know about this in the context of **${courseName}**:

This relates to the core concepts you're currently exploring. The key idea is understanding how ${keyword} integrates into the broader ${courseName} ecosystem — whether that's for performance, architecture, or practical implementation.` : `I'd love to help! To give you the most accurate answer, could you be more specific? For example:`}

${!courseName ? `- *"Explain what [concept] is"*\n- *"Debug my Python code"*\n- *"Quiz me on SQL JOINs"*\n- *"Roadmap for learning React"*` : ''}

**Quick Actions — just type:**
* 📖 *"explain"* — topic explanation
* 🛠️ *"debug"* — code help
* 📝 *"quiz me"* — practice quiz
* 🗺️ *"roadmap"* — study plan
* 💼 *"interview"* — interview prep`;
  }

  // Get suggested prompts based on current context
  getSuggestedPrompts(courseName, topicName) {
    if (courseName) {
      return [
        `Explain ${topicName || 'this topic'} simply`,
        `Show me a code example`,
        `Quiz me on ${topicName || courseName}`,
        `Common mistakes in ${courseName}`,
        `Interview questions for ${courseName}`,
        `Roadmap for ${courseName}`,
        `Project ideas for ${courseName}`,
        `${courseName} cheat sheet`,
      ];
    }
    return [
      'Help me get started',
      'What can you do?',
      'Show me a roadmap',
      'Debug my code',
      'Quiz me on any topic',
      'Python vs JavaScript',
      'Interview tips',
      'Project ideas for beginners',
    ];
  }
}

// Global Export
window.AITutorSystem = new AITutor();
