/**
 * db.js
 * Database and Dynamic Course Syllabus Generator Engine
 */

(function() {
  // Determine API base URL dynamically
  let apiBase = '';
  if (window.location.protocol === 'file:' || 
      (window.location.hostname === 'localhost' && window.location.port !== '8080') || 
      (window.location.hostname === '127.0.0.1' && window.location.port !== '8080') ||
      /capacitor|cordova/i.test(navigator.userAgent) || 
      window.Capacitor) {
    apiBase = 'http://localhost:8080';
  }
  window.API_BASE_URL = apiBase;

  // Monkey-patch window.fetch to automatically prepend API_BASE_URL for relative endpoints
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      input = window.API_BASE_URL + input;
    }
    return originalFetch.call(this, input, init);
  };
})();

// List of all 45 courses requested by the user
const COURSES_DATA = [
  // Programming Languages
  { id: 'python', name: 'Python', category: 'Programming Languages', difficulty: 'Beginner', duration: '12 hrs', rating: 4.8, students: 124500, trending: true, description: 'Master general-purpose programming, data analytics, and automation using Python.' },
  { id: 'java', name: 'Java', category: 'Programming Languages', difficulty: 'Intermediate', duration: '18 hrs', rating: 4.6, students: 98200, trending: false, description: 'Build robust, object-oriented enterprise systems and Android foundations.' },
  { id: 'c', name: 'C', category: 'Programming Languages', difficulty: 'Intermediate', duration: '10 hrs', rating: 4.5, students: 54100, trending: false, description: 'Understand memory management, pointers, and low-level system design fundamentals.' },
  { id: 'cpp', name: 'C++', category: 'Programming Languages', difficulty: 'Advanced', duration: '15 hrs', rating: 4.7, students: 86400, trending: true, description: 'Learn high-performance programming, object-oriented concepts, and memory structures.' },
  { id: 'html', name: 'HTML', category: 'Web Development', difficulty: 'Beginner', duration: '4 hrs', rating: 4.9, students: 231000, trending: false, description: 'Build the structural backbone of the web using modern semantic HTML5 tags.' },
  { id: 'css', name: 'CSS', category: 'Web Development', difficulty: 'Beginner', duration: '8 hrs', rating: 4.8, students: 198000, trending: false, description: 'Design beautiful, responsive user interfaces using Flexbox, CSS Grid, and custom variables.' },
  { id: 'javascript', name: 'JavaScript', category: 'Web Development', difficulty: 'Beginner', duration: '14 hrs', rating: 4.8, students: 245000, trending: true, description: 'Learn programming fundamentals, DOM manipulation, asynchronous operations, and ES6+ features.' },
  { id: 'reactjs', name: 'React JS', category: 'Web Development', difficulty: 'Intermediate', duration: '16 hrs', rating: 4.9, students: 172000, trending: true, description: 'Create dynamic, modular Single Page Applications using components, hooks, and state management.' },
  { id: 'nodejs', name: 'Node JS', category: 'Web Development', difficulty: 'Intermediate', duration: '14 hrs', rating: 4.7, students: 110400, trending: true, description: 'Build scalable, asynchronous backend servers and REST APIs using Express.' },
  { id: 'sql', name: 'SQL', category: 'Databases', difficulty: 'Beginner', duration: '8 hrs', rating: 4.7, students: 135000, trending: false, description: 'Query, update, and manage relational databases using Structured Query Language.' },
  { id: 'mysql', name: 'MySQL', category: 'Databases', difficulty: 'Beginner', duration: '10 hrs', rating: 4.6, students: 94000, trending: false, description: 'Deploy and optimize relational tables, primary/foreign keys, and indexes in MySQL.' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases', difficulty: 'Intermediate', duration: '12 hrs', rating: 4.8, students: 78000, trending: true, description: 'Master advanced database structures, JSON querying, transactions, and custom procedures.' },
  { id: 'mongodb', name: 'MongoDB', category: 'Databases', difficulty: 'Intermediate', duration: '10 hrs', rating: 4.7, students: 89000, trending: true, description: 'Learn NoSQL architecture, document modeling, aggregation pipelines, and high scalability.' },
  
  // Computer Science & Data structures
  { id: 'data_structures', name: 'Data Structures', category: 'Computer Science', difficulty: 'Intermediate', duration: '16 hrs', rating: 4.8, students: 120500, trending: true, description: 'Understand Arrays, Linked Lists, Stacks, Queues, Trees, and Graphs inside memory.' },
  { id: 'algorithms', name: 'Algorithms', category: 'Computer Science', difficulty: 'Advanced', duration: '18 hrs', rating: 4.9, students: 112000, trending: true, description: 'Analyze runtime and write sorting, searching, dynamic programming, and greedy algorithms.' },
  
  // Data Science & AI/ML
  { id: 'data_science', name: 'Data Science', category: 'AI & Data Science', difficulty: 'Beginner', duration: '20 hrs', rating: 4.8, students: 154000, trending: true, description: 'Begin your data journey: statistics, exploration, visualization, and modeling foundations.' },
  { id: 'pandas', name: 'Pandas', category: 'AI & Data Science', difficulty: 'Intermediate', duration: '8 hrs', rating: 4.7, students: 67000, trending: true, description: 'Clean, manipulate, and analyze complex tabular structures with Python Pandas.' },
  { id: 'numpy', name: 'NumPy', category: 'AI & Data Science', difficulty: 'Intermediate', duration: '6 hrs', rating: 4.6, students: 58000, trending: false, description: 'Compute scientific equations and high-dimensional arrays rapidly using NumPy arrays.' },
  { id: 'matplotlib', name: 'Matplotlib', category: 'AI & Data Science', difficulty: 'Beginner', duration: '6 hrs', rating: 4.5, students: 43000, trending: false, description: 'Create dynamic, custom plots, line graphs, bar charts, and scatter visualizations.' },
  { id: 'scikitlearn', name: 'Scikit-learn', category: 'AI & Data Science', difficulty: 'Intermediate', duration: '10 hrs', rating: 4.8, students: 74000, trending: false, description: 'Build and evaluate regression, classification, and clustering machine learning models.' },
  { id: 'tensorflow', name: 'TensorFlow', category: 'AI & Data Science', difficulty: 'Advanced', duration: '16 hrs', rating: 4.7, students: 81000, trending: true, description: 'Train deep learning networks, CNNs, RNNs, and custom models with TensorFlow and Keras.' },
  { id: 'machine_learning', name: 'Machine Learning', category: 'AI & Data Science', difficulty: 'Intermediate', duration: '18 hrs', rating: 4.9, students: 168000, trending: true, description: 'Explore supervised, unsupervised learning, decision trees, SVMs, and neural models.' },
  { id: 'deep_learning', name: 'Deep Learning', category: 'AI & Data Science', difficulty: 'Advanced', duration: '20 hrs', rating: 4.9, students: 95000, trending: true, description: 'Dive into neural networks, backpropagation, transformers, and computer vision architectures.' },
  { id: 'artificial_intelligence', name: 'Artificial Intelligence', category: 'AI & Data Science', difficulty: 'Beginner', duration: '12 hrs', rating: 4.8, students: 189000, trending: true, description: 'A futuristic introduction to NLP, Robotics, Generative AI, and AI Ethics.' },
  
  // Data Tools
  { id: 'power_bi', name: 'Power BI', category: 'Data Analysis', difficulty: 'Beginner', duration: '10 hrs', rating: 4.7, students: 69000, trending: false, description: 'Import data, model relationships, and build stunning interactive business dashboards.' },
  { id: 'tableau', name: 'Tableau', category: 'Data Analysis', difficulty: 'Beginner', duration: '10 hrs', rating: 4.6, students: 58000, trending: false, description: 'Tell engaging data stories and publish interactive visual dashboards with Tableau.' },
  { id: 'excel', name: 'Excel', category: 'Data Analysis', difficulty: 'Beginner', duration: '8 hrs', rating: 4.7, students: 142000, trending: false, description: 'Master formulas, VLOOKUP, INDEX-MATCH, Pivot Tables, and analysis widgets.' },
  
  // Cloud & DevOps
  { id: 'cloud_computing', name: 'Cloud Computing', category: 'Cloud & Infrastructure', difficulty: 'Beginner', duration: '10 hrs', rating: 4.7, students: 96000, trending: false, description: 'Introduction to virtualization, SaaS, PaaS, IaaS, and modern cloud deployment topologies.' },
  { id: 'aws', name: 'AWS', category: 'Cloud & Infrastructure', difficulty: 'Intermediate', duration: '15 hrs', rating: 4.8, students: 114000, trending: true, description: 'Deploy serverless compute (Lambda), scalable clusters (EC2), and static storage (S3) on AWS.' },
  { id: 'azure', name: 'Azure', category: 'Cloud & Infrastructure', difficulty: 'Intermediate', duration: '14 hrs', rating: 4.6, students: 65000, trending: false, description: 'Host web apps, active directories, and scale containers on the Microsoft Azure cloud.' },
  { id: 'google_cloud', name: 'Google Cloud', category: 'Cloud & Infrastructure', difficulty: 'Intermediate', duration: '12 hrs', rating: 4.7, students: 59000, trending: true, description: 'Manage Kubernetes engines, Cloud Functions, and BigQuery schemas on GCP.' },
  { id: 'docker', name: 'Docker', category: 'Cloud & Infrastructure', difficulty: 'Intermediate', duration: '8 hrs', rating: 4.8, students: 103000, trending: true, description: 'Package apps into reproducible container images that run identically anywhere.' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'Cloud & Infrastructure', difficulty: 'Advanced', duration: '15 hrs', rating: 4.9, students: 76000, trending: true, description: 'Orchestrate self-healing, scalable container clusters across cloud infrastructure.' },
  { id: 'devops', name: 'DevOps', category: 'Cloud & Infrastructure', difficulty: 'Intermediate', duration: '16 hrs', rating: 4.8, students: 108000, trending: true, description: 'Automate CI/CD pipelines, Infrastructure as Code, log monitors, and deploy configurations.' },
  { id: 'git', name: 'Git', category: 'Development Tools', difficulty: 'Beginner', duration: '4 hrs', rating: 4.8, students: 185000, trending: false, description: 'Track file changes, collaborate via branches, resolve conflicts, and commit cleanly.' },
  { id: 'github', name: 'GitHub', category: 'Development Tools', difficulty: 'Beginner', duration: '4 hrs', rating: 4.7, students: 167000, trending: false, description: 'Master remote pull requests, code reviews, releases, and automate actions.' },
  { id: 'linux', name: 'Linux', category: 'Development Tools', difficulty: 'Beginner', duration: '10 hrs', rating: 4.8, students: 95000, trending: false, description: 'Command-line scripting, processes, user authorization, and system administration.' },
  
  // Security & Networking
  { id: 'cyber_security', name: 'Cyber Security', category: 'Security & Networking', difficulty: 'Beginner', duration: '14 hrs', rating: 4.8, students: 109000, trending: true, description: 'Defend systems from attacks, secure data links, and understand vulnerability vectors.' },
  { id: 'networking', name: 'Networking', category: 'Security & Networking', difficulty: 'Beginner', duration: '12 hrs', rating: 4.6, students: 64000, trending: false, description: 'Understand TCP/IP protocols, DNS configurations, subnets, routers, and switches.' },
  
  // Mobile Development
  { id: 'android_dev', name: 'Android Development', category: 'Mobile Development', difficulty: 'Intermediate', duration: '18 hrs', rating: 4.7, students: 82000, trending: false, description: 'Build natively for Android devices using Kotlin, Android Studio, and Jetpack Compose.' },
  { id: 'flutter', name: 'Flutter', category: 'Mobile Development', difficulty: 'Intermediate', duration: '15 hrs', rating: 4.8, students: 96000, trending: true, description: 'Compile native apps for Android, iOS, and Web from a single Dart codebase.' },
  
  // UI/UX & Design
  { id: 'uiux_design', name: 'UI/UX Design', category: 'Design & Marketing', difficulty: 'Beginner', duration: '12 hrs', rating: 4.9, students: 122000, trending: true, description: 'Learn wireframing, user persona mapping, design systems, layouts, and accessibility.' },
  { id: 'figma', name: 'Figma', category: 'Design & Marketing', difficulty: 'Beginner', duration: '8 hrs', rating: 4.9, students: 145000, trending: true, description: 'Prototype components, auto-layouts, responsive frames, and micro-interactions in Figma.' },
  { id: 'graphic_design', name: 'Graphic Design', category: 'Design & Marketing', difficulty: 'Beginner', duration: '10 hrs', rating: 4.7, students: 63000, trending: false, description: 'Understand color theory, layout composition, vector typography, and visual branding.' },
  { id: 'digital_marketing', name: 'Digital Marketing', category: 'Design & Marketing', difficulty: 'Beginner', duration: '10 hrs', rating: 4.6, students: 79000, trending: false, description: 'Optimize SEO rankings, execute advertising strategies, and interpret web analytics.' }
];

// Topic content dictionary for all 45 courses
// Defines 5 structural topics for every course to generate realistic content.
const TOPIC_TEMPLATES = {
  python: [
    { name: 'Python Basics & Variables', keyword: 'variables', desc: 'Variables, primitive data types (integers, strings, floats, booleans) and dynamic typing.' },
    { name: 'Control Flow & Conditional Logic', keyword: 'conditionals', desc: 'If-else branching, logical operators, and loops (while and for).' },
    { name: 'Functions & Module Scope', keyword: 'functions', desc: 'Writing reusable code modules, parameter scope, arguments, and custom modules.' },
    { name: 'Object-Oriented Programming (OOP)', keyword: 'oop', desc: 'Classes, object instances, inheritance, encapsulation, and polymorphism.' },
    { name: 'Exception Handling & File Operations', keyword: 'fileio', desc: 'Reading/writing files and catching runtime faults safely with try-except blocks.' },
    { name: 'List Comprehensions, Generators & Iterators', keyword: 'py_comprehensions', desc: 'List/dict/set comprehensions, generator expressions, yield keyword, and lazy evaluation.' },
    { name: 'Decorators, Context Managers & Closures', keyword: 'py_decorators', desc: 'Writing function decorators, @property, @staticmethod, context managers with __enter__/__exit__.' },
    { name: 'Standard Library, Virtual Environments & Packaging', keyword: 'py_stdlib', desc: 'Key stdlib modules (os, sys, json, re, datetime), venv setup, pip, and publishing to PyPI.' }
  ],
  // Java
  java: [
    { name: 'Java Virtual Machine & Structure', keyword: 'jvm', desc: 'Under-the-hood execution of bytecodes, compilation phases, and project files.' },
    { name: 'Object Oriented Principles', keyword: 'java_oop', desc: 'Declaring classes, constructor overloads, and explicit interfaces.' },
    { name: 'Java Collections Framework', keyword: 'collections', desc: 'Lists, Sets, Maps, and dynamic ArrayList memory management.' },
    { name: 'Exception Handling & Threads', keyword: 'threads', desc: 'Catching checked exceptions, throw keywords, and introducing multithreading.' },
    { name: 'Streams API & Modern Features', keyword: 'streams', desc: 'Functional programming patterns, Lambdas, and Stream filtering/mapping.' },
    { name: 'Spring Boot & REST APIs', keyword: 'java_spring', desc: 'Spring Boot application setup, REST controllers, dependency injection, and JPA data repositories.' },
    { name: 'Java Memory Model & Concurrency', keyword: 'java_concurrency', desc: 'Heap vs stack memory, garbage collection, synchronized blocks, ExecutorService, and CompletableFuture.' },
    { name: 'Testing with JUnit 5 & Mockito', keyword: 'java_testing', desc: 'Unit tests with JUnit5, mocking dependencies with Mockito, test-driven development (TDD) workflow.' }
  ],
  // C
  c: [
    { name: 'Syntax, Compiling & Standard IO', keyword: 'c_basics', desc: 'GCC compiler, standard structures, main execution, and printf/scanf.' },
    { name: 'Pointers & Memory Addresses', keyword: 'pointers', desc: 'De-referencing variables, memory locations, pointers arithmetic, and double pointers.' },
    { name: 'Dynamic Memory Allocation', keyword: 'malloc', desc: 'Allocating and freeing memory blocks on the heap using malloc, calloc, realloc, and free.' },
    { name: 'Structs & Unions', keyword: 'structs', desc: 'Custom composite types, struct pointers, alignment, and saving space with unions.' },
    { name: 'File Handling & Command Arguments', keyword: 'c_files', desc: 'Working with FILE pointers, fopen, fread, and command line arguments (argc, argv).' },
    { name: 'Preprocessor, Macros & Bitwise Operations', keyword: 'c_macros', desc: '#define, #ifdef guards, macro functions, bitwise AND/OR/XOR, and bit shifting.' },
    { name: 'Data Structures in C (Linked Lists, Trees)', keyword: 'c_ds', desc: 'Implementing linked lists, binary trees, and hash tables from scratch using struct pointers.' },
    { name: 'System Programming & POSIX APIs', keyword: 'c_posix', desc: 'fork, exec, pipe, signals, pthreads, and interacting with the Linux kernel through POSIX calls.' }
  ],
  // C++
  cpp: [
    { name: 'C++ Namespaces & IO Streams', keyword: 'cpp_basics', desc: 'Standard libraries, namespace declarations, std::cout, and references.' },
    { name: 'Classes & Resource Management (RAII)', keyword: 'raii', desc: 'Destructors, constructor overloading, and the Resource Acquisition Is Initialization design.' },
    { name: 'Pointers, References & Smart Pointers', keyword: 'smart_pointers', desc: 'Managing dynamic pointer lifespans with std::unique_ptr and std::shared_ptr.' },
    { name: 'Templates & Standard Template Library (STL)', keyword: 'stl', desc: 'Generic functions, vectors, sets, maps, lists, and standard algorithms.' },
    { name: 'Object-Oriented Inheritance & Polymorphism', keyword: 'cpp_oop', desc: 'Virtual functions, abstract base classes, and overrides.' },
    { name: 'Modern C++ (C++17/20): Structured Bindings & Concepts', keyword: 'cpp_modern', desc: 'std::optional, std::variant, ranges, coroutines, concepts, and modules in C++20.' },
    { name: 'Concurrency & Multithreading in C++', keyword: 'cpp_threads', desc: 'std::thread, mutex, condition_variable, atomic, and lock-free programming patterns.' },
    { name: 'Performance Optimization & Memory Layout', keyword: 'cpp_perf', desc: 'Cache-friendly data structures, SIMD intrinsics, profiling with perf/gprof, and zero-cost abstractions.' }
  ],
  // HTML
  html: [
    { name: 'HTML5 Skeleton & Metadata', keyword: 'html_skeleton', desc: 'Document type tags, head elements, meta tags, and charset variables.' },
    { name: 'Text Semantics & Structure', keyword: 'html_semantics', desc: 'Sections, articles, headers, footers, paragraphs, and list items.' },
    { name: 'Links, Images & Audio-Video', keyword: 'html_media', desc: 'Anchoring links, absolute vs relative paths, source options, and modern multimedia.' },
    { name: 'Forms, Inputs & Validation', keyword: 'html_forms', desc: 'Form tag, method configurations, textareas, drop-downs, and native validation traits.' },
    { name: 'SEO & Accessibility (a11y)', keyword: 'html_seo', desc: 'Alt tags, ARIA attributes, semantic headings, and crawler visibility.' },
    { name: 'HTML APIs: Canvas, Web Storage & Drag-Drop', keyword: 'html_api', desc: 'Canvas 2D drawing API, localStorage/sessionStorage, Drag and Drop API, and Geolocation.' },
    { name: 'Web Components & Custom Elements', keyword: 'html_webcomp', desc: 'Custom element registry, Shadow DOM encapsulation, HTML templates, and slots.' },
    { name: 'Progressive Web Apps (PWA) & Manifest', keyword: 'html_pwa', desc: 'Web App Manifest, Service Workers for offline support, install prompts, and PWA best practices.' }
  ],
  // CSS
  css: [
    { name: 'Selectors, Specificity & Box Model', keyword: 'css_box', desc: 'Padding, borders, margins, elements selectors, and calculation weighting.' },
    { name: 'Flexbox Layout Grid', keyword: 'flexbox', desc: 'Align-items, justify-content, flex-direction, and responsive sizing ratios.' },
    { name: 'CSS Grid Layouts', keyword: 'css_grid', desc: 'Grid-template-columns, grid-areas, gap properties, and aligning grid items.' },
    { name: 'Variables & Custom Properties', keyword: 'css_vars', desc: 'Declaring root styles, utilizing var(), and managing app color schemes.' },
    { name: 'Transitions, Keyframes & Animations', keyword: 'css_animations', desc: 'Timing curves, delay, transform options, and @keyframes animations.' },
    { name: 'Responsive Design & Media Queries', keyword: 'css_responsive', desc: 'Mobile-first breakpoints, clamp(), container queries, and fluid typography with vw units.' },
    { name: 'CSS Architecture: BEM, ITCSS & Utility-First', keyword: 'css_arch', desc: 'BEM naming methodology, ITCSS layer architecture, utility classes, and CSS Modules for scoping.' },
    { name: 'Modern CSS: Layers, Nesting & :has()', keyword: 'css_modern', desc: '@layer cascade layers, native CSS nesting, :has() parent selector, and CSS scroll-driven animations.' }
  ],
  // JavaScript
  javascript: [
    { name: 'Data Types, Scope & Operators', keyword: 'js_basics', desc: 'Variables (let, const, var), scoping, types, and comparison operations.' },
    { name: 'DOM Traversal & Event Handling', keyword: 'js_dom', desc: 'Querying elements, modification, event listeners, bubbling, and capturing.' },
    { name: 'Promises, Async/Await & Fetch', keyword: 'js_async', desc: 'Asynchronous callbacks, resolving promises, handling API requests, and try-catch blocks.' },
    { name: 'Array Methods & ES6 Syntaxes', keyword: 'js_es6', desc: 'Arrow functions, destructuring, spreads, maps, filters, and reducers.' },
    { name: 'Local Storage & Session State', keyword: 'js_storage', desc: 'Saving variables in browser storage, serializing JSON, and parsing variables.' },
    { name: 'Closures, Prototypes & "this" Keyword', keyword: 'js_closures', desc: 'Lexical closures, prototype chain, binding this, and class-based OOP in JS.' },
    { name: 'Error Handling & Debugging', keyword: 'js_debug', desc: 'try-catch-finally, custom Error classes, console tools, and Chrome DevTools workflow.' },
    { name: 'Modules, Bundlers & Build Tools', keyword: 'js_modules', desc: 'ES Modules (import/export), CommonJS, Webpack, Vite, and tree-shaking.' }
  ],
  // React JS
  reactjs: [
    { name: 'Components & JSX Structures', keyword: 'react_jsx', desc: 'Writing React components, JSX rendering logic, and functional components.' },
    { name: 'Props & Dynamic State (useState)', keyword: 'react_state', desc: 'Passing props downward, setting local state hooks, and component lifecycle triggers.' },
    { name: 'Side Effects & Fetching (useEffect)', keyword: 'react_effects', desc: 'Triggering data loads, handling cleanups, and listing dependency arrays.' },
    { name: 'Context API & State Management', keyword: 'react_context', desc: 'Avoiding prop-drilling, declaring global providers, and consuming Context.' },
    { name: 'Custom Hooks & Performance Routing', keyword: 'react_hooks', desc: 'Building reusable state logic hooks, useMemo, and simple router wrappers.' },
    { name: 'React Router & Navigation', keyword: 'react_router', desc: 'Client-side routing with React Router v6, dynamic params, nested routes, and protected routes.' },
    { name: 'Forms, Validation & Controlled Inputs', keyword: 'react_forms', desc: 'Controlled components, react-hook-form, Zod/Yup schema validation, and form submission.' },
    { name: 'Performance Optimization & Testing', keyword: 'react_perf', desc: 'React.memo, useCallback, lazy loading, React Testing Library, and Jest unit tests.' }
  ],
  // Node JS
  nodejs: [
    { name: 'Event Loop & Non-Blocking Architecture', keyword: 'node_loop', desc: 'Single threaded execution, callback queues, and event emitters.' },
    { name: 'File System & Path Modules', keyword: 'node_fs', desc: 'Reading, writing directories, streams, buffers, and system paths.' },
    { name: 'HTTP Module & Creating Server Shells', keyword: 'node_http', desc: 'Creating raw listeners, handling request headers, and response streams.' },
    { name: 'Express Framework & Router Setup', keyword: 'express', desc: 'Declaring routes, processing middleware, and structure models.' },
    { name: 'REST API & Controller Actions', keyword: 'rest_api', desc: 'GET, POST, PUT, DELETE requests, status codes, and parsing JSON payloads.' },
    { name: 'Authentication with JWT & Sessions', keyword: 'node_auth', desc: 'JWT token generation/validation, bcrypt password hashing, and session management with cookies.' },
    { name: 'Database Integration (MongoDB & SQL)', keyword: 'node_db', desc: 'Connecting to MongoDB with Mongoose, SQL with Sequelize/Prisma ORM, and writing models.' },
    { name: 'Deployment, Environment & Security', keyword: 'node_deploy', desc: 'dotenv config, rate limiting, helmet security headers, PM2 process manager, and cloud deployment.' }
  ],
  // SQL
  sql: [
    { name: 'Relational Database Principles', keyword: 'db_basics', desc: 'Tables, records, fields, keys (primary, foreign) and schema structures.' },
    { name: 'SELECT Statements & Filtering', keyword: 'sql_select', desc: 'WHERE filters, LIKE matching, logical AND/OR, and ordering results.' },
    { name: 'Aggregations & Grouping (GROUP BY)', keyword: 'sql_groupby', desc: 'COUNT, SUM, AVG, MIN, MAX, and filtering grouped rows with HAVING.' },
    { name: 'Table Joins (INNER, LEFT, RIGHT)', keyword: 'sql_joins', desc: 'Combining tables on common keys, alias naming, and multi-join operations.' },
    { name: 'Subqueries & Nested Operations', keyword: 'sql_subqueries', desc: 'Writing queries inside query columns, IN conditions, and performance optimization.' },
    { name: 'Indexes & Query Optimization', keyword: 'sql_indexes', desc: 'Creating clustered/non-clustered indexes, EXPLAIN plans, and analyzing slow queries.' },
    { name: 'Transactions, Views & Stored Procedures', keyword: 'sql_transactions', desc: 'ACID-compliant transactions, creating reusable views, and stored procedure parameters.' },
    { name: 'Window Functions & CTEs', keyword: 'sql_window', desc: 'ROW_NUMBER, RANK, LAG/LEAD, and Common Table Expressions for complex analytics.' }
  ],
  // Pandas
  pandas: [
    { name: 'Pandas DataFrames & Series', keyword: 'pandas_structures', desc: 'Declaring series, creating dataframes, indices, and data types.' },
    { name: 'Data Ingestion & Basic Inspection', keyword: 'pandas_io', desc: 'Reading CSV/JSON files, head, tail, info, describe, and shape methods.' },
    { name: 'Filtering, Selecting & Indexing', keyword: 'pandas_filtering', desc: 'Loc, iloc, conditional filters, and resetting indices.' },
    { name: 'Handling Missing Values & Cleaning', keyword: 'pandas_cleaning', desc: 'Detecting nulls, dropna, fillna, duplicates, and string operations.' },
    { name: 'GroupBy & Aggregation Operations', keyword: 'pandas_groupby', desc: 'Splitting, applying aggregations, pivot tables, and merging DataFrames.' },
    { name: 'Merging, Joining & Concatenating', keyword: 'pandas_merge', desc: 'pd.merge() with left/right/inner/outer joins, concat, and append operations.' },
    { name: 'Time Series Analysis', keyword: 'pandas_time', desc: 'Datetime indexing, resampling, rolling windows, and trend analysis on time-series data.' },
    { name: 'Data Visualization with Pandas & Seaborn', keyword: 'pandas_viz', desc: 'df.plot(), Seaborn integration, heatmaps, pairplots, and statistical visualizations.' }
  ],
  // Cyber Security
  cyber_security: [
    { name: 'Threat Vectors & Attack Landscapes', keyword: 'sec_threats', desc: 'Phishing, Malware, Ransomware, Man-in-the-Middle, and Social Engineering.' },
    { name: 'Cryptography & Data Protection', keyword: 'sec_crypto', desc: 'Symmetric vs Asymmetric encryption, Hashing (SHA-256), and Salt hashes.' },
    { name: 'Network Security & Firewalls', keyword: 'sec_network', desc: 'Port scanning, VPN connections, Firewalls, IDS, and IPS routing.' },
    { name: 'Web Application Security & OWASP Top 10', keyword: 'sec_owasp', desc: 'SQL Injection, Cross-Site Scripting (XSS), broken authorization, and data leaks.' },
    { name: 'Security Policies & Audits', keyword: 'sec_audits', desc: 'Risk evaluation, authentication (MFA), password compliance, and pen-testing.' },
    { name: 'Penetration Testing & Ethical Hacking', keyword: 'sec_pentest', desc: 'Reconnaissance, scanning with Nmap, exploitation frameworks like Metasploit, and reporting.' },
    { name: 'Incident Response & Forensics', keyword: 'sec_forensics', desc: 'Security incident lifecycle, log analysis, digital forensics, and chain of custody.' },
    { name: 'Cloud Security & Zero Trust Architecture', keyword: 'sec_cloud', desc: 'Shared responsibility model, IAM least privilege, zero-trust networking, and CASB tools.' }
  ],
  // MySQL
  mysql: [
    { name: 'MySQL Setup & Database Management', keyword: 'mysql_setup', desc: 'Installing MySQL Server, creating databases, and using the MySQL CLI and Workbench.' },
    { name: 'Tables, Data Types & Constraints', keyword: 'mysql_tables', desc: 'CREATE TABLE syntax, INT/VARCHAR/DATE types, PRIMARY KEY, NOT NULL, and UNIQUE constraints.' },
    { name: 'CRUD Operations & Transactions', keyword: 'mysql_crud', desc: 'INSERT, SELECT, UPDATE, DELETE statements, and wrapping operations in BEGIN/COMMIT transactions.' },
    { name: 'Indexes, Views & Stored Procedures', keyword: 'mysql_indexes', desc: 'Creating indexes for performance, building views, and writing stored procedures with parameters.' },
    { name: 'Query Optimization & Replication', keyword: 'mysql_opt', desc: 'EXPLAIN plans, slow query logs, index tuning, and master-slave replication setup.' },
    { name: 'Joins, Subqueries & Aggregations', keyword: 'mysql_joins', desc: 'Advanced JOIN patterns, correlated subqueries, GROUP BY with HAVING, and ROLLUP.' },
    { name: 'Triggers, Events & Functions', keyword: 'mysql_triggers', desc: 'BEFORE/AFTER triggers, scheduled events, user-defined functions, and stored function parameters.' },
    { name: 'Backup, Security & Production Setup', keyword: 'mysql_prod', desc: 'mysqldump backups, user privileges, binary logs, and configuring MySQL for production workloads.' }
  ],
  // PostgreSQL
  postgresql: [
    { name: 'PostgreSQL Architecture & psql CLI', keyword: 'pg_arch', desc: 'Roles, schemas, the psql command-line interface, and PostgreSQL\'s MVCC concurrency model.' },
    { name: 'Advanced Data Types & JSON Support', keyword: 'pg_types', desc: 'Arrays, JSONB columns, UUID, hstore, and range types unique to PostgreSQL.' },
    { name: 'Window Functions & CTEs', keyword: 'pg_window', desc: 'ROW_NUMBER, RANK, LAG/LEAD functions, and recursive Common Table Expressions (WITH clauses).' },
    { name: 'Full-Text Search & Indexing', keyword: 'pg_fts', desc: 'tsvector, tsquery, GIN indexes, trigram similarity, and pg_trgm extension.' },
    { name: 'Transactions, Locks & Performance Tuning', keyword: 'pg_perf', desc: 'Isolation levels, row-level locking, VACUUM/ANALYZE commands, and connection pooling.' },
    { name: 'Partitioning & Table Inheritance', keyword: 'pg_partition', desc: 'Range/list/hash partitioning strategies, partition pruning, and inheriting table schemas.' },
    { name: 'Extensions: PostGIS, pgcrypto & More', keyword: 'pg_ext', desc: 'Installing and using extensions: PostGIS for geospatial data, pgcrypto for hashing, pg_stat_statements.' },
    { name: 'Replication, High Availability & Backups', keyword: 'pg_ha', desc: 'Streaming replication, pg_basebackup, point-in-time recovery (PITR), and Patroni cluster setup.' }
  ],
  // MongoDB
  mongodb: [
    { name: 'Documents, Collections & MongoDB Shell', keyword: 'mongo_basics', desc: 'BSON format, MongoDB Atlas setup, mongosh commands, and CRUD document operations.' },
    { name: 'Schema Design & Data Modeling', keyword: 'mongo_schema', desc: 'Embedding vs referencing, one-to-many patterns, and designing flexible schema structures.' },
    { name: 'Aggregation Pipeline', keyword: 'mongo_agg', desc: '$match, $group, $project, $lookup, $unwind stages and building powerful data transformation pipelines.' },
    { name: 'Indexes & Query Optimization', keyword: 'mongo_idx', desc: 'Single-field, compound, multikey, and text indexes; explain() plans and index hints.' },
    { name: 'Transactions, Replication & Sharding', keyword: 'mongo_scale', desc: 'Multi-document ACID transactions, replica sets for HA, and horizontal sharding across clusters.' },
    { name: 'Mongoose ODM & Node.js Integration', keyword: 'mongo_mongoose', desc: 'Schema definitions, model methods, virtuals, middleware hooks, and population in Mongoose.' },
    { name: 'Atlas Search & Vector Search', keyword: 'mongo_search', desc: 'Lucene-powered Atlas Search, fuzzy matching, autocomplete, and vector embeddings for AI apps.' },
    { name: 'MongoDB Security & Atlas DevOps', keyword: 'mongo_sec', desc: 'Atlas roles, network peering, encryption at rest, database auditing, and Atlas deployment automation.' }
  ],
  // Data Structures
  data_structures: [
    { name: 'Arrays, Strings & Complexity Analysis', keyword: 'ds_arrays', desc: 'Static vs dynamic arrays, Big-O notation, time/space trade-offs, and two-pointer techniques.' },
    { name: 'Linked Lists, Stacks & Queues', keyword: 'ds_linked', desc: 'Singly/doubly linked lists, stack LIFO/queue FIFO operations, and practical implementations.' },
    { name: 'Trees & Binary Search Trees', keyword: 'ds_trees', desc: 'Binary trees, BST insertion/search/deletion, tree traversals (inorder, preorder, postorder).' },
    { name: 'Heaps, Hash Tables & Graphs', keyword: 'ds_heaps', desc: 'Min/max heaps, priority queues, hash maps with chaining, and graph adjacency representations.' },
    { name: 'Tries, Segment Trees & Advanced Structures', keyword: 'ds_advanced', desc: 'Prefix trees, range query segment trees, disjoint sets (Union-Find), and balanced AVL trees.' },
    { name: 'Graph Algorithms (BFS, DFS & Shortest Path)', keyword: 'ds_graphs', desc: 'BFS/DFS traversal, Dijkstra\'s algorithm, Bellman-Ford, and topological sort.' },
    { name: 'Dynamic Programming Structures', keyword: 'ds_dp', desc: 'Memoization tables, DP arrays, matrix chain multiplication, and LCS problem decomposition.' },
    { name: 'System Design & Data Structure Choices', keyword: 'ds_sysdesign', desc: 'Choosing the right structure for real systems: LRU Cache, Rate Limiter, URL Shortener design.' }
  ],
  // Algorithms
  algorithms: [
    { name: 'Sorting & Searching Algorithms', keyword: 'algo_sort', desc: 'Bubble, Selection, Merge, Quick, Heap sort; Binary Search and its variants.' },
    { name: 'Recursion & Divide and Conquer', keyword: 'algo_recursion', desc: 'Recursive problem modeling, recurrence relations, MergeSort and QuickSort analysis.' },
    { name: 'Dynamic Programming', keyword: 'algo_dp', desc: 'Memoization vs tabulation, Fibonacci, 0/1 Knapsack, LCS, and Coin Change problems.' },
    { name: 'Greedy Algorithms & Graph Traversals', keyword: 'algo_greedy', desc: 'Activity Selection, Huffman Coding, BFS, DFS, Dijkstra\'s and Bellman-Ford.' },
    { name: 'Backtracking, Bit Manipulation & NP Problems', keyword: 'algo_bt', desc: 'N-Queens, Sudoku solver, bitwise tricks, and understanding NP-hard/NP-complete problem classes.' },
    { name: 'String Algorithms & Pattern Matching', keyword: 'algo_strings', desc: 'KMP, Rabin-Karp, Z-algorithm, Trie-based search, and Aho-Corasick for multi-pattern matching.' },
    { name: 'Computational Geometry & Math Algorithms', keyword: 'algo_math', desc: 'Convex hull, segment intersection, GCD/LCM, modular arithmetic, and prime sieves.' },
    { name: 'Competitive Programming & LeetCode Patterns', keyword: 'algo_cp', desc: 'Sliding window, two pointers, monotonic stack, fast & slow pointers, and union-find patterns.' }
  ],
  // Data Science
  data_science: [
    { name: 'Statistics & Probability Foundations', keyword: 'ds_stats', desc: 'Descriptive statistics, distributions, hypothesis testing, p-values, and confidence intervals.' },
    { name: 'Data Collection, Cleaning & EDA', keyword: 'ds_eda', desc: 'Web scraping basics, handling missing data, outlier detection, and exploratory analysis workflows.' },
    { name: 'Data Visualization & Storytelling', keyword: 'ds_viz', desc: 'Charts, heatmaps, pair plots with Seaborn/Matplotlib, and communicating insights effectively.' },
    { name: 'Feature Engineering & Model Selection', keyword: 'ds_features', desc: 'Encoding categorical data, scaling, correlation analysis, and choosing the right ML algorithm.' },
    { name: 'Model Evaluation & Deployment Basics', keyword: 'ds_eval', desc: 'Train/test splits, cross-validation, metrics (RMSE, F1), and exporting models with joblib/pickle.' },
    { name: 'A/B Testing & Experimental Design', keyword: 'ds_ab', desc: 'Hypothesis formulation, sample size calculation, t-tests, chi-squared tests, and result interpretation.' },
    { name: 'Big Data Fundamentals (Spark & Hadoop)', keyword: 'ds_bigdata', desc: 'MapReduce paradigm, PySpark DataFrames, distributed processing, and Hadoop ecosystem tools.' },
    { name: 'Data Science Career & Portfolio Building', keyword: 'ds_career', desc: 'Kaggle competitions, building data science portfolios, Jupyter notebooks as reports, and job prep.' }
  ],
  // NumPy
  numpy: [
    { name: 'NumPy Arrays & ndarray Fundamentals', keyword: 'np_arrays', desc: 'Creating arrays, dtypes, shape, reshape, and understanding C vs Fortran memory order.' },
    { name: 'Array Operations & Broadcasting', keyword: 'np_ops', desc: 'Element-wise math, universal functions (ufuncs), broadcasting rules, and vectorized operations.' },
    { name: 'Indexing, Slicing & Masking', keyword: 'np_index', desc: 'Fancy indexing, boolean masks, np.where, and advanced slice operations on multi-dimensional arrays.' },
    { name: 'Linear Algebra & Matrix Operations', keyword: 'np_linalg', desc: 'np.dot, matrix multiplication, np.linalg.inv, eigenvalues, and SVD decomposition.' },
    { name: 'Random Sampling & Statistical Functions', keyword: 'np_stats', desc: 'Random seeds, distributions (normal, uniform, binomial), np.mean/std/corrcoef, and histograms.' },
    { name: 'NumPy Performance & Memory Management', keyword: 'np_perf', desc: 'C-order vs F-order memory layout, views vs copies, memory-mapped files, and profiling with timeit.' },
    { name: 'Structured Arrays & Record Arrays', keyword: 'np_struct', desc: 'Custom dtype definitions, structured array creation, and interfacing with C-level data structures.' },
    { name: 'NumPy in Machine Learning Pipelines', keyword: 'np_ml', desc: 'Matrix operations for gradient descent, one-hot encoding, batch processing, and tensor conversions.' }
  ],
  // Matplotlib
  matplotlib: [
    { name: 'Figure, Axes & Pyplot Basics', keyword: 'mpl_basics', desc: 'plt.figure(), subplot layouts, axes objects, and the OO vs pyplot API distinction.' },
    { name: 'Line, Bar, Scatter & Pie Charts', keyword: 'mpl_charts', desc: 'Plotting common chart types with customized colors, markers, line styles, and labels.' },
    { name: 'Histograms, Box Plots & Heatmaps', keyword: 'mpl_stats', desc: 'Distribution visualization, whisker plots with plt.boxplot(), and plt.imshow() heatmaps.' },
    { name: 'Styling, Annotations & Legends', keyword: 'mpl_style', desc: 'Applying stylesheets, adding text annotations, arrows, gridlines, and legend positioning.' },
    { name: 'Subplots, 3D Plots & Saving Figures', keyword: 'mpl_advanced', desc: 'plt.subplots(), mpl_toolkits.mplot3d surface plots, and exporting to PNG/SVG/PDF.' },
    { name: 'Seaborn for Statistical Visualization', keyword: 'mpl_seaborn', desc: 'sns.pairplot, heatmap, violinplot, FacetGrid, and Seaborn themes with Matplotlib integration.' },
    { name: 'Interactive Plots with Plotly', keyword: 'mpl_plotly', desc: 'Plotly Express, hover tooltips, animated charts, and embedding interactive plots in web apps.' },
    { name: 'Dashboard Building with Matplotlib', keyword: 'mpl_dash', desc: 'Creating multi-panel dashboards, sharing axes, adding interactive widgets with matplotlib.widgets.' }
  ],
  // Scikit-learn
  scikitlearn: [
    { name: 'ML Workflow & Preprocessing', keyword: 'sk_prep', desc: 'Scikit-learn API conventions, StandardScaler, LabelEncoder, and train_test_split.' },
    { name: 'Regression Models', keyword: 'sk_regression', desc: 'Linear Regression, Ridge, Lasso, ElasticNet, and evaluating with MSE/R² scores.' },
    { name: 'Classification Models', keyword: 'sk_classify', desc: 'Logistic Regression, KNN, Decision Trees, SVM, and Naive Bayes classifiers.' },
    { name: 'Clustering & Dimensionality Reduction', keyword: 'sk_cluster', desc: 'K-Means, DBSCAN, PCA, and t-SNE for unsupervised pattern discovery.' },
    { name: 'Pipelines, Cross-Validation & Hyperparameter Tuning', keyword: 'sk_pipelines', desc: 'Building sklearn Pipelines, GridSearchCV, RandomizedSearchCV, and k-fold validation.' },
    { name: 'Ensemble Methods & Boosting', keyword: 'sk_ensemble', desc: 'RandomForest, GradientBoosting, AdaBoost, XGBoost integration, and feature importances.' },
    { name: 'Model Persistence & Deployment', keyword: 'sk_deploy', desc: 'Saving models with joblib/pickle, loading in production, and wrapping in Flask/FastAPI APIs.' },
    { name: 'Feature Selection & Handling Imbalanced Data', keyword: 'sk_features', desc: 'SelectKBest, RFE, SMOTE for imbalanced classes, and class_weight parameter tuning.' }
  ],
  // TensorFlow
  tensorflow: [
    { name: 'TensorFlow Tensors & Eager Execution', keyword: 'tf_tensors', desc: 'tf.constant, tf.Variable, tensor operations, and enabling/disabling eager mode.' },
    { name: 'Building Models with Keras API', keyword: 'tf_keras', desc: 'Sequential and Functional API, Dense layers, activations, and model.compile().' },
    { name: 'Training, Loss Functions & Optimizers', keyword: 'tf_train', desc: 'model.fit(), callbacks, learning rate schedules, Adam/SGD optimizers, and gradient descent.' },
    { name: 'Convolutional Neural Networks (CNNs)', keyword: 'tf_cnn', desc: 'Conv2D, MaxPooling, BatchNormalization, and building image classification pipelines.' },
    { name: 'Transfer Learning & Model Deployment', keyword: 'tf_deploy', desc: 'Using pre-trained models (MobileNet, ResNet), fine-tuning, and serving with TensorFlow Serving.' },
    { name: 'Recurrent Networks (LSTMs & GRUs)', keyword: 'tf_rnn', desc: 'Sequence modeling with LSTM/GRU cells, masking, bidirectional layers, and text generation.' },
    { name: 'Custom Training Loops & GradientTape', keyword: 'tf_custom', desc: 'Manual gradient computation, custom loss functions, and implementing custom training loops.' },
    { name: 'TensorFlow Lite & Model Optimization', keyword: 'tf_lite', desc: 'Quantization, pruning, TFLite conversion for mobile/edge deployment, and benchmarking.' }
  ],
  // Machine Learning
  machine_learning: [
    { name: 'ML Fundamentals & Types of Learning', keyword: 'ml_intro', desc: 'Supervised, unsupervised, reinforcement learning paradigms, bias-variance tradeoff, and overfitting.' },
    { name: 'Regression & Classification', keyword: 'ml_regclass', desc: 'Linear/logistic regression, decision boundaries, confusion matrices, and ROC/AUC curves.' },
    { name: 'Ensemble Methods & Boosting', keyword: 'ml_ensemble', desc: 'Random Forests, Bagging, Gradient Boosting (XGBoost, LightGBM), and stacking strategies.' },
    { name: 'Neural Networks & Deep Learning Intro', keyword: 'ml_nn', desc: 'Perceptrons, activation functions, backpropagation, and shallow vs deep network architectures.' },
    { name: 'Model Deployment & MLOps Basics', keyword: 'ml_mlops', desc: 'Model serialization, REST API serving, monitoring drift, and CI/CD pipelines for ML.' },
    { name: 'Feature Engineering & Data Pipelines', keyword: 'ml_features', desc: 'Target encoding, polynomial features, feature stores, and automated pipeline orchestration.' },
    { name: 'Reinforcement Learning Fundamentals', keyword: 'ml_rl', desc: 'Markov Decision Processes, Q-learning, policy gradients, and OpenAI Gym environments.' },
    { name: 'Responsible AI & Fairness', keyword: 'ml_ethics', desc: 'Bias detection, SHAP explainability, fairness metrics, model cards, and regulatory compliance (GDPR).' }
  ],
  // Deep Learning
  deep_learning: [
    { name: 'Neural Network Architectures & Backprop', keyword: 'dl_nn', desc: 'Feedforward networks, activation functions (ReLU, Sigmoid, Softmax), and gradient flow.' },
    { name: 'Convolutional Neural Networks (CNNs)', keyword: 'dl_cnn', desc: 'Convolution operations, feature maps, pooling, dropout regularization, and famous architectures (VGG, ResNet).' },
    { name: 'Recurrent Networks & LSTMs', keyword: 'dl_rnn', desc: 'Sequence modeling, vanishing gradients, LSTM/GRU cells, and time-series forecasting.' },
    { name: 'Transformers & Attention Mechanisms', keyword: 'dl_transformers', desc: 'Self-attention, multi-head attention, positional encoding, BERT, and GPT architecture overview.' },
    { name: 'Generative Models & Computer Vision', keyword: 'dl_gen', desc: 'GANs (generator/discriminator), VAEs, image segmentation (U-Net), and object detection (YOLO).' },
    { name: 'Natural Language Processing with Deep Learning', keyword: 'dl_nlp', desc: 'Word embeddings (Word2Vec, GloVe, FastText), fine-tuning BERT, named entity recognition, and text classification.' },
    { name: 'Model Optimization & Efficient Training', keyword: 'dl_opt', desc: 'Mixed precision training, gradient checkpointing, distributed training (DDP), and learning rate warmup.' },
    { name: 'Large Language Models & Prompt Engineering', keyword: 'dl_llm', desc: 'LLM architecture overview, fine-tuning with LoRA, RLHF, RAG systems, and building with LangChain.' }
  ],
  // Artificial Intelligence
  artificial_intelligence: [
    { name: 'AI Foundations & History', keyword: 'ai_intro', desc: 'Turing Test, AI winters, symbolic AI, expert systems, and the modern deep learning revolution.' },
    { name: 'Search Algorithms & Problem Solving', keyword: 'ai_search', desc: 'Breadth/Depth-First Search, A* algorithm, heuristics, and constraint satisfaction problems.' },
    { name: 'Natural Language Processing (NLP)', keyword: 'ai_nlp', desc: 'Tokenization, stemming, word embeddings (Word2Vec, GloVe), sentiment analysis, and chatbots.' },
    { name: 'Computer Vision & Robotics', keyword: 'ai_vision', desc: 'Image recognition pipelines, object detection, SLAM in robotics, and sensor fusion basics.' },
    { name: 'Generative AI & AI Ethics', keyword: 'ai_ethics', desc: 'LLMs, prompt engineering, bias in AI systems, fairness, explainability, and responsible AI.' },
    { name: 'Reinforcement Learning & Game AI', keyword: 'ai_rl', desc: 'MDP formulation, Q-learning, Deep Q-Networks, AlphaGo/AlphaZero, and multi-agent systems.' },
    { name: 'AI Planning & Knowledge Representation', keyword: 'ai_planning', desc: 'STRIPS planning, Prolog/Datalog, ontologies, semantic web, and knowledge graphs.' },
    { name: 'AI Product Development & Future Trends', keyword: 'ai_product', desc: 'Building AI-powered products, AI APIs (OpenAI, Anthropic), AGI debates, and regulatory landscape.' }
  ],
  // Power BI
  power_bi: [
    { name: 'Power BI Desktop & Data Sources', keyword: 'pbi_intro', desc: 'Installing Power BI Desktop, connecting to Excel/SQL/API sources, and the Query Editor interface.' },
    { name: 'Power Query & Data Transformation (ETL)', keyword: 'pbi_pq', desc: 'M language basics, merging queries, unpivoting columns, and building reusable data transformation steps.' },
    { name: 'Data Modeling & Relationships', keyword: 'pbi_model', desc: 'Star schema design, one-to-many relationships, cardinality settings, and managing the model view.' },
    { name: 'DAX Formulas & Calculated Measures', keyword: 'pbi_dax', desc: 'CALCULATE, SUMX, FILTER, time intelligence (TOTALYTD, SAMEPERIODLASTYEAR), and context transition.' },
    { name: 'Visualizations, Reports & Publishing', keyword: 'pbi_viz', desc: 'Choosing right visuals, formatting, slicers, drillthrough, and publishing to Power BI Service.' },
    { name: 'Row-Level Security & Governance', keyword: 'pbi_rls', desc: 'Dynamic RLS with DAX roles, workspace management, sensitivity labels, and enterprise governance.' },
    { name: 'Power BI Embedded & API Integration', keyword: 'pbi_api', desc: 'Embedding dashboards in web apps, Power BI REST API, Python integration via powerbi-rest-api.' },
    { name: 'Performance Optimization & Best Practices', keyword: 'pbi_perf', desc: 'Import vs DirectQuery optimization, DAX variables, aggregations, and Performance Analyzer usage.' }
  ],
  // Tableau
  tableau: [
    { name: 'Tableau Desktop & Data Connections', keyword: 'tab_intro', desc: 'Connecting to CSVs, databases, and cloud sources; the Tableau interface and data pane.' },
    { name: 'Dimensions, Measures & Aggregations', keyword: 'tab_dims', desc: 'Blue vs green pills, discrete vs continuous, SUM/AVG/COUNT aggregations, and level of detail.' },
    { name: 'Building Core Chart Types', keyword: 'tab_charts', desc: 'Bar, line, scatter, map, treemap, and heat map creation with Show Me and manual configuration.' },
    { name: 'Calculated Fields, Parameters & Filters', keyword: 'tab_calc', desc: 'Writing IF/CASE formulas, creating parameters for dynamic analysis, and context/quick/data-source filters.' },
    { name: 'Dashboards, Stories & Tableau Public', keyword: 'tab_dash', desc: 'Building interactive dashboards, adding actions, storytelling with Story points, and publishing.' },
    { name: 'Level of Detail (LOD) Expressions', keyword: 'tab_lod', desc: 'FIXED, INCLUDE, EXCLUDE LOD expressions for computing aggregations at different granularities.' },
    { name: 'Table Calculations & Advanced Analytics', keyword: 'tab_tableCalc', desc: 'Running totals, percent of total, moving averages, rank, and reference lines for analytics.' },
    { name: 'Tableau Server & Enterprise Deployment', keyword: 'tab_server', desc: 'Publishing to Tableau Server/Cloud, content management, extracts vs live, and REST API basics.' }
  ],
  // Excel
  excel: [
    { name: 'Excel Interface, Formulas & Functions', keyword: 'xl_basics', desc: 'Cell references (relative/absolute), SUM, AVERAGE, IF, COUNTIF, and formula auditing tools.' },
    { name: 'Lookup Functions & Data Validation', keyword: 'xl_lookup', desc: 'VLOOKUP, HLOOKUP, INDEX-MATCH, XLOOKUP, and setting up drop-down data validation lists.' },
    { name: 'Pivot Tables & Pivot Charts', keyword: 'xl_pivot', desc: 'Summarizing large datasets, grouping by fields, slicers, timelines, and calculated pivot fields.' },
    { name: 'Charts, Sparklines & Conditional Formatting', keyword: 'xl_charts', desc: 'Creating professional charts, adding sparklines for trends, and traffic-light conditional formatting rules.' },
    { name: 'Power Query, Macros & VBA Basics', keyword: 'xl_vba', desc: 'Importing external data with Power Query, recording macros, and writing basic VBA subroutines.' },
    { name: 'Advanced Formulas: LAMBDA, LET & Dynamic Arrays', keyword: 'xl_dynamic', desc: 'LAMBDA custom functions, LET for named variables, FILTER, SORT, UNIQUE, and dynamic array spill.' },
    { name: 'Data Analysis with Solver & What-If Analysis', keyword: 'xl_analysis', desc: 'Goal Seek, Scenario Manager, Solver optimization, and Monte Carlo simulation in Excel.' },
    { name: 'Excel & Python/Power BI Integration', keyword: 'xl_integration', desc: 'Running Python scripts in Excel (Microsoft integration), exporting to Power BI, and Excel REST API.' }
  ],
  // Cloud Computing
  cloud_computing: [
    { name: 'Cloud Fundamentals & Service Models', keyword: 'cloud_intro', desc: 'IaaS, PaaS, SaaS distinctions, public/private/hybrid cloud, and key cloud provider comparison.' },
    { name: 'Virtualization & Containerization', keyword: 'cloud_virt', desc: 'Hypervisors (Type 1/2), virtual machines, Docker containers, and the move to microservices.' },
    { name: 'Cloud Storage, CDN & Networking', keyword: 'cloud_storage', desc: 'Object storage (S3-like), block vs file storage, CDN caching, VPCs, and load balancers.' },
    { name: 'Serverless Computing & Event-Driven Architecture', keyword: 'cloud_serverless', desc: 'Functions as a Service (FaaS), Lambda/Cloud Functions, event triggers, and cold start optimization.' },
    { name: 'Cloud Security, Compliance & Cost Management', keyword: 'cloud_security', desc: 'IAM roles, encryption at rest/transit, shared responsibility model, and cloud cost optimization tools.' },
    { name: 'Multi-Cloud & Hybrid Cloud Strategies', keyword: 'cloud_multi', desc: 'Avoiding vendor lock-in, Anthos/Azure Arc/Outposts, workload portability, and cloud governance.' },
    { name: 'Cloud Databases & Data Warehouses', keyword: 'cloud_db', desc: 'Managed RDS, DynamoDB, BigQuery, Snowflake, and choosing between OLTP vs OLAP workloads.' },
    { name: 'Cloud Certifications & Career Path', keyword: 'cloud_cert', desc: 'AWS SAA, Azure AZ-900/AZ-104, GCP ACE certification paths, study resources, and exam strategies.' }
  ],
  // AWS
  aws: [
    { name: 'AWS Core Services & IAM', keyword: 'aws_core', desc: 'EC2, S3, RDS overview; IAM users, roles, policies, and the principle of least privilege.' },
    { name: 'Compute: EC2, Lambda & ECS', keyword: 'aws_compute', desc: 'Launching EC2 instances, auto-scaling groups, serverless Lambda functions, and ECS containers.' },
    { name: 'Storage: S3, EBS & Glacier', keyword: 'aws_storage', desc: 'S3 bucket policies, versioning, lifecycle rules, EBS volumes, and Glacier archiving tiers.' },
    { name: 'Networking: VPC, Route 53 & CloudFront', keyword: 'aws_network', desc: 'VPC subnets, internet gateways, security groups, Route 53 DNS, and CloudFront CDN distributions.' },
    { name: 'Databases, Monitoring & CI/CD on AWS', keyword: 'aws_db', desc: 'RDS, DynamoDB, ElastiCache, CloudWatch alarms, and deploying with CodePipeline/CodeDeploy.' },
    { name: 'Serverless Architecture & API Gateway', keyword: 'aws_serverless', desc: 'Designing serverless apps with Lambda + API Gateway + DynamoDB + SQS/SNS event-driven patterns.' },
    { name: 'Security: KMS, Secrets Manager & WAF', keyword: 'aws_security', desc: 'Encryption with KMS, secret rotation, WAF rules, GuardDuty threat detection, and Security Hub.' },
    { name: 'AWS SAA-C03 Certification Preparation', keyword: 'aws_cert', desc: 'Exam domains: design resilient architectures, high-performing, secure, and cost-optimized solutions.' }
  ],
  // Azure
  azure: [
    { name: 'Azure Portal, Resource Groups & Subscriptions', keyword: 'az_intro', desc: 'Navigating the Azure Portal, organizing resources with resource groups, and understanding billing.' },
    { name: 'Azure Compute: VMs, App Service & Functions', keyword: 'az_compute', desc: 'Creating Virtual Machines, deploying web apps via App Service, and writing Azure Functions.' },
    { name: 'Azure Storage & Azure SQL Database', keyword: 'az_storage', desc: 'Blob storage, Azure Files, Azure SQL, Cosmos DB, and choosing the right storage solution.' },
    { name: 'Azure Active Directory & Security', keyword: 'az_aad', desc: 'AAD tenants, Conditional Access, MFA, managed identities, and Azure Key Vault secrets.' },
    { name: 'Azure DevOps, Monitor & Cost Management', keyword: 'az_devops', desc: 'Azure Pipelines CI/CD, Azure Monitor dashboards, Log Analytics, and Azure Cost Management tools.' },
    { name: 'Azure Kubernetes Service (AKS) & Containers', keyword: 'az_aks', desc: 'Deploying and scaling AKS clusters, ACR container registry, Helm charts on Azure.' },
    { name: 'Azure AI & Cognitive Services', keyword: 'az_ai', desc: 'Azure OpenAI Service, Cognitive Services (Vision, Speech, Language), and Azure ML Studio.' },
    { name: 'AZ-900 & AZ-104 Certification Paths', keyword: 'az_cert', desc: 'Azure Fundamentals (AZ-900) concepts and Azure Administrator (AZ-104) exam preparation guide.' }
  ],
  // Google Cloud
  google_cloud: [
    { name: 'GCP Console, Projects & IAM', keyword: 'gcp_intro', desc: 'GCP project structure, Cloud Console navigation, IAM roles, service accounts, and billing alerts.' },
    { name: 'Compute Engine & App Engine', keyword: 'gcp_compute', desc: 'VM instances, machine types, managed instance groups, and deploying apps on App Engine Standard/Flex.' },
    { name: 'Cloud Storage, BigQuery & Bigtable', keyword: 'gcp_storage', desc: 'GCS buckets, BigQuery SQL analytics at scale, Bigtable for wide-column workloads.' },
    { name: 'Kubernetes Engine (GKE) & Cloud Run', keyword: 'gcp_gke', desc: 'Deploying containerized apps on GKE, cluster management, and serverless containers with Cloud Run.' },
    { name: 'Cloud Functions, AI APIs & Networking', keyword: 'gcp_ai', desc: 'Event-driven Cloud Functions, Vision/NLP AI APIs, VPC networks, and Cloud Load Balancing.' },
    { name: 'Pub/Sub, Dataflow & Data Engineering', keyword: 'gcp_data', desc: 'Event streaming with Pub/Sub, batch/stream processing with Dataflow (Apache Beam), and BigQuery ML.' },
    { name: 'Firebase & GCP Mobile Backend', keyword: 'gcp_firebase', desc: 'Firestore, Authentication, Cloud Messaging, Hosting, and integrating Firebase with GCP services.' },
    { name: 'GCP ACE & Professional Cert Preparation', keyword: 'gcp_cert', desc: 'Associate Cloud Engineer exam domains, PCA Professional Cloud Architect study guide, and practice tests.' }
  ],
  // Docker
  docker: [
    { name: 'Docker Architecture & Installation', keyword: 'docker_intro', desc: 'Docker Engine, daemon, client, registry overview, and installing Docker Desktop on Linux/Mac/Windows.' },
    { name: 'Images, Containers & Dockerfile', keyword: 'docker_images', desc: 'Pulling images, docker run/stop/rm, writing Dockerfiles with FROM/RUN/COPY/CMD instructions.' },
    { name: 'Volumes, Networks & Environment Variables', keyword: 'docker_volumes', desc: 'Persistent data with bind mounts and named volumes, bridge/host networks, and --env-file configs.' },
    { name: 'Docker Compose & Multi-Container Apps', keyword: 'docker_compose', desc: 'Writing docker-compose.yml, service dependencies, scaling services, and compose networks.' },
    { name: 'Docker Registry, Security & Best Practices', keyword: 'docker_registry', desc: 'Pushing to Docker Hub/private registries, image scanning, .dockerignore, and multi-stage builds.' },
    { name: 'Docker in CI/CD Pipelines', keyword: 'docker_cicd', desc: 'Building images in GitHub Actions/Jenkins pipelines, tagging strategies, and registry automation.' },
    { name: 'Container Monitoring & Logging', keyword: 'docker_monitor', desc: 'docker stats, cAdvisor, Prometheus metrics from containers, and centralized logging with Loki/ELK.' },
    { name: 'Docker Swarm & Migration to Kubernetes', keyword: 'docker_swarm', desc: 'Swarm mode clustering, service deployment, and how Docker concepts map to Kubernetes objects.' }
  ],
  // Kubernetes
  kubernetes: [
    { name: 'Kubernetes Architecture & Core Concepts', keyword: 'k8s_arch', desc: 'Control plane, nodes, Pods, ReplicaSets, Deployments, and the Kubernetes API server.' },
    { name: 'Services, Ingress & Networking', keyword: 'k8s_net', desc: 'ClusterIP, NodePort, LoadBalancer services, Ingress controllers, and pod-to-pod networking.' },
    { name: 'ConfigMaps, Secrets & Persistent Volumes', keyword: 'k8s_config', desc: 'Injecting configuration, managing sensitive data with Secrets, PersistentVolumeClaims, and StorageClasses.' },
    { name: 'Deployments, Rolling Updates & Autoscaling', keyword: 'k8s_deploy', desc: 'Rolling vs recreate strategies, liveness/readiness probes, HPA, and VPA auto-scalers.' },
    { name: 'Helm, RBAC & Monitoring with Prometheus', keyword: 'k8s_helm', desc: 'Helm chart packaging, RBAC policies, Namespace isolation, and deploying Prometheus/Grafana stacks.' },
    { name: 'StatefulSets & Operators', keyword: 'k8s_stateful', desc: 'Running stateful apps (databases), stable network identities, ordered deployment, and custom operators.' },
    { name: 'Security: PodSecurity, NetworkPolicy & OPA', keyword: 'k8s_security', desc: 'Pod Security Standards, NetworkPolicy rules, Open Policy Agent (OPA/Gatekeeper), and image signing.' },
    { name: 'CKA/CKAD Certification Preparation', keyword: 'k8s_cert', desc: 'Certified Kubernetes Administrator exam objectives, hands-on labs with killer.sh, and time management strategies.' }
  ],
  // DevOps
  devops: [
    { name: 'DevOps Culture, Agile & Version Control', keyword: 'devops_intro', desc: 'DevOps principles, CI/CD mindset, Agile/Scrum practices, and Git branching strategies (GitFlow).' },
    { name: 'CI/CD Pipelines with Jenkins & GitHub Actions', keyword: 'devops_ci', desc: 'Build automation, running tests, Docker image building, and deploying via pipeline stages.' },
    { name: 'Infrastructure as Code (Terraform & Ansible)', keyword: 'devops_iac', desc: 'Declarative infrastructure with Terraform HCL, Ansible playbooks for configuration management.' },
    { name: 'Monitoring, Logging & Alerting', keyword: 'devops_monitor', desc: 'Prometheus metrics, Grafana dashboards, ELK stack (Elasticsearch, Logstash, Kibana), and PagerDuty alerts.' },
    { name: 'Security in DevOps (DevSecOps)', keyword: 'devops_sec', desc: 'SAST/DAST scanning in pipelines, container vulnerability scanning, secrets management, and SBOM.' },
    { name: 'Site Reliability Engineering (SRE)', keyword: 'devops_sre', desc: 'SLOs/SLAs/SLIs, error budgets, chaos engineering, blameless postmortems, and runbook creation.' },
    { name: 'GitOps & ArgoCD', keyword: 'devops_gitops', desc: 'GitOps principles, ArgoCD for Kubernetes continuous delivery, and reconciliation loop patterns.' },
    { name: 'DevOps Career & Tool Ecosystem', keyword: 'devops_career', desc: 'DevOps engineer career paths, popular tool stacks (HashiCorp, Datadog, Splunk), and certification roadmap.' }
  ],
  // Git
  git: [
    { name: 'Git Basics: Init, Staging & Committing', keyword: 'git_basics', desc: 'git init, git add, git commit, checking history with git log, and understanding the three trees.' },
    { name: 'Branching, Merging & Rebasing', keyword: 'git_branch', desc: 'git branch, git checkout/switch, fast-forward vs 3-way merge, and interactive rebase.' },
    { name: 'Remote Repositories & Collaboration', keyword: 'git_remote', desc: 'git remote, push, pull, fetch, upstream tracking branches, and the origin convention.' },
    { name: 'Conflict Resolution & Git Workflows', keyword: 'git_conflicts', desc: 'Reading conflict markers, git mergetool, GitFlow vs trunk-based development strategies.' },
    { name: 'Tags, Stash, Hooks & Git Internals', keyword: 'git_advanced', desc: 'Annotated tags, git stash pop, pre-commit hooks, .git directory internals, and git bisect.' },
    { name: 'Advanced Rebase & History Rewriting', keyword: 'git_rebase', desc: 'Interactive rebase (squash, fixup, edit), git cherry-pick, filter-branch, and git reflog recovery.' },
    { name: 'Git Submodules & Monorepo Strategies', keyword: 'git_mono', desc: 'Submodule vs subtree, Nx/Turborepo for monorepos, sparse checkout for large repositories.' },
    { name: 'Git in CI/CD & Security', keyword: 'git_security', desc: 'Signed commits (GPG), secret scanning, protected branches, CODEOWNERS, and .gitattributes.' }
  ],
  // GitHub
  github: [
    { name: 'GitHub Repositories & Profile Setup', keyword: 'gh_intro', desc: 'Creating repos, README.md, topics/tags, social preview, and optimizing your GitHub profile.' },
    { name: 'Pull Requests, Code Review & Forks', keyword: 'gh_pr', desc: 'Forking repos, creating PRs, requesting reviewers, resolving review comments, and squash merges.' },
    { name: 'GitHub Issues, Projects & Milestones', keyword: 'gh_issues', desc: 'Filing issues, labeling, assigning, linking to PRs, and managing work with GitHub Projects Kanban.' },
    { name: 'GitHub Actions: CI/CD Automation', keyword: 'gh_actions', desc: 'Writing workflow YAML, on: triggers, jobs/steps, using marketplace actions, and secrets management.' },
    { name: 'GitHub Pages, Releases & Security Features', keyword: 'gh_pages', desc: 'Deploying static sites, creating release notes, Dependabot, code scanning, and branch protections.' },
    { name: 'GitHub Advanced: Reusable Workflows & Composite Actions', keyword: 'gh_advanced', desc: 'Reusable workflow templates, composite actions, workflow_call triggers, and self-hosted runners.' },
    { name: 'GitHub Copilot & AI-Assisted Development', keyword: 'gh_copilot', desc: 'Using GitHub Copilot for code completion, test generation, PR summaries, and chat integration.' },
    { name: 'Open Source Contribution & GitHub Ecosystem', keyword: 'gh_oss', desc: 'Finding issues to contribute, CONTRIBUTING.md, CLA signing, GitHub Sponsors, and building your OSS portfolio.' }
  ],
  // Linux
  linux: [
    { name: 'Linux Filesystem & Shell Fundamentals', keyword: 'linux_basics', desc: 'FHS directory hierarchy, ls/cd/pwd/cp/mv/rm commands, and understanding absolute vs relative paths.' },
    { name: 'Users, Permissions & File Ownership', keyword: 'linux_perms', desc: 'chmod, chown, rwx notation, sudo, su, /etc/passwd, and understanding UID/GID.' },
    { name: 'Process Management & System Monitoring', keyword: 'linux_proc', desc: 'ps, top, htop, kill, nice, systemctl services, journalctl logs, and cron scheduling.' },
    { name: 'Networking Tools & SSH', keyword: 'linux_net', desc: 'ifconfig, ip addr, netstat, ss, ping, curl, SSH key-pair setup, and scp file transfers.' },
    { name: 'Shell Scripting & Package Management', keyword: 'linux_script', desc: 'Bash scripting (variables, loops, functions), apt/yum package managers, and writing cron jobs.' },
    { name: 'Text Processing: sed, awk, grep & pipes', keyword: 'linux_text', desc: 'Regular expressions, grep -E, sed substitutions, awk field processing, and pipeline composition.' },
    { name: 'System Administration & Security Hardening', keyword: 'linux_admin', desc: 'ufw firewall, fail2ban, SSH hardening, logrotate, disk management (lvm), and RAID concepts.' },
    { name: 'Linux for DevOps & Container Environments', keyword: 'linux_devops', desc: 'Linux namespaces/cgroups (underpinning containers), systemd services, and kernel tuning for production.' }
  ],
  // Networking
  networking: [
    { name: 'OSI & TCP/IP Models', keyword: 'net_osi', desc: 'Seven OSI layers, TCP/IP four-layer model, data encapsulation/decapsulation, and PDU types.' },
    { name: 'IP Addressing, Subnetting & CIDR', keyword: 'net_ip', desc: 'IPv4/IPv6 address classes, subnet masks, CIDR notation, and calculating host ranges.' },
    { name: 'Routing, Switching & VLANs', keyword: 'net_routing', desc: 'Routers vs switches, static/dynamic routing (OSPF, BGP basics), VLAN tagging, and STP.' },
    { name: 'DNS, DHCP, HTTP & Core Protocols', keyword: 'net_protocols', desc: 'DNS resolution process, DHCP lease cycle, HTTP/S request-response, FTP, SMTP, and SNMP.' },
    { name: 'Network Security & Wireless Technologies', keyword: 'net_sec', desc: 'Firewalls, ACLs, NAT, VPN tunnels, WPA2/WPA3 Wi-Fi security, and basic packet analysis with Wireshark.' },
    { name: 'Software-Defined Networking (SDN) & NFV', keyword: 'net_sdn', desc: 'SDN controller/data plane separation, OpenFlow, network function virtualization, and cloud networking.' },
    { name: 'Network Troubleshooting & Tools', keyword: 'net_troubleshoot', desc: 'ping, traceroute, nmap, tcpdump, Wireshark packet analysis, and systematic troubleshooting methodology.' },
    { name: 'CCNA & Network+ Certification Preparation', keyword: 'net_cert', desc: 'CCNA exam domains, CompTIA Network+ objectives, practice labs with Cisco Packet Tracer, and exam tips.' }
  ],
  // Android Development
  android_dev: [
    { name: 'Android Studio & Project Structure', keyword: 'and_intro', desc: 'Setting up Android Studio, Gradle build system, AndroidManifest.xml, and project directory layout.' },
    { name: 'Activities, Fragments & Lifecycle', keyword: 'and_lifecycle', desc: 'Activity lifecycle callbacks, Fragment transactions, Back Stack management, and ViewModel.' },
    { name: 'Layouts, Views & Material Design UI', keyword: 'and_ui', desc: 'XML layouts (ConstraintLayout, RecyclerView), View Binding, and applying Material Design components.' },
    { name: 'Kotlin Coroutines, Room & Retrofit', keyword: 'and_data', desc: 'Async with coroutines/Flow, local persistence with Room database, and REST API calls via Retrofit.' },
    { name: 'Jetpack Compose & App Publishing', keyword: 'and_compose', desc: 'Declarative UI with Compose, state hoisting, navigation component, and publishing to Google Play.' },
    { name: 'Kotlin Language Deep Dive', keyword: 'and_kotlin', desc: 'Kotlin null safety, data classes, sealed classes, extension functions, and coroutine Flow advanced patterns.' },
    { name: 'Testing: Unit, Integration & UI Tests', keyword: 'and_testing', desc: 'JUnit4/5, Mockito/MockK, Espresso UI testing, Robolectric, and the Testing Pyramid for Android.' },
    { name: 'Architecture Patterns: MVVM, Clean & MVI', keyword: 'and_arch', desc: 'MVVM with LiveData/StateFlow, Clean Architecture layers, Hilt dependency injection, and MVI pattern.' }
  ],
  // Flutter
  flutter: [
    { name: 'Dart Language Fundamentals', keyword: 'flutter_dart', desc: 'Dart variables, types, functions, null safety, async/await, and OOP concepts used in Flutter.' },
    { name: 'Flutter Widgets & Layout System', keyword: 'flutter_widgets', desc: 'Stateless vs Stateful widgets, the widget tree, Row/Column/Stack, and Container sizing.' },
    { name: 'State Management (Provider & Riverpod)', keyword: 'flutter_state', desc: 'setState(), InheritedWidget, Provider package, Riverpod, and when to use each approach.' },
    { name: 'Navigation, Animations & Gestures', keyword: 'flutter_nav', desc: 'Named routes, Navigator 2.0, hero animations, implicit animations, and GestureDetector.' },
    { name: 'Networking, Firebase & App Deployment', keyword: 'flutter_deploy', desc: 'HTTP/Dio package, Firebase integration, Firestore CRUD, and building for iOS/Android/Web.' },
    { name: 'Flutter Testing & Debugging', keyword: 'flutter_test', desc: 'Widget tests, integration tests, mock services, Flutter DevTools profiler, and golden tests.' },
    { name: 'Advanced Flutter: Custom Painters & Shaders', keyword: 'flutter_advanced', desc: 'CustomPainter, Canvas API, Fragment Shaders for visual effects, and performance with RepaintBoundary.' },
    { name: 'Flutter Desktop & Web Production', keyword: 'flutter_desktop', desc: 'Building for Windows/macOS/Linux/Web from one codebase, platform channels, and app publishing.' }
  ],
  // UI/UX Design
  uiux_design: [
    { name: 'UX Research & User Personas', keyword: 'ux_research', desc: 'User interviews, surveys, empathy maps, defining personas, and pain points discovery.' },
    { name: 'Information Architecture & Wireframing', keyword: 'ux_ia', desc: 'Site maps, user flows, low-fidelity wireframes, card sorting, and navigation structure.' },
    { name: 'Visual Design Principles & Typography', keyword: 'ux_visual', desc: 'Gestalt principles, visual hierarchy, type scales, color theory, contrast ratios, and whitespace.' },
    { name: 'Prototyping & Usability Testing', keyword: 'ux_proto', desc: 'Interactive prototypes in Figma, clickable mockups, hallway testing, and analyzing session recordings.' },
    { name: 'Design Systems & Accessibility (WCAG)', keyword: 'ux_system', desc: 'Component libraries, design tokens, accessibility audits, ARIA labels, and WCAG 2.1 AA standards.' },
    { name: 'Mobile UX & Touch Interaction Design', keyword: 'ux_mobile', desc: 'Touch target sizing, thumb zones, swipe patterns, haptic feedback, and iOS/Android HIG guidelines.' },
    { name: 'Motion Design & Micro-Interactions', keyword: 'ux_motion', desc: 'Purposeful animation principles, Lottie animations, transition design, and cognitive load reduction.' },
    { name: 'UX Portfolio & Career Development', keyword: 'ux_career', desc: 'Building a UX portfolio, case study writing, UX interviews, design challenges, and freelance vs full-time.' }
  ],
  // Figma
  figma: [
    { name: 'Figma Interface & Core Tools', keyword: 'fig_intro', desc: 'Frames vs groups, shape tools, the pen tool, layers panel, and basic vector editing.' },
    { name: 'Auto Layout & Responsive Design', keyword: 'fig_autolayout', desc: 'Auto Layout frames, padding, spacing, fill/fixed sizing, and building responsive card components.' },
    { name: 'Components, Variants & Libraries', keyword: 'fig_components', desc: 'Creating master components, defining variants with properties, and publishing shared team libraries.' },
    { name: 'Prototyping, Transitions & Overlays', keyword: 'fig_proto', desc: 'Adding prototype connections, interaction types (Smart Animate, Push, Slide), and overlay modals.' },
    { name: 'Design Tokens, Plugins & Developer Handoff', keyword: 'fig_tokens', desc: 'Style variables, using plugins (Iconify, Remove BG), inspect panel, and exporting assets for devs.' },
    { name: 'Figma Variables & Advanced Theming', keyword: 'fig_vars', desc: 'Collection variables for color modes (light/dark), spacing tokens, number variables, and mode switching.' },
    { name: 'Advanced Prototyping: Expressions & Conditions', keyword: 'fig_advanced', desc: 'Interactive component state machines, conditional flows, scrolling prototypes, and FigJam integration.' },
    { name: 'Figma for Design Teams & Handoff Workflows', keyword: 'fig_teams', desc: 'Branching for version control, annotation tools, Zeplin/Storybook handoff, and design QA process.' }
  ],
  // Graphic Design
  graphic_design: [
    { name: 'Design Principles: Contrast, Alignment, Repetition', keyword: 'gd_principles', desc: 'CARP principles, visual hierarchy, emphasis, balance, and proximity in layout design.' },
    { name: 'Color Theory & Palettes', keyword: 'gd_color', desc: 'Color wheel, complementary/analogous/triadic schemes, warm/cool psychology, and accessible palettes.' },
    { name: 'Typography & Font Pairing', keyword: 'gd_type', desc: 'Typeface categories (Serif, Sans-serif, Display), kerning, leading, font pairing strategies.' },
    { name: 'Logo Design & Brand Identity', keyword: 'gd_brand', desc: 'Logo types (wordmark, icon, combination), brand guidelines, vector design with Illustrator/Inkscape.' },
    { name: 'Layout Design & Print/Digital Production', keyword: 'gd_layout', desc: 'Grid systems, bleed/margin/gutter setup, exporting for print (CMYK/PDF) vs web (RGB/PNG/SVG).' },
    { name: 'Photo Manipulation & Compositing', keyword: 'gd_photo', desc: 'Photoshop layers, masks, adjustment layers, blending modes, and professional retouching techniques.' },
    { name: 'Motion Graphics & Video Design', keyword: 'gd_motion', desc: 'After Effects animation basics, kinetic typography, social media reels design, and video export settings.' },
    { name: 'Design Portfolio & Freelance Business', keyword: 'gd_career', desc: 'Building a Behance/Dribbble portfolio, client communication, pricing design work, and contracts basics.' }
  ],
  // Digital Marketing
  digital_marketing: [
    { name: 'Digital Marketing Fundamentals & Channels', keyword: 'dm_intro', desc: 'Overview of SEO, SEM, social media, email, content, and affiliate marketing channels.' },
    { name: 'Search Engine Optimization (SEO)', keyword: 'dm_seo', desc: 'On-page SEO (meta tags, keywords, headings), off-page (backlinks), and technical SEO (sitemaps, Core Web Vitals).' },
    { name: 'Social Media Marketing & Content Strategy', keyword: 'dm_social', desc: 'Platform algorithms (Instagram, LinkedIn, TikTok), content calendars, engagement metrics, and scheduling tools.' },
    { name: 'Paid Advertising: Google Ads & Meta Ads', keyword: 'dm_ads', desc: 'Campaign structure, bidding strategies (CPC, CPM), audience targeting, A/B ad testing, and ROAS analysis.' },
    { name: 'Email Marketing, Analytics & Conversion', keyword: 'dm_email', desc: 'Email list building, segmentation, A/B testing subject lines, Google Analytics 4, and conversion funnels.' },
    { name: 'Content Marketing & Copywriting', keyword: 'dm_content', desc: 'Content strategy, blog SEO, long-form vs short-form, AIDA copywriting formula, and content repurposing.' },
    { name: 'Influencer Marketing & Affiliate Programs', keyword: 'dm_influencer', desc: 'Influencer tiers (nano/micro/macro), partnership agreements, tracking affiliate conversions, and ROI calculation.' },
    { name: 'Marketing Analytics & Growth Hacking', keyword: 'dm_analytics', desc: 'GA4 advanced segments, attribution models, cohort analysis, funnel optimization, and A/B test statistical significance.' }
  ]
};

// Generic generator mapping for all remaining courses to ensure they also have high-fidelity customized topics.
function getTopicsForCourse(courseId, courseName) {
  if (TOPIC_TEMPLATES[courseId]) {
    return TOPIC_TEMPLATES[courseId];
  }
  
  // Custom templates computed for general classes
  return [
    { name: `Introduction to ${courseName}`, keyword: `${courseId}_intro`, desc: `Core principles, setup, environment configuration, and basic commands for ${courseName}.` },
    { name: `${courseName} Fundamental Architecture`, keyword: `${courseId}_arch`, desc: `Understanding execution cycles, data representations, and system structures.` },
    { name: `Working with ${courseName} Workflows`, keyword: `${courseId}_workflow`, desc: `Step-by-step practical implementation guidelines, command sequences, and integrations.` },
    { name: `Advanced Features & Optimization`, keyword: `${courseId}_advanced`, desc: `Scaling algorithms, code performance tweaks, tuning parameters, and enterprise solutions.` },
    { name: `Best Practices & Debugging`, keyword: `${courseId}_practices`, desc: `Standard coding styles, deployment checklists, common developer pitfalls, and troubleshooting.` }
  ];
}

// Procedural Content Generator
// Given a courseId and a topicIndex, it returns a detailed mock tutorial
function generateTopicContent(courseId, courseName, topicIndex) {
  const topics = getTopicsForCourse(courseId, courseName);
  const topic = topics[topicIndex] || topics[0];
  const nextTopicName = topics[topicIndex + 1] ? topics[topicIndex + 1].name : 'Course Completion';

  // 1. Prioritize authentic rich topic data from TOPIC_RICH_DATA
  const richCourse = TOPIC_RICH_DATA[courseId];
  if (richCourse && richCourse[topicIndex]) {
    const richData = richCourse[topicIndex];
    return {
      courseName,
      topicName: richData.name,
      topicDesc: topic.desc,
      nextTopicName,
      introduction: `In this topic, we dive deep into <strong>${richData.name}</strong>, a core subject area in ${courseName}. This topic covers essential structures and concepts needed to build real-world applications in this domain.`,
      aiExplanation: richData.levels.beginner.explanation,
      beginnerExplanation: richData.levels.beginner.explanation + `<br><br><strong>Beginner Analogy:</strong> ${richData.levels.beginner.analogy}<br><br><strong>Practice Task:</strong> ${richData.levels.beginner.practiceTask}`,
      intermediateExplanation: richData.levels.intermediate.explanation + `<br><br><strong>Practice Task:</strong> ${richData.levels.intermediate.practiceTask}`,
      advancedExplanation: richData.levels.advanced.explanation + `<br><br><strong>Practice Task:</strong> ${richData.levels.advanced.practiceTask}`,
      codeSnippet: richData.levels.beginner.codeExample || richData.levels.intermediate.codeExample || richData.levels.advanced.codeExample,
      diagramText: `[Concept: ${richData.name}] ---> [Local Practice] ---> [Evaluation]`,
      bestPractices: richData.levels.beginner.keyPoints || [],
      commonMistakes: richData.levels.intermediate.keyPoints || [],
      practiceProblems: richData.levels.beginner.practiceTask,
      miniChallenge: richData.levels.advanced.practiceTask,
      quizQuestions: richData.quizzes || [],
      interviewQuestions: (richData.interviewQA || []).map(i => ({ q: i.q, a: i.a }))
    };
  }
  
  // Generate realistic explanations & code snippets based on the course category and keywords
  let codeSnippet = '';
  let beginnerExplanation = '';
  let intermediateExplanation = '';
  let advancedExplanation = '';
  let diagramText = '';
  let bestPractices = [];
  let commonMistakes = [];
  let quizQuestions = [];
  let practiceProblems = '';
  let miniChallenge = '';
  let interviewQuestions = [];

  // Generate specialized code blocks depending on courseId
  if (courseId === 'python' || courseId === 'pandas' || courseId === 'numpy' || courseId === 'scikitlearn' || courseId === 'tensorflow' || courseId === 'machine_learning' || courseId === 'deep_learning' || courseId === 'data_science') {
    codeSnippet = `import pandas as pd
import numpy as np

# Sample Data creation
data = {
    'Student_ID': [101, 102, 103, 104],
    'Score': [85, 92, 78, 95],
    'Completed': [True, False, True, True]
}

df = pd.DataFrame(data)

# Calculate metrics privately (local processing)
mean_score = df['Score'].mean()
active_students = df[df['Completed'] == True]

print(f"Mean Score: {mean_score}")
print("Active Student Records:")
print(active_students)`;
    
    diagramText = `[User Activity Log] ---> [Pandas Local DataFrame] ---> [Local Training Loop] ---> [Update Vector]`;
    
    beginnerExplanation = `Think of this like an Excel spreadsheet, but in code! Instead of clicking on cells, you use commands. A DataFrame is just a table with rows and columns. We load data into it, and we can look at it or clean it up easily.`;
    intermediateExplanation = `DataFrames load structured data in-memory using highly optimized column-oriented arrays. We use indexes to slice data and apply functions vectorially, which runs hundreds of times faster than standard python loops.`;
    advancedExplanation = `For high efficiency, leverage PyArrow engines, chunking processes for large files, and avoid setting copies in chain indexing. In Federated contexts, process datasets iteratively and output only summary tensors.`;
    
    bestPractices = [
      "Always use vectorized operations instead of iterating with 'for' loops.",
      "Check data types with 'df.info()' immediately after reading data.",
      "Filter columns early in memory-constrained devices."
    ];
    
    commonMistakes = [
      "Chained Indexing (e.g. df[x][y] = z) which creates setting-on-copy warnings.",
      "Failing to specify inplace=True or reassigning when updating indices.",
      "Loading giant CSV files entirely in memory without chunksize parameters."
    ];
    
    practiceProblems = "Write a script that loads a CSV file containing user logs, groups records by User ID, and calculates the cumulative sum of minutes studied locally. Filter out entries with negative duration values.";
    
    miniChallenge = "Create a 3x3 DataFrame with custom column names. Write a lambda function that replaces null scores with the column mean and verify it works without throwing warnings.";

    quizQuestions = [
      {
        question: "Which data structures are primary in Pandas?",
        options: ["Arrays & Tuples", "Series & DataFrames", "Lists & Dictionaries", "Nodes & Trees"],
        answer: 1,
        explanation: "Pandas represents 1D data as a Series and 2D tabular data as a DataFrame."
      },
      {
        question: "Why should we avoid iterating over DataFrames using standard python loops?",
        options: ["It causes syntax errors", "It is insecure", "It is slow compared to vectorized operations", "Loops are not supported in Pandas"],
        answer: 2,
        explanation: "Vectorized operations run in highly optimized C libraries, avoiding Python loop overhead."
      },
      {
        question: "How do you drop duplicate rows in a DataFrame?",
        options: ["df.delete_duplicates()", "df.clean_duplicates()", "df.drop_duplicates()", "df.remove_rows()"],
        answer: 2,
        explanation: "The drop_duplicates() method removes duplicate rows based on specified columns or all columns."
      }
    ];

    interviewQuestions = [
      {
        q: "What is the difference between loc and iloc in Pandas?",
        a: "loc selects data using label-based indexing (e.g., column names like 'Age' or indexes like 'A'), whereas iloc selects data using integer-based positions (e.g., column index 0, 1, 2)."
      },
      {
        q: "How does Pandas handle missing values, and how can you resolve them?",
        a: "Pandas marks missing values as NaN. You can check for nulls using df.isnull().sum(), drop them using df.dropna(), or fill them using df.fillna(value) with a constant or mean/median."
      },
      {
        q: "How does local data manipulation in Pandas align with Federated Learning?",
        a: "In a Federated Learning architecture, Pandas allows the client device to clean, filter, and preprocess raw log data locally, ensuring that raw logs never leave the device before model training."
      }
    ];

  } else if (courseId === 'javascript' || courseId === 'reactjs' || courseId === 'nodejs' || courseId === 'html' || courseId === 'css' || courseId === 'flutter' || courseId === 'android_dev') {
    codeSnippet = `// Simulated Client-Side Local Storage & Aggregation Handler
class LocalStorageLogger {
  constructor(userId) {
    this.userId = userId;
    this.logKey = \`learning_log_\${userId}\`;
  }

  logActivity(course, duration, score) {
    const logs = this.getLogs();
    logs.push({
      timestamp: new Date().toISOString(),
      course,
      duration,
      score
    });
    localStorage.setItem(this.logKey, JSON.stringify(logs));
    console.log("Logged activity locally to protect user privacy!");
  }

  getLogs() {
    const raw = localStorage.getItem(this.logKey);
    return raw ? JSON.parse(raw) : [];
  }
}

const logger = new LocalStorageLogger("student_402");
logger.logActivity("${courseName}", 25, 90);`;
    
    diagramText = `[User Interaction] ---> [JS Event Handlers] ---> [Local Storage Cache] ---> [Local Model Trainer]`;
    
    beginnerExplanation = `Think of this block like writing an instruction manual. We declare variables to remember values, run functions to perform jobs, and use event listeners to wait for user actions.`;
    intermediateExplanation = `We use asynchronous design patterns (Promises, callbacks, async/await) to fetch resources and update client UI without blocking the active page thread.`;
    advancedExplanation = `Optimize scripts by reducing closure references, avoiding memory leaks on detaching DOM listeners, implementing progressive loading strategies, and using worker threads for client calculation workloads.`;
    
    bestPractices = [
      "Always declare variables with 'const' by default; only use 'let' if reassigning.",
      "Throttle or debounce high-frequency events like resize, scroll, or search inputs.",
      "Always sanitize input parameters before passing to HTML components to prevent XSS."
    ];
    
    commonMistakes = [
      "Using == instead of strict comparison ===, which can cause unexpected type conversions.",
      "Failing to clean up event listeners or intervals, leading to memory leaks.",
      "Accessing nested object variables without optional chaining (?.) resulting in runtime exceptions."
    ];
    
    practiceProblems = "Write a function that parses local storage records and returns the average duration studied, filtering out records older than 7 days.";
    
    miniChallenge = "Create a responsive event throttle function that updates a local search field query, delaying executions by exactly 300 milliseconds.";

    quizQuestions = [
      {
        question: "Which browser API stores structured data persistently without expiration?",
        options: ["SessionStorage", "Cookies", "LocalStorage", "IndexedDB only"],
        answer: 2,
        explanation: "LocalStorage stores key-value pairs persistently across browser sessions until cleared explicitly."
      },
      {
        question: "What does the 'const' keyword guarantee in variable declarations?",
        options: ["The value inside the variable can never mutate", "The variable reference cannot be reassigned", "The variable has global execution scope", "The variable is immediately saved in a database"],
        answer: 1,
        explanation: "const prevents variable reassignment, though values inside objects/arrays assigned to it can still be mutated."
      },
      {
        question: "How do you handle rejected values in an async/await function?",
        options: ["With a catch block in a try-catch statement", "With a then() statement", "By returning a default string", "By letting the page reload"],
        answer: 0,
        explanation: "Async/await functions handle errors by enclosing the asynchronous block inside a standard try-catch structure."
      }
    ];

    interviewQuestions = [
      {
        q: "What is the event loop and how does JavaScript handle concurrency?",
        a: "JavaScript is a single-threaded language. Concurrency is handled by the event loop, which delegates asynchronous tasks (like fetches, setTimeouts) to the browser APIs, pushes callbacks to the task queue, and executes them once the main call stack is empty."
      },
      {
        q: "What are closures in JavaScript, and what is a practical use case?",
        a: "A closure is the combination of a function bundled together with references to its surrounding state. Closures allow inner functions to access outer function variables. A use case is data encapsulation (creating private variables)."
      },
      {
        q: "How can client-side local caching improve offline application usability?",
        a: "By saving critical course state and user details locally in LocalStorage or IndexedDB, the app can query, load pages, and run quizzes offline. A service worker acts as a network proxy, reading these cache buffers."
      }
    ];

  } else if (courseId === 'sql' || courseId === 'mysql' || courseId === 'postgresql' || courseId === 'mongodb') {
    codeSnippet = `-- Relational database schema for tracking student progress
CREATE TABLE IF NOT EXISTS student_courses (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    progress_percentage INT DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query to calculate aggregated progress safely
SELECT 
    course_id, 
    AVG(progress_percentage) as average_progress,
    COUNT(student_id) as enrolled_count
FROM student_courses
GROUP BY course_id
ORDER BY average_progress DESC;`;
    
    diagramText = `[App Engine] ---> [SQL Database Query] ---> [Structured Table Data] ---> [Local UI Renderer]`;
    
    beginnerExplanation = `Think of SQL databases like a collection of filing cabinets. Each drawer holds folders (tables) with columns (categories of information) and rows (individual files). SQL is the language we use to search, sort, and add new files to the cabinets.`;
    intermediateExplanation = `We use database normalizations to reduce redundancies and index fields (like IDs) to speed up searches. Join statements allow us to combine rows from multiple tables using foreign keys.`;
    advancedExplanation = `For scaling relational platforms, implement query analyzer tools, configure composite indexes, and set transaction boundaries carefully (ACID compliance) to avoid deadlocks.`;
    
    bestPractices = [
      "Always write explicit column names instead of utilizing SELECT * in production code.",
      "Create indexes on fields heavily filtered in WHERE clauses or JOIN keys.",
      "Use parameterized queries to defend against SQL Injection vectors."
    ];
    
    commonMistakes = [
      "Performing joins on non-indexed columns, which slows operations down significantly.",
      "Forgetting to add primary keys or foreign key relationships when setting schemas.",
      "Running recursive queries or subqueries inside loops in application layers."
    ];
    
    practiceProblems = "Write a query that retrieves all courses where the average rating is above 4.5 and the total students enrolled are greater than 5,000.";
    
    miniChallenge = "Create a database schema layout containing a users table and a courses table, linked via an intermediate enrollment table with custom primary keys.";

    quizQuestions = [
      {
        question: "Which SQL clause is used to filter records based on aggregated function outputs?",
        options: ["WHERE", "HAVING", "GROUP BY", "FILTER BY"],
        answer: 1,
        explanation: "The HAVING clause filters rows after aggregation, whereas WHERE filters rows before aggregation."
      },
      {
        question: "What is a Foreign Key?",
        options: ["A key that has a foreign value", "A column that uniquely identifies a row in its own table", "A field in one table that references the Primary Key of another table", "A security encryption credential"],
        answer: 2,
        explanation: "A Foreign Key establishes a link between data in two tables by matching the primary key in another table."
      },
      {
        question: "In NoSQL databases like MongoDB, how is data structured?",
        options: ["In rows and columns", "In flexible JSON-like documents", "In structured XML tables", "In binary trees only"],
        answer: 1,
        explanation: "MongoDB is a document-oriented NoSQL database that stores data in BSON, a binary representation of JSON files."
      }
    ];

    interviewQuestions = [
      {
        q: "What is the difference between INNER JOIN and LEFT JOIN?",
        a: "INNER JOIN returns records that have matching values in both tables. LEFT JOIN returns all records from the left table, and the matched records from the right table. If there is no match, the result is NULL from the right table."
      },
      {
        q: "What are ACID properties in database transaction management?",
        a: "ACID stands for Atomicity (all or nothing), Consistency (preserves database rules), Isolation (independent concurrent transactions), and Durability (transactions survive crashes)."
      },
      {
        q: "How does a decentralized database structure support user privacy?",
        a: "Decentralized applications keep user data on local schemas (such as local SQLite or local storage files) instead of a monolithic centralized database, drastically reducing the target surface for hack attacks."
      }
    ];

  } else if (courseId === 'data_structures' || courseId === 'algorithms') {
    codeSnippet = `# Python: Binary Search Tree (BST) implementation
class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BinarySearchTree:
    def __init__(self):
        self.root = None

    def insert(self, value):
        new_node = Node(value)
        if not self.root:
            self.root = new_node
            return
        current = self.root
        while True:
            if value < current.value:
                if current.left is None:
                    current.left = new_node
                    return
                current = current.left
            else:
                if current.right is None:
                    current.right = new_node
                    return
                current = current.right

    def inorder(self, node, result=[]):
        if node:
            self.inorder(node.left, result)
            result.append(node.value)
            self.inorder(node.right, result)
        return result

bst = BinarySearchTree()
for val in [50, 30, 70, 20, 40, 60, 80]:
    bst.insert(val)

print("Inorder Traversal:", bst.inorder(bst.root, []))
# Output: [20, 30, 40, 50, 60, 70, 80]`;

    diagramText = `[Input Array] --> [BST Insert Operations] --> [Balanced Tree Nodes] --> [O(log n) Search]`;

    beginnerExplanation = `Think of a Binary Search Tree like a well-organized library. Every book on the left shelf is earlier in the alphabet, and every book on the right is later. To find a book, you just decide left or right at each step — so you never have to check every book!`;
    intermediateExplanation = `In a BST, insert/search/delete operations run in O(log n) time on average when the tree is balanced. The key invariant is: every left child is smaller than its parent, and every right child is larger. Traversal orders (inorder/preorder/postorder) produce different orderings of the elements.`;
    advancedExplanation = `In production systems, unbalanced BSTs degrade to O(n). Self-balancing trees like AVL Trees and Red-Black Trees use rotation operations to maintain O(log n) guarantees. For range queries, augmented BSTs and Segment Trees provide O(log n + k) retrieval.`;

    bestPractices = [
      "Always analyze time and space complexity before choosing a data structure.",
      "Use hash maps (O(1) average) over arrays (O(n)) for frequent lookup operations.",
      "Prefer iterative implementations over recursive ones for large inputs to avoid stack overflow."
    ];

    commonMistakes = [
      "Using a plain BST without balancing, causing O(n) worst-case for sorted input.",
      "Forgetting base cases in recursive functions, causing infinite recursion or wrong results.",
      "Off-by-one errors in array indexing and loop boundary conditions."
    ];

    practiceProblems = "Implement a function to check if a Binary Tree is a valid BST. Then implement level-order (BFS) traversal using a queue.";

    miniChallenge = "Write a function that finds the kth smallest element in a BST using inorder traversal without storing all elements in memory.";

    quizQuestions = [
      {
        question: "What is the average time complexity for search in a balanced Binary Search Tree?",
        options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
        answer: 2,
        explanation: "In a balanced BST, each comparison halves the search space, yielding O(log n) time."
      },
      {
        question: "Which data structure is best for implementing a LIFO (Last In First Out) structure?",
        options: ["Queue", "Stack", "Hash Map", "Heap"],
        answer: 1,
        explanation: "A Stack follows LIFO order — the last element pushed is the first one popped."
      },
      {
        question: "What is the time complexity of quicksort in the average case?",
        options: ["O(n²)", "O(n log n)", "O(log n)", "O(n)"],
        answer: 1,
        explanation: "Quicksort has O(n log n) average case with a good pivot selection; worst case is O(n²) with poor pivots."
      }
    ];

    interviewQuestions = [
      {
        q: "Explain the difference between BFS and DFS graph traversals.",
        a: "BFS (Breadth-First Search) uses a queue and explores all neighbors level by level — ideal for shortest path in unweighted graphs. DFS (Depth-First Search) uses a stack (or recursion) and explores as deep as possible before backtracking — useful for topological sort, cycle detection, and path finding."
      },
      {
        q: "What is dynamic programming and how does it differ from divide and conquer?",
        a: "Dynamic programming solves problems by breaking them into overlapping subproblems and storing their results (memoization/tabulation) to avoid redundant computation. Divide and conquer also splits into subproblems but they are non-overlapping (e.g., MergeSort). DP is used when subproblems share dependencies."
      },
      {
        q: "What is the difference between a Hash Table and a Balanced BST for storing key-value pairs?",
        a: "Hash Tables offer O(1) average lookup, insert, delete but don't maintain order and have worst-case O(n) with collisions. Balanced BSTs offer O(log n) operations but maintain sorted order, enabling range queries and ordered iteration — use a TreeMap/SortedDict when ordering matters."
      }
    ];

  } else if (courseId === 'artificial_intelligence' || courseId === 'matplotlib' || courseId === 'power_bi' || courseId === 'tableau' || courseId === 'excel') {
    codeSnippet = `import matplotlib.pyplot as plt
import numpy as np

# Simulating AI model accuracy improvement over training epochs
epochs = np.arange(1, 21)
train_acc = 1 - np.exp(-0.3 * epochs) + np.random.normal(0, 0.02, 20)
val_acc   = 1 - np.exp(-0.25 * epochs) + np.random.normal(0, 0.03, 20)

# Plot training vs validation accuracy
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

axes[0].plot(epochs, train_acc, 'b-o', label='Train Accuracy', linewidth=2)
axes[0].plot(epochs, val_acc,   'r--s', label='Val Accuracy',   linewidth=2)
axes[0].set_title('Model Training Progress', fontsize=14)
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('Accuracy')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# Bar chart: per-category quiz scores
categories = ['Python', 'SQL', 'ML', 'Cloud', 'Security']
scores = [88, 75, 92, 68, 81]
colors = ['#00f2fe', '#b152ff', '#fe6c9f', '#4facfe', '#43e97b']
axes[1].bar(categories, scores, color=colors, edgecolor='white')
axes[1].set_title('Quiz Scores by Category', fontsize=14)
axes[1].set_ylabel('Score (%)')
axes[1].set_ylim(0, 100)

plt.tight_layout()
plt.savefig('learning_progress.png', dpi=150)
plt.show()`;

    diagramText = `[Raw Data] --> [Matplotlib/Tableau/BI Tool] --> [Visual Chart] --> [Insight & Decision]`;

    beginnerExplanation = `Think of data visualization like reading a map instead of a list of GPS coordinates. Charts transform boring numbers into clear pictures — a bar chart tells you "which category is biggest" at a glance, without reading every number.`;
    intermediateExplanation = `Effective visualization requires choosing the right chart type: line charts for trends over time, bar charts for comparisons, scatter plots for correlations, and heatmaps for matrix density. Formatting (colors, labels, gridlines) dramatically affects how quickly insights are communicated.`;
    advancedExplanation = `For large-scale BI dashboards, implement data sampling strategies to handle millions of rows, use incremental refresh in tools like Power BI, optimize DAX/SQL queries behind visuals, and design accessible color palettes meeting WCAG contrast ratios.`;

    bestPractices = [
      "Choose the chart type that best represents the relationship in your data (trend, comparison, distribution, composition).",
      "Always label axes, add titles, and include units of measurement in every chart.",
      "Limit the number of data series per chart to avoid visual clutter — 5 or fewer series is ideal."
    ];

    commonMistakes = [
      "Using pie charts with more than 5 slices — they become unreadable and misleading.",
      "Truncating the Y-axis baseline (not starting at 0) to exaggerate differences visually.",
      "Using rainbow color scales for sequential data — use single-hue gradients instead."
    ];

    practiceProblems = "Create a dashboard with 3 linked charts: a line chart of weekly study hours, a bar chart of quiz scores per course, and a scatter plot of hours studied vs. quiz performance.";

    miniChallenge = "Build a matplotlib figure with two subplots: a histogram of student scores (20 bins) and a box plot comparing scores by difficulty level (Beginner/Intermediate/Advanced).";

    quizQuestions = [
      {
        question: "Which chart type is best for showing how a value changes over time?",
        options: ["Pie Chart", "Bar Chart", "Line Chart", "Scatter Plot"],
        answer: 2,
        explanation: "Line charts connect data points chronologically, making trends, growth, and fluctuations over time immediately visible."
      },
      {
        question: "In Power BI DAX, what does the CALCULATE function do?",
        options: ["It creates new tables from existing ones", "It modifies the filter context in which a measure is evaluated", "It imports data from external APIs", "It formats numbers as currency"],
        answer: 1,
        explanation: "CALCULATE is the most powerful DAX function — it evaluates an expression after modifying the filter context, enabling complex conditional aggregations."
      },
      {
        question: "What is the purpose of a pivot table in Excel or data analysis?",
        options: ["To sort columns alphabetically", "To summarize, group, and aggregate large datasets interactively", "To apply conditional formatting", "To create VBA macros automatically"],
        answer: 1,
        explanation: "Pivot tables let you dynamically group rows, apply aggregations (SUM, COUNT, AVG), and slice data by different dimensions without writing any code."
      }
    ];

    interviewQuestions = [
      {
        q: "What is the difference between data visualization and data storytelling?",
        a: "Data visualization is the technical act of rendering data as charts and graphs. Data storytelling wraps those visuals in a narrative — context, insight, and a call to action — guiding the audience from 'what does this show?' to 'what should we do about it?'"
      },
      {
        q: "How would you handle a dataset with 10 million rows in a BI tool like Power BI?",
        a: "Use DirectQuery mode to query the source database on demand instead of importing all rows. Alternatively, implement aggregation tables, use Power BI's incremental refresh policy, and optimize the underlying SQL/DAX queries with proper indexing."
      },
      {
        q: "What are the key differences between Tableau and Power BI?",
        a: "Tableau excels at deep, flexible visual exploration with a drag-and-drop interface and strong mapping capabilities. Power BI is tightly integrated with the Microsoft ecosystem (Excel, Azure, Teams), offers DAX for advanced calculations, and is typically more cost-effective for enterprise Microsoft shops."
      }
    ];

  } else if (courseId === 'cloud_computing' || courseId === 'aws' || courseId === 'azure' || courseId === 'google_cloud' || courseId === 'docker' || courseId === 'kubernetes' || courseId === 'devops' || courseId === 'git' || courseId === 'github' || courseId === 'linux') {
    codeSnippet = `# Dockerfile: Multi-stage build for a Python web application
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim AS production
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY . .
EXPOSE 8080
ENV APP_ENV=production

# GitHub Actions CI/CD Workflow (embedded as comment)
# name: Deploy to Cloud
# on: [push]
# jobs:
#   build-and-deploy:
#     runs-on: ubuntu-latest
#     steps:
#     - uses: actions/checkout@v3
#     - name: Build Docker Image
#       run: docker build -t myapp:latest .
#     - name: Push to Registry
#       run: docker push registry.example.com/myapp:latest

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]`;

    diagramText = `[Developer Push] --> [CI/CD Pipeline] --> [Docker Build] --> [Cloud Registry] --> [K8s Deployment]`;

    beginnerExplanation = `Think of Docker like a shipping container for your app. Just like real containers let ships carry any goods in a standard box, Docker packages your code + all its dependencies into one portable unit that runs identically on any computer.`;
    intermediateExplanation = `Container orchestration with Kubernetes automates the deployment, scaling, and healing of containerized apps across clusters of machines. You declare the desired state (e.g., "3 replicas of my API pod"), and Kubernetes continuously works to maintain it — restarting failed containers, distributing load, and rolling out updates safely.`;
    advancedExplanation = `For production-grade cloud infrastructure, implement GitOps workflows (ArgoCD/Flux), use Helm charts for versioned Kubernetes deployments, apply RBAC and Network Policies for zero-trust security, and instrument services with Prometheus/Grafana for observability at scale.`;

    bestPractices = [
      "Always use multi-stage Docker builds to minimize final image size — production images should contain only runtime dependencies.",
      "Store infrastructure as code (Terraform/Pulumi) in version control alongside application code.",
      "Apply the principle of least privilege to IAM roles — grant only the permissions a service actually needs."
    ];

    commonMistakes = [
      "Running containers as the root user — always specify a non-root USER in your Dockerfile.",
      "Hardcoding secrets or API keys in Dockerfiles or source code — use environment variables or secrets managers.",
      "Not setting resource requests/limits on Kubernetes pods, causing noisy-neighbor resource contention."
    ];

    practiceProblems = "Write a docker-compose.yml that runs a web app container, a PostgreSQL database container, and a Redis cache container — all on the same private network with proper health checks.";

    miniChallenge = "Create a GitHub Actions workflow that: (1) runs unit tests on every push, (2) builds a Docker image on success, and (3) pushes it to GitHub Container Registry on the main branch.";

    quizQuestions = [
      {
        question: "What is the key difference between a Docker image and a Docker container?",
        options: [
          "They are the same thing",
          "An image is a read-only template; a container is a running instance of an image",
          "A container is stored on disk; an image runs in memory",
          "Images are for Linux only; containers work on all OSes"
        ],
        answer: 1,
        explanation: "A Docker image is the static blueprint (layers of filesystem changes). A container is a live, running process created from that image."
      },
      {
        question: "In Kubernetes, what is a Pod?",
        options: [
          "A cluster of nodes",
          "A load balancer configuration",
          "The smallest deployable unit, containing one or more containers sharing network and storage",
          "A virtual machine running on a cloud host"
        ],
        answer: 2,
        explanation: "A Pod is Kubernetes' basic scheduling unit. Containers in a Pod share the same IP address, port space, and volumes."
      },
      {
        question: "Which Git command creates a new branch AND switches to it in one step?",
        options: ["git branch new-feature", "git checkout new-feature", "git checkout -b new-feature", "git switch --create new-feature"],
        answer: 2,
        explanation: "git checkout -b <name> creates and switches to a new branch. The newer equivalent is git switch -c <name>."
      }
    ];

    interviewQuestions = [
      {
        q: "Explain the difference between horizontal and vertical scaling in cloud architecture.",
        a: "Vertical scaling (scale up) means adding more CPU/RAM to a single server — it has hardware limits and causes downtime. Horizontal scaling (scale out) means adding more server instances behind a load balancer — it's more resilient, cost-efficient, and enables near-infinite capacity. Modern cloud architectures prefer horizontal scaling with stateless services."
      },
      {
        q: "What is Infrastructure as Code and why is it important?",
        a: "Infrastructure as Code (IaC) means defining cloud resources (servers, networks, databases) in declarative configuration files (Terraform HCL, CloudFormation YAML) instead of clicking through cloud consoles. Benefits: version control for infrastructure, reproducible environments, automated provisioning, and reduced configuration drift."
      },
      {
        q: "How does a CI/CD pipeline improve software delivery?",
        a: "CI (Continuous Integration) automatically runs tests on every code push, catching bugs early. CD (Continuous Delivery/Deployment) automatically deploys passing builds to staging or production. Together, they reduce manual steps, enable frequent releases (daily or multiple times per day), decrease deployment risk via small incremental changes, and provide fast feedback loops."
      }
    ];

  } else if (courseId === 'cyber_security' || courseId === 'networking') {
    codeSnippet = `# Python: Demonstrating secure password hashing (never store plaintext!)
import hashlib
import os
import hmac

def hash_password(password: str) -> tuple[str, str]:
    """Securely hash a password with a random salt using SHA-256."""
    salt = os.urandom(32)  # 256-bit random salt
    key = hashlib.pbkdf2_hmac(
        'sha256',          # Hash algorithm
        password.encode('utf-8'),
        salt,
        100000             # 100,000 iterations (OWASP recommended minimum)
    )
    return salt.hex(), key.hex()

def verify_password(password: str, salt_hex: str, stored_hash: str) -> bool:
    """Verify a password against its stored hash."""
    salt = bytes.fromhex(salt_hex)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    # Use hmac.compare_digest to prevent timing attacks
    return hmac.compare_digest(key.hex(), stored_hash)

# Usage
salt, hashed = hash_password("SecureP@ssw0rd!")
print(f"Salt: {salt[:16]}...")
print(f"Hash: {hashed[:16]}...")
print(f"Verification: {verify_password('SecureP@ssw0rd!', salt, hashed)}")`;

    diagramText = `[User Password] --> [PBKDF2 + Salt] --> [Stored Hash] ··· [Login Attempt] --> [Verify (HMAC)] --> [Auth Decision]`;

    beginnerExplanation = `Think of cybersecurity like the locks and alarms on your house. A password is your house key — but instead of storing a copy of the key (plaintext), we store a scrambled fingerprint (hash) that lets us verify you have the right key without keeping it around.`;
    intermediateExplanation = `Cryptographic hashing is one-way: given a hash, you cannot reverse-engineer the original password. Adding a unique random salt before hashing prevents rainbow table attacks (precomputed hash lookups). Using key derivation functions (PBKDF2, bcrypt, Argon2) with high iteration counts slows down brute-force cracking.`;
    advancedExplanation = `For zero-knowledge authentication systems, implement Secure Remote Password (SRP) protocol or use hardware security keys (FIDO2/WebAuthn). In network security, combine defense-in-depth layers: WAF, IDS/IPS, network segmentation with micro-perimeters, and encrypt all data in transit with TLS 1.3.`;

    bestPractices = [
      "Never store plaintext passwords — always use bcrypt, Argon2, or PBKDF2 with unique salts.",
      "Enforce HTTPS everywhere; redirect HTTP to HTTPS and use HSTS headers.",
      "Implement the principle of least privilege — every user and service gets minimum required access."
    ];

    commonMistakes = [
      "Using MD5 or SHA-1 for password hashing — they are cryptographically broken for this purpose.",
      "Storing secrets (API keys, DB passwords) in source code or environment-accessible config files.",
      "Trusting user input without sanitization — leading to SQL injection, XSS, or command injection."
    ];

    practiceProblems = "Implement a Python function that validates a JWT token's signature using the HS256 algorithm. Then identify three OWASP Top 10 vulnerabilities in a given code snippet.";

    miniChallenge = "Set up a basic network packet capture using Python's scapy library. Filter for HTTP traffic on port 80 and display the source IP, destination IP, and request method.";

    quizQuestions = [
      {
        question: "What type of attack does adding a random salt to passwords prevent?",
        options: ["Man-in-the-Middle attacks", "Brute force attacks", "Rainbow table attacks", "DDoS attacks"],
        answer: 2,
        explanation: "Rainbow tables are precomputed hash dictionaries. A unique salt per password makes each hash unique, rendering precomputed tables useless."
      },
      {
        question: "Which OSI layer does SSL/TLS encryption primarily operate at?",
        options: ["Layer 2 (Data Link)", "Layer 3 (Network)", "Layer 4 (Transport)", "Layer 7 (Application)"],
        answer: 2,
        explanation: "TLS operates primarily at Layer 4 (Transport) but is often associated with Layer 6/7 for application-level encryption. It encrypts data between Transport and Application layers."
      },
      {
        question: "What does a Firewall primarily do?",
        options: ["Encrypts data stored on disk", "Monitors and filters network traffic based on security rules", "Backs up network logs to cloud storage", "Assigns IP addresses to network devices"],
        answer: 1,
        explanation: "A firewall inspects incoming and outgoing network packets against a ruleset, blocking traffic that doesn't match allowed policies."
      }
    ];

    interviewQuestions = [
      {
        q: "What is the difference between symmetric and asymmetric encryption?",
        a: "Symmetric encryption uses the same key for both encryption and decryption (AES, ChaCha20) — it's fast but requires secure key exchange. Asymmetric encryption uses a public/private key pair (RSA, ECC) — the public key encrypts, the private key decrypts. TLS uses asymmetric encryption during the handshake to securely exchange a symmetric session key."
      },
      {
        q: "Explain the CIA triad in cybersecurity.",
        a: "CIA stands for Confidentiality (only authorized users can access data — enforced by encryption and access controls), Integrity (data cannot be altered without detection — enforced by hashing and digital signatures), and Availability (systems are accessible when needed — enforced by redundancy, backups, and DDoS protection)."
      },
      {
        q: "What is a Cross-Site Scripting (XSS) attack and how do you prevent it?",
        a: "XSS occurs when an attacker injects malicious scripts into web pages viewed by other users — stealing session cookies, redirecting users, or keylogging. Prevention: escape/encode all user-supplied output before rendering in HTML, use Content Security Policy (CSP) headers, validate input server-side, and use HttpOnly/Secure cookie flags."
      }
    ];

  } else if (courseId === 'uiux_design' || courseId === 'figma' || courseId === 'graphic_design' || courseId === 'digital_marketing') {
    codeSnippet = `/* Design System: CSS Custom Properties (Design Tokens)
   Implementing a consistent color palette, typography scale,
   and spacing system — the foundation of any great UI */

:root {
  /* Color Palette */
  --color-primary:    hsl(210, 100%, 56%);   /* #2196F3 - Trust Blue */
  --color-secondary:  hsl(262, 83%, 66%);    /* #9C6FFF - Creative Purple */
  --color-success:    hsl(142, 71%, 45%);    /* #34C759 - Positive Green */
  --color-danger:     hsl(4, 90%, 58%);      /* #F44336 - Alert Red */
  --color-surface:    hsl(0, 0%, 100%);      /* White surface */
  --color-bg:         hsl(220, 14%, 96%);    /* Soft gray background */

  /* Typography Scale (Major Third: ×1.25) */
  --text-xs:    0.64rem;   /* 10.24px */
  --text-sm:    0.8rem;    /* 12.8px  */
  --text-base:  1rem;      /* 16px    */
  --text-lg:    1.25rem;   /* 20px    */
  --text-xl:    1.563rem;  /* 25px    */
  --text-2xl:   1.953rem;  /* 31.25px */
  --text-3xl:   2.441rem;  /* 39px    */

  /* Spacing (8px base grid) */
  --space-1:  0.25rem;  /* 4px  */
  --space-2:  0.5rem;   /* 8px  */
  --space-4:  1rem;     /* 16px */
  --space-8:  2rem;     /* 32px */
  --space-16: 4rem;     /* 64px */

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}`;

    diagramText = `[User Research] --> [Wireframe] --> [Prototype] --> [Usability Test] --> [Design System] --> [Production]`;

    beginnerExplanation = `Think of a design system like LEGO bricks. Instead of sculpting every piece from scratch, you have a collection of standardized, reusable components (buttons, cards, inputs) that snap together consistently. This ensures every screen in your app looks and feels like it belongs to the same family.`;
    intermediateExplanation = `Effective UI design follows key visual principles: hierarchy (what users see first), proximity (related elements grouped together), alignment (creating invisible grid lines), and contrast (making important elements stand out). In Figma, Auto Layout replicates CSS Flexbox — enabling components that resize and reflow automatically.`;
    advancedExplanation = `Enterprise-scale design systems use design tokens as the single source of truth — JSON files mapping semantic names (color.brand.primary) to platform-specific values (HEX for web, RGB for iOS, XML for Android). Tools like Style Dictionary transform tokens across all platforms from one definition, ensuring pixel-perfect consistency.`;

    bestPractices = [
      "Start every project with user research — a beautiful interface for the wrong user mental model will fail.",
      "Design for mobile-first, then progressively enhance for larger screens.",
      "Maintain a 4.5:1 contrast ratio for body text to meet WCAG AA accessibility standards."
    ];

    commonMistakes = [
      "Designing in isolation without user feedback until late in the process — test early, test often.",
      "Using too many typefaces (max 2: one for headings, one for body), too many colors, and inconsistent spacing.",
      "Ignoring accessibility: missing alt text, poor color contrast, small tap targets (<44px), and keyboard navigation."
    ];

    practiceProblems = "Design a mobile-first onboarding flow for a learning app. Create: (1) a user persona, (2) a low-fidelity wireframe of 3 screens, and (3) an interactive Figma prototype with micro-animations.";

    miniChallenge = "Create a design token set in Figma using variables: define 5 semantic colors (primary, secondary, success, danger, neutral), 5 text sizes, and 5 spacing values. Apply them to a button component with 3 variants (primary, secondary, danger).";

    quizQuestions = [
      {
        question: "What is the primary purpose of a design system?",
        options: [
          "To replace the need for developers",
          "To provide a single source of truth for UI components, tokens, and guidelines ensuring consistency",
          "To automate the generation of user personas",
          "To eliminate the need for user testing"
        ],
        answer: 1,
        explanation: "A design system is a collection of reusable components, design tokens, and documentation that enables teams to build consistent products efficiently."
      },
      {
        question: "In UX design, what does 'user persona' refer to?",
        options: [
          "A real user's profile photograph",
          "A fictional representation of a target user segment based on research data",
          "The color scheme chosen for a specific user",
          "The database schema for user accounts"
        ],
        answer: 1,
        explanation: "A persona is a research-based archetype representing key user segments, including goals, frustrations, behaviors, and demographics — guiding design decisions."
      },
      {
        question: "What does the acronym 'CTR' stand for in digital marketing?",
        options: ["Content Transfer Rate", "Click-Through Rate", "Customer Target Reach", "Conversion Trigger Ratio"],
        answer: 1,
        explanation: "Click-Through Rate (CTR) = (Clicks ÷ Impressions) × 100. It measures how often people who see an ad or link actually click on it."
      }
    ];

    interviewQuestions = [
      {
        q: "Explain the difference between UX and UI design.",
        a: "UX (User Experience) design focuses on the overall feel, usability, and functionality of a product — research, information architecture, user flows, and wireframing. UI (User Interface) design focuses on the visual presentation — colors, typography, iconography, and component styling. Good UX ensures the product makes sense; good UI ensures it looks polished. They are complementary, not competing."
      },
      {
        q: "What is SEO and what are the three main pillars?",
        a: "SEO (Search Engine Optimization) improves a website's visibility in organic search results. The three pillars are: (1) Technical SEO — site speed, mobile-friendliness, crawlability, structured data; (2) On-page SEO — keyword optimization, title tags, meta descriptions, heading structure, content quality; (3) Off-page SEO — backlinks from authoritative sites, brand mentions, and social signals."
      },
      {
        q: "How would you measure the success of a digital marketing campaign?",
        a: "Define KPIs aligned with campaign goals: for awareness, track impressions, reach, CPM; for engagement, track CTR, likes, comments, shares; for conversion, track conversion rate, CPA (Cost Per Acquisition), ROAS (Return on Ad Spend); for retention, track email open rates, CLV (Customer Lifetime Value). Use Google Analytics 4 and platform dashboards to build attribution models tying spend to outcomes."
      }
    ];

  } else {
    // Default fallback template for other courses
    codeSnippet = `# Configure local deployment environment
name: Local Integration Test
on:
  push:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code Repository
      uses: actions/checkout@v2
      
    - name: Run Secure Scan
      run: |
        echo "Validating local client dependencies..."
        echo "Checking privacy compliance schemas..."
        echo "Build successful! Standard nodes online."`;
    
    diagramText = `[Local Component Node] ---> [Local Gateway] ---> [Secure Local Proxy] ---> [Integrated Shell Output]`;
    
    beginnerExplanation = `Welcome to ${courseName}. Think of this as establishing the foundational workspace guidelines, settings, and environments to run code securely, compile programs, and deploy resources.`;
    intermediateExplanation = `We look at automating deployment operations, ensuring credentials are isolated, structuring security boundaries, and designing reliable networks.`;
    advancedExplanation = `For enterprise-grade execution, setup auto-scalers, automate deployments using declarative configuration schemas, manage secrets cryptographically, and trace metrics via logging dashboards.`;
    
    bestPractices = [
      `Always keep development secrets isolated and never upload credentials to online repositories.`,
      `Structure configurations declaratively rather than running manual scripts.`,
      `Document step-by-step installation guides for colleagues to prevent local environment bugs.`
    ];
    
    commonMistakes = [
      `Using default admin credentials or blank passwords during environment setups.`,
      `Running files or setups with root permissions when lower permissions are sufficient.`,
      `Failing to update local configuration records, leading to drift between staging and local environments.`
    ];
    
    practiceProblems = `Outline a step-by-step setup config file detailing how you would install, deploy, and inspect the status of ${courseName} on a local workstation.`;
    
    miniChallenge = `Configure a basic automated workflow rule that triggers a local build validation step whenever updates are made to the configuration files.`;

    quizQuestions = [
      {
        question: `What is a core benefit of using ${courseName}?`,
        options: ["Eliminating the need for source code", "Standardizing settings and improving automation/reliability", "Running websites without browsers", "Automatic documentation creation"],
        answer: 1,
        explanation: `Using standardized toolsets like ${courseName} guarantees reproducible systems, automating actions, and reducing configuration errors.`
      },
      {
        question: "Which approach is best for managing credentials?",
        options: ["Writing them in comments", "Saving them in public repositories", "Storing them in local environment variables or secure key vaults", "Deleting credentials entirely"],
        answer: 2,
        explanation: "Environment variables and secure key vaults isolate credentials from code repositories, protecting project secrets."
      },
      {
        question: "What does the term 'Idempotency' mean in configurations?",
        options: ["Running commands in random order", "The operation produces the same system state no matter how many times it runs", "Executing script codes concurrently", "Compressing files into zip folders"],
        answer: 1,
        explanation: "An idempotent operation leaves the system in the same state if run repeatedly, preventing duplicates or corrupted configurations."
      }
    ];

    interviewQuestions = [
      {
        q: `What is the primary role of ${courseName} in modern development teams?`,
        a: `It provides standardized environment control, automates repeatable tasks, lowers project integration friction, and ensures systems execute predictably across all team nodes.`
      },
      {
        q: "What is a security baseline, and why is it important?",
        a: "A security baseline is a set of minimum security controls defined for systems (e.g., ports disabled, authentication requirements). It creates a standard reference point for vulnerability auditing."
      },
      {
        q: "How does local sandboxing support privacy in client-side applications?",
        a: "Local sandboxing isolates the application workspace from external processes, blocking unauthorized apps from reading the student's files or logs, reinforcing local Federated privacy."
      }
    ];
  }

  return {
    courseName,
    topicName: topic.name,
    topicDesc: topic.desc,
    nextTopicName,
    introduction: `In this topic, we dive deep into <strong>${topic.name}</strong>, a core subject area in ${courseName}. This topic covers essential structures and concepts needed to build real-world applications in this domain.`,
    aiExplanation: `Here is a high-level summary of ${topic.name}: This area establishes the syntax rules, data formats, and logic needed to manipulate features in ${courseName}. It bridges the gap between low-level operations and high-level architectural frameworks, focusing on developer ergonomics and resource optimization.`,
    beginnerExplanation,
    intermediateExplanation,
    advancedExplanation,
    codeSnippet,
    diagramText,
    bestPractices,
    commonMistakes,
    practiceProblems,
    miniChallenge,
    quizQuestions,
    interviewQuestions
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// TOPIC_RICH_DATA: Per-topic Beginner/Intermediate/Advanced content,
//                  10 Quiz Questions, and 5 Interview Q&A pairs per topic.
// ═══════════════════════════════════════════════════════════════════════════════

const TOPIC_RICH_DATA = {

  // ────────────────────── PYTHON ──────────────────────
  python: [
    {
      name: 'Python Basics & Variables',
      levels: {
        beginner: {
          explanation: 'Python is a beginner-friendly programming language that reads like plain English. A variable is simply a named container that holds data. Think of it like a labelled jar — you name it (e.g., `age = 25`) and Python remembers what\'s inside.',
          keyPoints: ['Variables hold data using the `=` assignment operator', 'Python is dynamically typed — no need to declare types', 'Primitive types: int, float, str, bool', 'Use `print()` to display output'],
          analogy: 'Think of variables like labelled sticky notes. You write a number or word on it and stick it somewhere — you can always look it up by name.',
          codeExample: `# Creating variables\nname = "Alice"\nage = 25\nheight = 5.6\nis_student = True\n\nprint(f"Name: {name}, Age: {age}")`,
          practiceTask: 'Create 4 variables: your name, age, city, and whether you like coding. Print them all.'
        },
        intermediate: {
          explanation: 'Python uses dynamic typing with type inference at runtime. Variable names follow naming conventions (snake_case). You can use `type()` to check variable types and `id()` to inspect memory addresses. Mutable vs immutable types affect how variables are referenced.',
          keyPoints: ['`type()` returns the type of a variable at runtime', 'Immutable types (int, str, tuple) cannot be changed after creation', 'Variables are just references to objects in memory', 'Use type annotations for clarity: `name: str = "Alice"`'],
          codeExample: `x: int = 10\ny = x        # y points to the same object\nprint(id(x) == id(y))  # True (small int cache)\n\nname: str = "Alice"\nprint(type(name))  # <class 'str'>\nprint(name.upper())  # ALICE`,
          practiceTask: 'Demonstrate the difference between mutable (list) and immutable (tuple) variables with examples.'
        },
        advanced: {
          explanation: 'Under the hood, Python variables are references to heap-allocated objects. CPython uses reference counting + cyclic GC. Integer objects are cached between -5 and 256 (small int cache). Understanding `__slots__` in classes reduces memory overhead. Global variables live in module `__dict__`.',
          keyPoints: ['Python\'s memory model uses reference counting for GC', 'Small integers (-5 to 256) are interned/cached by CPython', 'Use `sys.getrefcount()` to check reference counts', '`__slots__` restricts instance attributes, saving memory', 'LEGB rule: Local → Enclosing → Global → Built-in scope chain'],
          codeExample: `import sys\n\nx = 256\ny = 256\nprint(x is y)  # True — cached\n\na = 1000\nb = 1000\nprint(a is b)  # False — new objects\n\nprint(sys.getrefcount(x))  # ref count`,
          practiceTask: 'Use `sys.getsizeof()` to compare memory usage of an empty list vs a list with 100 integers.'
        }
      },
      quizzes: [
        { question: 'What is the output of `print(type(3.14))`?', options: ['<class \'int\'>', '<class \'float\'>', '<class \'str\'>', '<class \'double\'>'], answer: 1, explanation: '3.14 is a floating point number, so type() returns float.' },
        { question: 'Which of the following is a valid variable name in Python?', options: ['2var', 'my-var', 'my_var', 'class'], answer: 2, explanation: 'Variable names can contain letters, digits (not first), and underscores. Hyphens and keywords are invalid.' },
        { question: 'What does dynamic typing mean?', options: ['Variables change value automatically', 'Types are checked at compile time', 'Variables can hold any type without declaring it', 'Python runs on dynamic hardware'], answer: 2, explanation: 'Dynamic typing means variable types are determined at runtime, not declared in advance.' },
        { question: 'What is the value of `bool(0)`?', options: ['True', 'False', 'None', 'Error'], answer: 1, explanation: '0 is falsy in Python, so bool(0) returns False.' },
        { question: 'Which operator is used for integer division?', options: ['/', '//', '%', '**'], answer: 1, explanation: '// is the floor division operator which returns an integer result.' },
        { question: 'What does `id(x)` return?', options: ['The value of x', 'The type of x', 'The memory address of x', 'The size of x'], answer: 2, explanation: 'id() returns the unique identity (memory address) of the object.' },
        { question: 'What is the result of `"3" + "4"` in Python?', options: ['7', '34', '"34"', 'TypeError'], answer: 1, explanation: 'String concatenation joins the two strings, resulting in "34".' },
        { question: 'Which of the following is immutable?', options: ['list', 'dict', 'set', 'tuple'], answer: 3, explanation: 'Tuples are immutable — once created, their elements cannot be changed.' },
        { question: 'What is f-string syntax used for?', options: ['File operations', 'Formatted string literals', 'Function definitions', 'Float conversions'], answer: 1, explanation: 'f-strings (f"...") allow embedding expressions inside string literals.' },
        { question: 'What does `x = x + 1` do?', options: ['Creates a new variable', 'Increments x by 1', 'Causes a syntax error', 'Deletes x'], answer: 1, explanation: 'It reads x, adds 1, and rebinds the name x to the new value.' }
      ],
      interviewQA: [
        { q: 'What is the difference between `is` and `==` in Python?', a: '`==` checks value equality (do they have the same value?), while `is` checks identity (do they point to the same object in memory?). Example: `a = [1,2]; b = [1,2]; a == b` is True but `a is b` is False.' },
        { q: 'Explain Python\'s dynamic typing with an example.', a: 'In Python, variables do not have fixed types. You can write `x = 5` (int) then `x = "hello"` (str) without error. The type is determined at runtime based on the assigned value.' },
        { q: 'What is the LEGB rule in Python?', a: 'LEGB stands for Local → Enclosing → Global → Built-in. Python resolves variable names by searching these scopes in order. It looks locally first, then in any enclosing function, then module-level, then Python\'s built-in names.' },
        { q: 'What are Python\'s mutable and immutable types?', a: 'Immutable: int, float, str, tuple, frozenset — cannot be changed after creation. Mutable: list, dict, set — can be modified in place. Mutable objects can cause unexpected bugs when shared across functions.' },
        { q: 'How does Python\'s garbage collection work?', a: 'CPython uses reference counting as the primary GC mechanism. When an object\'s reference count drops to 0, it is deallocated immediately. A cyclic GC also handles circular references that reference counting cannot resolve.' }
      ]
    },
    {
      name: 'Control Flow & Conditional Logic',
      levels: {
        beginner: {
          explanation: 'Control flow lets your program make decisions. `if` runs a block when a condition is True, `elif` checks additional conditions, and `else` is the fallback. Loops (`for`, `while`) repeat code. Think of it like a flowchart with yes/no decision boxes.',
          keyPoints: ['`if condition:` runs code only when condition is True', '`elif` adds extra branches', '`else` handles all remaining cases', '`for item in iterable:` loops over each element', '`while condition:` loops until condition is False'],
          analogy: 'Like a traffic light: if green → go, elif yellow → slow down, else (red) → stop.',
          codeExample: `score = 75\n\nif score >= 90:\n    grade = "A"\nelif score >= 75:\n    grade = "B"\nelif score >= 60:\n    grade = "C"\nelse:\n    grade = "F"\n\nprint(f"Grade: {grade}")\n\n# For loop\nfor i in range(5):\n    print(i)`,
          practiceTask: 'Write a program that asks for a temperature and prints "Hot" if > 35°C, "Warm" if > 20°C, "Cool" if > 10°C, else "Cold".'
        },
        intermediate: {
          explanation: 'Python supports ternary expressions: `x = a if condition else b`. The `break` statement exits a loop early, `continue` skips the current iteration, and `pass` is a no-op placeholder. `range()` generates lazy sequences. Nested loops create matrix-like iterations.',
          keyPoints: ['Ternary: `value = x if cond else y`', '`break` exits the loop completely', '`continue` skips to next iteration', '`enumerate(iterable)` gives (index, value) pairs', '`zip()` combines multiple iterables element-by-element'],
          codeExample: `# Ternary\nstatus = "Pass" if score >= 60 else "Fail"\n\n# Enumerate\nfruits = ["apple", "banana", "cherry"]\nfor idx, fruit in enumerate(fruits):\n    print(f"{idx}: {fruit}")\n\n# Zip\nnames = ["Alice", "Bob"]\nscores = [95, 87]\nfor name, s in zip(names, scores):\n    print(f"{name}: {s}")`,
          practiceTask: 'Use enumerate and zip together to print a formatted report of student names and their scores with rankings.'
        },
        advanced: {
          explanation: 'Python\'s for loops use the iterator protocol (`__iter__`, `__next__`). Generator functions using `yield` create lazy iterators saving memory. `itertools` provides powerful combinatorial functions. Understanding short-circuit evaluation (`and`, `or`) is crucial for optimizing conditional chains.',
          keyPoints: ['For loops call `iter()` then repeatedly call `next()`', 'Generators use `yield` and are evaluated lazily', 'Short-circuit: `a and b` — if `a` is False, `b` is never evaluated', '`itertools.chain()`, `product()`, `combinations()` for advanced iteration', 'Match statements (Python 3.10+) for structural pattern matching'],
          codeExample: `from itertools import chain, combinations\n\n# Generator\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nfor num in fibonacci(8):\n    print(num, end=" ")\n\n# Match (Python 3.10+)\ncommand = "quit"\nmatch command:\n    case "quit": print("Exiting")\n    case "help": print("Help menu")\n    case _: print("Unknown")`,
          practiceTask: 'Write a generator that yields prime numbers up to N using the Sieve of Eratosthenes.'
        }
      },
      quizzes: [
        { question: 'What keyword starts a conditional check in Python?', options: ['when', 'if', 'check', 'case'], answer: 1, explanation: '`if` starts conditional blocks in Python.' },
        { question: 'What does `break` do inside a loop?', options: ['Pauses the loop', 'Skips one iteration', 'Exits the loop entirely', 'Restarts the loop'], answer: 2, explanation: '`break` terminates the loop immediately and resumes code after the loop.' },
        { question: 'What is the output of `range(2, 8, 2)`?', options: ['[2,4,6,8]', '[2,4,6]', '[2,3,4,5,6,7]', '[2,8]'], answer: 1, explanation: 'range(start, stop, step) produces 2, 4, 6 — stopping before 8.' },
        { question: 'Which is a valid ternary expression in Python?', options: ['x = if a > b then a else b', 'x = a if a > b else b', 'x = (a > b) ? a : b', 'x = a when a > b'], answer: 1, explanation: 'Python ternary: `value = a if condition else b`.' },
        { question: 'What does `continue` do in a loop?', options: ['Breaks the loop', 'Skips to the next iteration', 'Restarts from the beginning', 'Exits the program'], answer: 1, explanation: '`continue` skips the rest of the current iteration and goes to the next one.' },
        { question: 'What is the output of `for i in range(3): print(i)`?', options: ['0 1 2 3', '0 1 2', '1 2 3', '1 2'], answer: 1, explanation: 'range(3) produces 0, 1, 2 — starting at 0 and stopping before 3.' },
        { question: 'What does `enumerate()` return?', options: ['Just indices', 'Just values', 'Pairs of (index, value)', 'A reversed list'], answer: 2, explanation: '`enumerate()` returns (index, value) pairs for each element.' },
        { question: 'What happens when a `while` loop\'s condition is never False?', options: ['It raises StopIteration', 'It runs once and stops', 'It becomes an infinite loop', 'Python auto-terminates it after 1000 cycles'], answer: 2, explanation: 'An infinite loop runs forever until a `break` or external interruption.' },
        { question: 'Which operator short-circuits in Python?', options: ['+ and -', 'and / or', '* and /', '== and !='], answer: 1, explanation: '`and` stops evaluating if the first operand is False; `or` stops if first is True.' },
        { question: 'What does the `pass` statement do?', options: ['Exits the function', 'Pauses execution', 'Does nothing (placeholder)', 'Prints an empty line'], answer: 2, explanation: '`pass` is a no-op used as a placeholder in empty blocks.' }
      ],
      interviewQA: [
        { q: 'What is the difference between `break`, `continue`, and `pass`?', a: '`break` exits the loop entirely. `continue` skips the rest of the current iteration and moves to the next. `pass` is a no-operation placeholder that does nothing — useful in empty blocks like stub functions or empty loops.' },
        { q: 'How does Python\'s `for` loop work internally?', a: 'Python\'s `for` loop calls `iter()` on the iterable to get an iterator object, then repeatedly calls `next()` on it. When `StopIteration` is raised, the loop ends. This is the iterator protocol — any object implementing `__iter__` and `__next__` can be used in a for loop.' },
        { q: 'What are generator functions and when should you use them?', a: 'Generator functions use `yield` instead of `return`. They produce values lazily (one at a time), consuming very little memory. Use them when processing large datasets or infinite sequences where you don\'t need all values at once.' },
        { q: 'Explain short-circuit evaluation in Python.', a: 'In `a and b`, if `a` is False, Python doesn\'t evaluate `b` (result is already False). In `a or b`, if `a` is True, Python skips `b` (result is already True). This is used for guard clauses: `user and user.is_admin` avoids errors if user is None.' },
        { q: 'What is pattern matching in Python 3.10+?', a: 'The `match/case` statement provides structural pattern matching. Unlike simple `if/elif`, it matches the structure and shape of data, not just values. You can match against literals, sequences, mappings, class patterns, and use wildcard `_` as the default case.' }
      ]
    },
    {
      name: 'Functions & Module Scope',
      levels: {
        beginner: {
          explanation: 'Functions are reusable blocks of code. Define with `def`, call by name. They accept inputs (parameters) and can return outputs (return value). Modules are Python files that group related functions — import them to reuse code across files.',
          keyPoints: ['Define: `def function_name(params):`', 'Call: `result = function_name(args)`', 'Return a value with `return`', 'Parameters are local to the function', '`import module_name` to use external code'],
          analogy: 'A function is like a recipe — you give it ingredients (parameters), it does steps, and returns a dish (return value).',
          codeExample: `def calculate_area(width, height):\n    """Calculate rectangle area."""\n    return width * height\n\narea = calculate_area(5, 3)\nprint(f"Area: {area}")\n\n# Module import\nimport math\nprint(math.sqrt(16))  # 4.0`,
          practiceTask: 'Write a function `bmi(weight, height)` that calculates and returns BMI, and another that classifies it as Underweight/Normal/Overweight.'
        },
        intermediate: {
          explanation: 'Default parameters, `*args` (variable positional), and `**kwargs` (variable keyword) make functions flexible. Lambda functions are anonymous one-liners. First-class functions can be passed as arguments (higher-order functions). Closures capture variables from their enclosing scope.',
          keyPoints: ['`*args` collects extra positional args as a tuple', '`**kwargs` collects extra keyword args as a dict', 'Default parameters: `def f(x, y=10):`', 'Lambda: `fn = lambda x: x * 2`', 'Higher-order functions accept or return functions'],
          codeExample: `# Args / Kwargs\ndef log(*messages, level="INFO"):\n    for msg in messages:\n        print(f"[{level}] {msg}")\n\nlog("Started", "Connected", level="DEBUG")\n\n# Closure\ndef multiplier(factor):\n    def multiply(n):\n        return n * factor\n    return multiply\n\ndouble = multiplier(2)\nprint(double(7))  # 14`,
          practiceTask: 'Build a `make_counter()` closure that returns a function. Each call to the returned function increments and returns a count.'
        },
        advanced: {
          explanation: 'Python functions are first-class objects stored in memory. Decorators are functions that wrap other functions, using `functools.wraps` to preserve metadata. The `global` and `nonlocal` keywords modify outer scope variables. Understanding `__code__`, `__closure__`, and `__globals__` gives deep function introspection.',
          keyPoints: ['Decorators: `@my_decorator` is syntactic sugar for `f = my_decorator(f)`', 'Use `functools.wraps(fn)` to preserve docstring/name', '`nonlocal` declares a variable from enclosing scope', 'Function objects have `__code__`, `__name__`, `__doc__` attributes', '`functools.lru_cache` memoizes expensive function results'],
          codeExample: `import functools\n\ndef timer(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        import time\n        start = time.time()\n        result = fn(*args, **kwargs)\n        print(f"{fn.__name__} took {time.time()-start:.4f}s")\n        return result\n    return wrapper\n\n@timer\ndef slow_sum(n):\n    return sum(range(n))\n\nslow_sum(1_000_000)`,
          practiceTask: 'Create a `@retry(times=3)` decorator that retries a function up to N times if it raises an exception.'
        }
      },
      quizzes: [
        { question: 'How do you define a function in Python?', options: ['function myFunc():', 'def myFunc():', 'fn myFunc():', 'define myFunc():'], answer: 1, explanation: 'The `def` keyword is used to define functions in Python.' },
        { question: 'What does `*args` represent in a function signature?', options: ['A required argument', 'Variable keyword arguments', 'Variable positional arguments', 'A default argument'], answer: 2, explanation: '`*args` captures any number of positional arguments as a tuple.' },
        { question: 'What is a lambda function?', options: ['A class method', 'An anonymous one-line function', 'A built-in function', 'A function with no return value'], answer: 1, explanation: 'Lambda creates a small anonymous function: `lambda x: x + 1`.' },
        { question: 'What does a function return if no `return` statement is given?', options: ['0', 'Empty string', 'None', 'False'], answer: 2, explanation: 'Without a `return` statement, Python functions implicitly return `None`.' },
        { question: 'What is a closure in Python?', options: ['A function with no parameters', 'A function that captures variables from its enclosing scope', 'A locked file object', 'A class with private methods'], answer: 1, explanation: 'A closure is an inner function that remembers variables from the outer function\'s scope even after the outer function has returned.' },
        { question: 'What does `**kwargs` collect?', options: ['Required arguments', 'Positional arguments as a list', 'Keyword arguments as a dictionary', 'Default arguments'], answer: 2, explanation: '`**kwargs` collects extra keyword arguments into a dictionary.' },
        { question: 'Which module provides `lru_cache`?', options: ['sys', 'collections', 'functools', 'itertools'], answer: 2, explanation: '`functools.lru_cache` memoizes function results to speed up repeated calls.' },
        { question: 'What does a decorator do?', options: ['Adds comments to functions', 'Wraps a function to extend its behavior', 'Creates a copy of a function', 'Converts a function to a class'], answer: 1, explanation: 'A decorator is a function that takes a function and returns a modified version of it.' },
        { question: 'What keyword is used to modify a variable in an enclosing (but not global) scope?', options: ['global', 'outer', 'nonlocal', 'enclosed'], answer: 2, explanation: '`nonlocal` declares that a variable belongs to the nearest enclosing scope, not local or global.' },
        { question: 'What is the output of `(lambda x, y: x ** y)(2, 3)`?', options: ['6', '8', '5', '9'], answer: 1, explanation: 'The lambda computes 2**3 = 8.' }
      ],
      interviewQA: [
        { q: 'What is the difference between `*args` and `**kwargs`?', a: '`*args` allows a function to accept any number of positional arguments, collected as a tuple. `**kwargs` allows any number of keyword arguments, collected as a dictionary. Both are used to write flexible, generic functions.' },
        { q: 'How do decorators work in Python?', a: 'A decorator is a function that takes another function as input, wraps it with additional behavior, and returns the wrapped function. `@decorator` is syntactic sugar for `fn = decorator(fn)`. Use `@functools.wraps(fn)` inside to preserve the original function\'s name and docstring.' },
        { q: 'What is the difference between global and local scope?', a: 'Local scope is inside a function — variables defined there only exist during that call. Global scope is module-level — variables exist for the program\'s lifetime. Using the `global` keyword inside a function allows modifying a global variable.' },
        { q: 'Explain the concept of a first-class function.', a: 'In Python, functions are first-class objects, meaning they can be assigned to variables, passed as arguments, returned from other functions, and stored in data structures. This enables functional programming patterns like map(), filter(), and higher-order functions.' },
        { q: 'What is memoization and how does `lru_cache` implement it?', a: 'Memoization caches the results of expensive function calls so that repeated calls with the same arguments return the cached result instantly. `functools.lru_cache(maxsize=N)` implements this automatically, using an LRU (Least Recently Used) eviction strategy when the cache is full.' }
      ]
    },
    {
      name: 'Object-Oriented Programming (OOP)',
      levels: {
        beginner: {
          explanation: 'OOP organizes code into "objects" that bundle data (attributes) and behavior (methods) together. A class is a blueprint; an object is an instance of that blueprint. Think of a class as a cookie cutter and objects as the cookies.',
          keyPoints: ['Class: blueprint for creating objects', 'Object: an instance of a class', '`__init__`: constructor method called on creation', '`self`: reference to the current instance', 'Methods are functions inside a class'],
          analogy: 'A class `Car` is like a factory blueprint. Every car (object) made from it has wheels, engine (attributes) and can drive, honk (methods).',
          codeExample: `class Dog:\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed\n    \n    def bark(self):\n        return f"{self.name} says: Woof!"\n\nmy_dog = Dog("Buddy", "Labrador")\nprint(my_dog.bark())`,
          practiceTask: 'Create a `BankAccount` class with `deposit()`, `withdraw()`, and `get_balance()` methods.'
        },
        intermediate: {
          explanation: 'Inheritance lets classes extend other classes. `super()` calls the parent class. Encapsulation uses `_private` (convention) and `__mangled` (name mangling) attributes. Properties (`@property`) control attribute access with getters/setters. Polymorphism allows different classes to implement the same method differently.',
          keyPoints: ['Inheritance: `class Child(Parent):`', '`super().__init__()` calls parent constructor', '`@property` creates computed attributes', 'Dunder methods (`__str__`, `__len__`, `__eq__`) customize behavior', 'Multiple inheritance supported with MRO (C3 linearization)'],
          codeExample: `class Animal:\n    def __init__(self, name):\n        self.name = name\n    \n    def speak(self):\n        raise NotImplementedError\n\nclass Dog(Animal):\n    def speak(self):\n        return f"{self.name}: Woof!"\n\nclass Cat(Animal):\n    def speak(self):\n        return f"{self.name}: Meow!"\n\nfor animal in [Dog("Rex"), Cat("Whiskers")]:\n    print(animal.speak())`,
          practiceTask: 'Build an inheritance hierarchy: Shape → Circle, Rectangle. Implement `area()` and `perimeter()` in each.'
        },
        advanced: {
          explanation: 'Metaclasses are classes of classes — they control class creation. Abstract base classes (ABC) enforce method implementation. `__slots__` optimizes memory. Descriptors (`__get__`, `__set__`) power Python\'s property system. Multiple inheritance uses C3 MRO (Method Resolution Order) — inspect with `ClassName.__mro__`.',
          keyPoints: ['`abc.ABC` + `@abstractmethod` define abstract classes', 'Metaclasses control class creation via `__new__` and `__init_subclass__`', '`__slots__ = [...]` prevents arbitrary attributes, saves memory', 'Descriptors implement the attribute access protocol', 'Dataclasses (`@dataclass`) auto-generate `__init__`, `__repr__`, `__eq__`'],
          codeExample: `from abc import ABC, abstractmethod\nfrom dataclasses import dataclass\n\nclass Shape(ABC):\n    @abstractmethod\n    def area(self) -> float: ...\n\n@dataclass\nclass Circle(Shape):\n    radius: float\n    \n    def area(self) -> float:\n        import math\n        return math.pi * self.radius ** 2\n\nc = Circle(5)\nprint(f"Area: {c.area():.2f}")`,
          practiceTask: 'Implement a `Singleton` metaclass that ensures only one instance of a class can exist at a time.'
        }
      },
      quizzes: [
        { question: 'What is a class in Python?', options: ['A built-in function', 'A blueprint for creating objects', 'A type of loop', 'A module'], answer: 1, explanation: 'A class is a blueprint that defines attributes and methods for creating objects.' },
        { question: 'What is `self` in a Python class method?', options: ['A keyword for global variables', 'A reference to the current instance', 'A Python built-in', 'A static variable'], answer: 1, explanation: '`self` refers to the specific instance that called the method.' },
        { question: 'What does `__init__` do?', options: ['Initializes a module', 'Destructs an object', 'Constructor — initializes object attributes', 'Imports a class'], answer: 2, explanation: '`__init__` is the constructor called automatically when an object is created.' },
        { question: 'What is inheritance in OOP?', options: ['Copying a class\'s code', 'A class reusing and extending another class\'s attributes/methods', 'Deleting old classes', 'A method calling another method'], answer: 1, explanation: 'Inheritance allows a child class to inherit attributes and methods from a parent class.' },
        { question: 'Which method makes an object printable in a readable format?', options: ['__init__', '__str__', '__new__', '__del__'], answer: 1, explanation: '`__str__` defines the human-readable string representation of an object used by `print()`.' },
        { question: 'What is polymorphism?', options: ['Multiple inheritance', 'Different classes implementing the same method differently', 'A class having multiple constructors', 'Changing variable types'], answer: 1, explanation: 'Polymorphism allows different objects to respond to the same method call in their own specific way.' },
        { question: 'What does `super()` do?', options: ['Deletes the child class', 'Calls the parent class\'s method', 'Creates a superclass', 'Returns the parent class name'], answer: 1, explanation: '`super()` gives access to the parent class\'s methods and constructor.' },
        { question: 'What is encapsulation?', options: ['Encrypting data', 'Bundling data and methods together, restricting direct access', 'Inheriting from multiple classes', 'Writing code in modules'], answer: 1, explanation: 'Encapsulation bundles data and the methods that operate on it inside a class, hiding implementation details.' },
        { question: 'What does `@property` decorator do?', options: ['Makes a method static', 'Creates a getter method accessed like an attribute', 'Marks a method as abstract', 'Converts a method to a class method'], answer: 1, explanation: '`@property` allows a method to be accessed like an attribute without parentheses.' },
        { question: 'What is the purpose of `__slots__`?', options: ['To define class slots in a casino game', 'To restrict attributes and reduce memory usage', 'To create abstract methods', 'To list all method names'], answer: 1, explanation: '`__slots__` prevents the creation of a `__dict__` per instance, saving significant memory when many instances exist.' }
      ],
      interviewQA: [
        { q: 'Explain the 4 pillars of OOP.', a: '1. Encapsulation: bundling data and methods, hiding internal state. 2. Abstraction: exposing only necessary details. 3. Inheritance: child classes reuse parent class code. 4. Polymorphism: different classes implementing the same interface differently.' },
        { q: 'What is Method Resolution Order (MRO)?', a: 'MRO defines the order Python searches for methods in an inheritance chain. It uses the C3 linearization algorithm. Check with `ClassName.__mro__`. In multiple inheritance like `class C(A, B)`, Python searches C → A → B → object.' },
        { q: 'What is the difference between `@classmethod` and `@staticmethod`?', a: '`@classmethod` receives the class (`cls`) as the first argument and can access/modify class state. It\'s used for alternative constructors. `@staticmethod` receives no implicit first argument — it\'s a regular function that logically belongs to the class but doesn\'t access class or instance state.' },
        { q: 'What are dunder/magic methods?', a: 'Dunder (double underscore) methods like `__init__`, `__str__`, `__len__`, `__eq__` are special methods that Python calls automatically in specific situations. They allow custom classes to integrate with Python\'s built-in operations and syntax.' },
        { q: 'What is a dataclass in Python?', a: 'The `@dataclass` decorator (Python 3.7+) automatically generates `__init__`, `__repr__`, and `__eq__` methods based on class-level type annotations. It reduces boilerplate for classes that primarily store data. Add `frozen=True` to make instances immutable.' }
      ]
    },
    {
      name: 'Exception Handling & File Operations',
      levels: {
        beginner: {
          explanation: 'Exceptions are errors that happen during program execution. Use `try/except` to catch them and handle them gracefully instead of crashing. For files, `open()` reads or writes files — always use `with` to ensure the file is properly closed.',
          keyPoints: ['`try:` wraps risky code', '`except ExceptionType:` handles specific errors', '`finally:` always runs (cleanup)', '`with open(file) as f:` safely handles files', 'Common exceptions: ValueError, FileNotFoundError, ZeroDivisionError'],
          analogy: 'Like a safety net at a circus — if the performer (code) falls (crashes), the net (except) catches them instead of disaster.',
          codeExample: `try:\n    number = int(input("Enter a number: "))\n    result = 100 / number\n    print(f"Result: {result}")\nexcept ValueError:\n    print("That's not a number!")\nexcept ZeroDivisionError:\n    print("Can't divide by zero!")\nfinally:\n    print("Done.")\n\n# File reading\nwith open("data.txt", "r") as f:\n    content = f.read()\n    print(content)`,
          practiceTask: 'Write code that reads a JSON file and handles FileNotFoundError and JSONDecodeError gracefully.'
        },
        intermediate: {
          explanation: 'Custom exceptions are subclasses of `Exception`. `raise` triggers exceptions manually. Exception chaining (`raise NewError from original`) preserves context. Context managers (`with` statement) use `__enter__`/`__exit__` protocol. The `else` clause in try/except runs if no exception occurred.',
          keyPoints: ['`raise ValueError("msg")` triggers an exception', 'Custom: `class AppError(Exception): pass`', '`raise New from original` chains exceptions', '`try/except/else/finally` — else runs only on success', 'Context managers: implement `__enter__` and `__exit__`'],
          codeExample: `class ValidationError(Exception):\n    def __init__(self, field, message):\n        self.field = field\n        super().__init__(f"{field}: {message}")\n\ndef validate_age(age):\n    if not isinstance(age, int):\n        raise ValidationError("age", "must be an integer")\n    if age < 0 or age > 150:\n        raise ValidationError("age", "must be between 0 and 150")\n    return age\n\ntry:\n    validate_age(-5)\nexcept ValidationError as e:\n    print(f"Error — {e}")`,
          practiceTask: 'Create a custom `DatabaseError` exception hierarchy with `ConnectionError` and `QueryError` subclasses.'
        },
        advanced: {
          explanation: 'Context managers can be created with `contextlib.contextmanager` using `yield`. `ExceptionGroup` (Python 3.11+) handles multiple exceptions simultaneously. `sys.exc_info()` retrieves current exception details. `traceback` module formats detailed stack traces. Use `logging` module instead of bare `print` in production.',
          keyPoints: ['`contextlib.contextmanager` simplifies context manager creation with generators', '`ExceptionGroup` (Python 3.11+) for handling multiple concurrent exceptions', '`logging.exception()` logs errors with full traceback', '`traceback.format_exc()` returns the traceback as a string', 'asyncio exception handling differs — use `asyncio.gather(..., return_exceptions=True)`'],
          codeExample: `from contextlib import contextmanager\nimport logging\n\nlogging.basicConfig(level=logging.ERROR)\n\n@contextmanager\ndef managed_file(path, mode="r"):\n    f = None\n    try:\n        f = open(path, mode)\n        yield f\n    except OSError as e:\n        logging.exception("File operation failed")\n        raise\n    finally:\n        if f:\n            f.close()\n\nwith managed_file("data.txt") as f:\n    print(f.read())`,
          practiceTask: 'Build a `retry_on_exception(max_retries, exceptions)` context manager that retries a block if specified exceptions occur.'
        }
      },
      quizzes: [
        { question: 'What block always executes in a try/except statement?', options: ['try', 'except', 'else', 'finally'], answer: 3, explanation: '`finally` always runs regardless of whether an exception occurred.' },
        { question: 'What exception is raised when you divide by zero?', options: ['ValueError', 'TypeError', 'ZeroDivisionError', 'ArithmeticError'], answer: 2, explanation: '`ZeroDivisionError` is raised when dividing or taking modulo by zero.' },
        { question: 'What is the safest way to open a file in Python?', options: ['open(file)', 'using with open(file) as f:', 'file.open()', 'read(file)'], answer: 1, explanation: 'The `with` statement ensures the file is automatically closed even if an error occurs.' },
        { question: 'How do you create a custom exception?', options: ['def MyError: pass', 'class MyError(Exception): pass', 'exception MyError:', 'raise Exception("MyError")'], answer: 1, explanation: 'Custom exceptions are Python classes that inherit from `Exception` or its subclasses.' },
        { question: 'What does `raise` do?', options: ['Catches an exception', 'Prints an error', 'Triggers an exception', 'Logs an error'], answer: 2, explanation: '`raise` manually triggers an exception, optionally with a message.' },
        { question: 'What mode opens a file for writing (overwriting)?', options: ['"r"', '"a"', '"w"', '"x"'], answer: 2, explanation: '"w" opens for writing, creating the file or truncating it if it exists.' },
        { question: 'What does the `else` clause in try/except do?', options: ['Runs if an exception occurred', 'Runs if no exception occurred', 'Is the same as finally', 'Catches all exceptions'], answer: 1, explanation: 'The `else` block runs only if the `try` block did NOT raise an exception.' },
        { question: 'Which exception is raised for invalid type operations?', options: ['ValueError', 'TypeError', 'AttributeError', 'NameError'], answer: 1, explanation: '`TypeError` is raised when an operation is applied to an incorrect type.' },
        { question: 'What is exception chaining?', options: ['Catching multiple exceptions at once', 'raise NewError from original — preserving cause', 'Defining a chain of exception handlers', 'Logging exceptions in sequence'], answer: 1, explanation: '`raise B from A` chains exceptions, making `A` the `__cause__` of `B`, preserving error context.' },
        { question: 'What does `f.readline()` do?', options: ['Reads the entire file', 'Reads one line', 'Reads all lines as a list', 'Writes a line'], answer: 1, explanation: '`readline()` reads and returns one line from the file including the newline character.' }
      ],
      interviewQA: [
        { q: 'What is the difference between `except Exception` and a bare `except:`?', a: 'A bare `except:` catches everything including `SystemExit`, `KeyboardInterrupt`, and `GeneratorExit`, which is almost always wrong. `except Exception:` catches all regular exceptions but not system-exiting ones. Always be specific with exception types when possible.' },
        { q: 'How does the `with` statement work?', a: 'The `with` statement uses the context manager protocol. On entry, it calls `__enter__()`. On exit (normally or via exception), it calls `__exit__(exc_type, exc_val, exc_tb)`. If `__exit__` returns True, the exception is suppressed. This guarantees proper cleanup (closing files, releasing locks).' },
        { q: 'Explain the difference between `read()`, `readline()`, and `readlines()`.', a: '`read()` reads the entire file as one string. `readline()` reads one line including the newline. `readlines()` reads all lines and returns them as a list of strings. For large files, iterate line-by-line with `for line in file:` to avoid loading everything into memory.' },
        { q: 'What is the purpose of exception logging vs printing?', a: 'In production, `logging.exception("msg")` logs both the message AND the full traceback to a configurable destination (file, server). `print()` only outputs to stdout and is lost in production. The logging module supports log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL) and allows centralized log management.' },
        { q: 'How do you handle multiple exception types simultaneously?', a: 'Use a tuple: `except (ValueError, TypeError) as e:`. In Python 3.11+, `ExceptionGroup` handles multiple concurrent exceptions (from async tasks). You can also nest multiple `except` clauses for different handling logic per exception type.' }
      ]
    },
    {
      name: 'List Comprehensions, Generators & Iterators',
      levels: {
        beginner: {
          explanation: 'List comprehensions provide a concise way to create lists. Iterators let you traverse elements step-by-step. Generators use `yield` to return values one at a time, keeping memory usage extremely low.',
          keyPoints: ['List comprehension: `[x*x for x in list]`', 'Iterators implement `__iter__` and `__next__` methods', 'Generators yield values dynamically, preserving execution state', '`range()` is a built-in lazy sequence'],
          analogy: 'Imagine a list is a box of donuts all made at once, while a generator is a donut machine that makes one fresh donut each time you press the button.',
          codeExample: `# List comprehension\nsquares = [x**2 for x in range(5)]\nprint(squares)  # [0, 1, 4, 9, 16]\n\n# Generator function\ndef count_to_three():\n    yield 1\n    yield 2\n    yield 3\n\nfor num in count_to_three():\n    print(num)`,
          practiceTask: 'Write a list comprehension that filters even numbers from a list, and a generator that yields squares of numbers.'
        },
        intermediate: {
          explanation: 'Nested comprehensions can process matrices. Iterator protocol uses `next(iterator)`. Generators can receive data using `generator.send(value)`. Generator expressions use parentheses `(x*x for x in data)` and evaluate lazily.',
          keyPoints: ['Generator expressions: `(x for x in iterable)`', 'Use `next()` to manually advance an iterator', '`send()` passes a value back into a generator', 'Dictionary and set comprehensions also exist: `{k: v for k, v in dict}`'],
          codeExample: `# Generator expression\ngen = (x * 2 for x in range(3))\nprint(next(gen))  # 0\nprint(next(gen))  # 2\n\n# Dictionary comprehension\nsquared_dict = {x: x**2 for x in range(3)}\nprint(squared_dict)  # {0: 0, 1: 1, 2: 4}`,
          practiceTask: 'Create a dictionary comprehension mapping letters to their ASCII values. Implement an infinite generator for Fibonacci numbers.'
        },
        advanced: {
          explanation: 'Iterators are driven by C-level iterator protocol. Generators compile to frame objects on the heap. Generator delegation is done using `yield from`. Coroutines leverage `yield` for cooperative multitasking before async/await.',
          keyPoints: ['`yield from iterable` delegates generator operations', 'Generator frames stay on the heap after yielding', 'Iterators raise `StopIteration` when complete', 'Generator pipelines pass data through multiple filters'],
          codeExample: `def sub_gen():\n    yield "a"\n    yield "b"\n\ndef main_gen():\n    yield from sub_gen()\n    yield "c"\n\nprint(list(main_gen()))  # ['a', 'b', 'c']`,
          practiceTask: 'Build a data pipeline generator that reads a simulated log file, filters lines with errors, and extracts the timestamps.'
        }
      },
      quizzes: [
        { question: 'Which brackets are used for a generator expression?', options: ['[ ]', '{ }', '( )', '< >'], answer: 2, explanation: 'Generator expressions use parentheses `( )`, whereas list comprehensions use square brackets `[ ]`.' },
        { question: 'What keyword replaces `return` in a generator function?', options: ['give', 'yield', 'send', 'produce'], answer: 1, explanation: '`yield` returns a value to the caller and pauses the generator function state.' },
        { question: 'What exception is raised when an iterator runs out of items?', options: ['IndexError', 'StopIteration', 'ValueError', 'KeyError'], answer: 1, explanation: '`StopIteration` is raised automatically by the iterator protocol when there are no more items.' }
      ],
      interviewQA: [
        { q: 'What is the main difference between a list comprehension and a generator expression?', a: 'List comprehension creates and stores the entire list in memory immediately. A generator expression returns a generator object that produces items lazily on demand, which uses O(1) memory and is highly efficient for large datasets.' },
        { q: 'How does the iterator protocol work in Python?', a: 'An object is iterable if it implements `__iter__()` which returns an iterator. An iterator must implement `__next__()` which returns the next item or raises `StopIteration` when finished. The `for` loop calls these methods under the hood.' },
        { q: 'What is the purpose of `yield from` in Python?', a: '`yield from` is used to delegate operations from one generator to another generator or iterable. It simplifies nesting and acts as a bidirectional pipe, letting values and exceptions flow directly to the caller.' }
      ]
    },
    {
      name: 'Decorators, Context Managers & Closures',
      levels: {
        beginner: {
          explanation: 'A closure is a nested function that remembers variables from its outer scope. A decorator wraps a function to modify its behavior without changing its source code. Context managers handle resources safely with `with` blocks.',
          keyPoints: ['Closures capture scope: nested functions', 'Decorators modify behavior: `@my_decorator` syntax', 'Context managers: `with open() as f:` guarantees cleanup', 'Syntactic sugar: `@` notation wraps functions'],
          analogy: 'A decorator is like wrapping a gift box. The gift (function) is inside, but the wrapping (decorator) adds decoration or tag logic before you open it.',
          codeExample: `# Simple Decorator\ndef loud(func):\n    def wrapper():\n        print("📢 CALLING!")\n        func()\n    return wrapper\n\n@loud\ndef greet():\n    print("Hello")\n\ngreet()`,
          practiceTask: 'Write a decorator `@log_call` that prints the function name before executing it.'
        },
        intermediate: {
          explanation: 'Decorators can accept arguments using an extra wrapping layer. `functools.wraps` is vital to preserve the wrapped function metadata (name, docstring). Custom context managers can be created using classes with `__enter__` and `__exit__`.',
          keyPoints: ['Use `@functools.wraps` to keep function names intact', 'Class-based context managers use `__enter__` and `__exit__` methods', 'Closures can hold read-only outer state; use `nonlocal` to write to it', '`contextlib.contextmanager` decorator simplifies custom context managers'],
          codeExample: `import functools\n\ndef repeat(num):\n    def decorator(func):\n        @functools.wraps(func)\n        def wrapper(*args, **kwargs):\n            for _ in range(num):\n                func(*args, **kwargs)\n        return wrapper\n    return decorator\n\n@repeat(2)\ndef clap():\n    print("👏")\n\nclap()`,
          practiceTask: 'Write a class-based context manager `Timer` that prints the elapsed time of the block.'
        },
        advanced: {
          explanation: 'Decorators can modify class definitions. The `__exit__` method of context managers receives error types to handle exceptions. Closures store captured variables in `__closure__` cells. Understanding descriptors is key to understanding property decorators.',
          keyPoints: ['If `__exit__` returns True, exceptions inside the block are suppressed', 'Function closure attributes are inspectable in `fn.__closure__`', 'Class decorators can modify or replace class instances', 'LRU cache decorator optimizes recursive calculations'],
          codeExample: `class OpenFile:\n    def __init__(self, filename, mode):\n        self.filename = filename\n        self.mode = mode\n    def __enter__(self):\n        self.file = open(self.filename, self.mode)\n        return self.file\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        self.file.close()\n        return False # do not suppress errors`,
          practiceTask: 'Write a decorator `@retry(3)` that catches exceptions and retries the function up to 3 times before re-raising.'
        }
      },
      quizzes: [
        { question: 'Which decorator preserves the metadata of a decorated function?', options: ['@functools.wraps', '@functools.preserve', '@meta.wraps', '@contextmanager'], answer: 0, explanation: '`@functools.wraps` copies the docstring, name, and attributes of the original function to the wrapper.' },
        { question: 'What keyword allows modifying a variable in the outer enclosing (non-global) scope?', options: ['global', 'local', 'nonlocal', 'outer'], answer: 2, explanation: '`nonlocal` declares that a variable in a nested function refers to a variable in the nearest outer enclosing scope.' },
        { question: 'What parameters does `__exit__` accept in a context manager class?', options: ['self', 'self, exc_type, exc_val, exc_tb', 'self, exception', 'self, file'], answer: 1, explanation: '`__exit__` accepts three exception details: type, value, and traceback (which are None if no error occurred).' }
      ],
      interviewQA: [
        { q: 'How do closures work in Python?', a: 'A closure occurs when a nested function references variables from its enclosing outer function. Even after the outer function finishes executing, the inner function retains access to these variables, which are stored in the function\'s `__closure__` attribute.' },
        { q: 'What is the purpose of @functools.wraps?', a: 'By default, decorating a function replaces it with the wrapper function, losing its original name and docstring. `@functools.wraps(func)` is a decorator applied to the wrapper function to copy the original function\'s name, docstring, and module attributes.' },
        { q: 'How do you suppress exceptions inside a context manager?', a: 'In the custom context manager\'s `__exit__(self, exc_type, exc_val, exc_tb)` method, returning `True` instructs Python that the exception was handled, suppressing it. Returning `False` (or None) allows the exception to propagate.' }
      ]
    },
    {
      name: 'Standard Library, Virtual Environments & Packaging',
      levels: {
        beginner: {
          explanation: 'Python comes with a rich standard library containing modules for math, OS interactions, and data formats. Virtual environments let you isolate project packages. Pip installs third-party packages.',
          keyPoints: ['Standard library has built-in modules: `math`, `os`, `sys`, `json`', 'Virtual environments: `python -m venv env` keeps projects isolated', 'Install packages: `pip install package_name`', 'List dependencies: `pip freeze > requirements.txt`'],
          analogy: 'The standard library is like the toolkit that comes with your house. Virtual environments are separate workbench zones so painting one room doesn\'t spill paint on another project.',
          codeExample: `import os\nimport json\n\n# Get current directory\nprint(os.getcwd())\n\n# Serialize JSON\nuser_json = json.dumps({"name": "Alex", "role": "CS Student"})\nprint(user_json)`,
          practiceTask: 'Create a virtual environment locally, activate it, install `requests`, and write a script importing it.'
        },
        intermediate: {
          explanation: 'Modules like `datetime`, `collections` (defaultdict, Counter, deque), and `itertools` offer high efficiency. Virtual environment activation alters the system `PATH`. Pip packages are managed via `requirements.txt` or `pyproject.toml`.',
          keyPoints: ['`collections.Counter` aggregates frequencies instantly', '`datetime` handles time zones and parsing', '`sys.path` lists directories searched for imports', 'Virtual environments isolate site-packages folder'],
          codeExample: `from collections import Counter\nimport datetime\n\nwords = ["apple", "banana", "apple", "cherry"]\ncounts = Counter(words)\nprint(counts["apple"])  # 2\n\nnow = datetime.datetime.now()\nprint(now.strftime("%Y-%m-%d %H:%M:%S"))`,
          practiceTask: 'Use collections.defaultdict to group a list of words by their starting letters.'
        },
        advanced: {
          explanation: 'Python\'s import system uses `sys.meta_path` and finder/loader objects. Packages are configured for distribution using `setup.py` or modern build tools (Flit, Poetry, Hatch) with `pyproject.toml`. Namespace packages allow split package paths.',
          keyPoints: ['`pyproject.toml` is the modern standard for packaging metadata', 'Import hooks can customize how modules are loaded dynamically', '`__init__.py` marks directories as packages and controls `__all__` exports', 'Wheel (.whl) is the standard pre-compiled distribution format'],
          codeExample: `# pyproject.toml example template\n# [build-system]\n# requires = ["setuptools", "wheel"]\n# build-backend = "setuptools.build_meta"`,
          practiceTask: 'Create a simple package structure with `__init__.py` and a submodule, and verify importing it.'
        }
      },
      quizzes: [
        { question: 'Which command creates a virtual environment named "myenv"?', options: ['python create venv myenv', 'python -m venv myenv', 'pip virtualenv myenv', 'venv init myenv'], answer: 1, explanation: '`python -m venv myenv` runs the built-in venv module to create a new virtual environment directory.' },
        { question: 'Which module in the standard library handles regular expressions?', options: ['regex', 're', 'patterns', 'match'], answer: 1, explanation: 'The standard library module is named `re` (regular expressions).' },
        { question: 'What is the standard configuration file for modern Python packaging?', options: ['setup.py', 'requirements.txt', 'pyproject.toml', 'package.json'], answer: 2, explanation: '`pyproject.toml` is the modern PEP 518 standard for build systems, metadata, and dependencies.' }
      ],
      interviewQA: [
        { q: 'Why are virtual environments important in Python?', a: 'Virtual environments isolate project-specific dependencies and packages. Without them, installing different versions of a library globally can lead to conflicts and break other projects. They ensure clean, reproducible runtime environments.' },
        { q: 'What is the purpose of requirements.txt and how do you use it?', a: '`requirements.txt` lists all third-party dependencies of a project. You generate it using `pip freeze > requirements.txt` and install all listed packages on a new machine using `pip install -r requirements.txt`.' },
        { q: 'Explain how Python resolves module imports.', a: 'When you run `import mymodule`, Python first checks built-in modules. Then, it searches the list of directories defined in `sys.path`. This list includes the current directory, standard library folders, and the active virtual environment\'s `site-packages` directory.' }
      ]
    }
  ],

  // ────────────────────── JAVASCRIPT ──────────────────────
  javascript: [
    {
      name: 'Data Types, Scope & Operators',
      levels: {
        beginner: { explanation: 'JavaScript has 7 primitive types: string, number, bigint, boolean, undefined, null, and symbol. Use `let` for mutable variables, `const` for constants, and avoid `var`. Operators include arithmetic (+, -, *, /), comparison (===, !==), and logical (&&, ||, !).',
          keyPoints: ['Use `const` by default, `let` when reassignment is needed', '`===` checks value AND type (strict equality)', '`typeof` returns the type as a string', '`null` is intentional absence, `undefined` means not assigned'],
          analogy: 'Variables are labelled boxes. `const` is a sealed box, `let` is open. `===` checks if boxes contain identical items.',
          codeExample: `const name = "Alice";\nlet score = 95;\n\nconsole.log(typeof name);   // "string"\nconsole.log(typeof score);  // "number"\nconsole.log(score === 95);  // true\nconsole.log(score == "95"); // true (loose!)\nconsole.log(score === "95");// false (strict)\n\nconst isPass = score >= 60;\nconsole.log(isPass); // true`,
          practiceTask: 'Create variables of every primitive type and verify them with typeof.' },
        intermediate: { explanation: 'JavaScript uses lexical scoping with block scope (let/const) and function scope (var). Hoisting moves var declarations and function declarations to the top of their scope. Closures capture outer scope variables. The temporal dead zone (TDZ) prevents accessing let/const before declaration.',
          keyPoints: ['`var` is function-scoped and hoisted', '`let`/`const` are block-scoped with TDZ', 'Closures: inner functions remember outer variables', 'Hoisting: function declarations are fully hoisted, var is partially'],
          codeExample: `// Closure example\nfunction counter() {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    get: () => count\n  };\n}\nconst c = counter();\nc.increment(); c.increment();\nconsole.log(c.get()); // 2`,
          practiceTask: 'Demonstrate the difference between var and let in a for loop.' },
        advanced: { explanation: 'JavaScript has a single-threaded event loop with a call stack, heap, task queue (macrotasks), and microtask queue. Understanding execution context and the scope chain is critical. Symbols provide unique property keys. WeakMap/WeakRef enable memory-sensitive caching.',
          keyPoints: ['Execution context: global, function, eval', 'Scope chain determined at definition (lexical)', 'WeakMap keys are garbage-collected when no other reference exists', 'Symbol() creates unique, non-enumerable keys'],
          codeExample: `const cache = new WeakMap();\n\nfunction process(obj) {\n  if (!cache.has(obj)) {\n    cache.set(obj, expensiveCalc(obj));\n  }\n  return cache.get(obj);\n}\n\nconst sym = Symbol("id");\nconst user = { [sym]: 42, name: "Alice" };\nconsole.log(user[sym]); // 42`,
          practiceTask: 'Implement a memoize function using WeakMap for object arguments.' }
      },
      quizzes: [
        { question: 'What is the difference between `==` and `===`?', options: ['No difference', '`===` checks type and value, `==` only value (with coercion)', '`==` is faster', '`===` only works with numbers'], answer: 1, explanation: '`===` (strict equality) checks both value and type without type coercion.' },
        { question: 'What does `typeof null` return?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], answer: 2, explanation: 'This is a historical JavaScript bug — `typeof null` returns "object".' },
        { question: 'Which keyword creates a block-scoped variable?', options: ['var', 'let', 'function', 'global'], answer: 1, explanation: '`let` (and `const`) are block-scoped, unlike `var` which is function-scoped.' },
        { question: 'What is the result of `"5" - 2`?', options: ['"52"', '3', '"5-2"', 'NaN'], answer: 1, explanation: 'The minus operator converts "5" to a number, resulting in 3.' },
        { question: 'What is `NaN`?', options: ['A valid number type meaning "Not a Number"', 'An error object', 'A null value', 'Undefined variable'], answer: 0, explanation: '`NaN` has type "number" but represents an invalid numeric result. Use `Number.isNaN()` to check.' },
        { question: 'What does `const` prevent?', options: ['Value mutation for objects', 'Reassignment of the variable binding', 'All changes to the variable', 'Type changes'], answer: 1, explanation: '`const` prevents reassigning the variable, but object properties can still be mutated.' },
        { question: 'What is the temporal dead zone (TDZ)?', options: ['A bug in old browsers', 'The period between entering scope and the let/const declaration being evaluated', 'A timeout function', 'A deleted variable'], answer: 1, explanation: 'Accessing a `let` or `const` variable before its declaration causes a ReferenceError due to TDZ.' },
        { question: 'What does the logical OR (`||`) operator return?', options: ['Always true or false', 'The first truthy value or the last value', 'The string "true" or "false"', 'Always the right operand'], answer: 1, explanation: '`||` returns the first truthy value found, or the last value if all are falsy.' },
        { question: 'What is variable hoisting?', options: ['Moving variables to a different file', 'Variable and function declarations are moved to the top of their scope', 'Deleting unused variables', 'Assigning default values'], answer: 1, explanation: 'Hoisting moves `var` declarations and function declarations to the top of their scope at compile time.' },
        { question: 'What is a closure?', options: ['A closed HTML tag', 'A function that retains access to its outer scope variables', 'A private class', 'A sealed object'], answer: 1, explanation: 'A closure is a function that "closes over" variables from its enclosing scope, keeping them alive.' }
      ],
      interviewQA: [
        { q: 'Explain the difference between `null` and `undefined`.', a: '`undefined` means a variable has been declared but no value assigned. `null` is an intentional assignment meaning "no value" or "empty". `typeof undefined` is "undefined"; `typeof null` is "object" (historical bug).' },
        { q: 'What is the event loop in JavaScript?', a: 'JavaScript is single-threaded with a call stack. The event loop monitors the call stack and task queue. When the stack is empty, it dequeues the next callback (macro-task). Promises use the microtask queue, which has higher priority and drains completely before the next macro-task.' },
        { q: 'What is the difference between `var`, `let`, and `const`?', a: '`var` is function-scoped and hoisted (initialized as undefined). `let` is block-scoped with TDZ — not initialized until declaration. `const` is block-scoped, TDZ, and cannot be reassigned. Use `const` by default, `let` when reassignment is needed, avoid `var`.' },
        { q: 'What are JavaScript closures and give a practical use case?', a: 'Closures are functions that retain access to their outer scope after the outer function returns. Use cases: private variables/methods (module pattern), factory functions (e.g., `makeAdder(5)` returns a function that adds 5), memoization, and event handlers that capture loop variables.' },
        { q: 'What is type coercion and why is it dangerous?', a: 'Type coercion is JavaScript\'s automatic type conversion. `"5" + 2 = "52"` (string) but `"5" - 2 = 3` (number). This inconsistency causes bugs. Always use `===` instead of `==` to avoid unintended coercions. Use `Number()`, `String()`, `Boolean()` for explicit conversions.' }
      ]
    },
    {
      name: 'DOM Traversal & Event Handling',
      levels: {
        beginner: {
          explanation: 'The Document Object Model (DOM) is a tree-like representation of HTML. JavaScript can query DOM elements, modify their content, and listen to event triggers like user clicks.',
          keyPoints: ['Use `document.getElementById` and `document.querySelector` to select elements', 'Events are user actions: click, input, keydown, submit', 'Listen to events: `element.addEventListener(type, callback)`', 'Modify contents: `element.textContent = "new text"`'],
          analogy: 'The DOM is like the map of a house. Selecting elements is finding a room; changing text is painting a wall; event listeners are doorbell buttons that trigger actions when pressed.',
          codeExample: `const btn = document.querySelector("#my-btn");\nbtn.addEventListener("click", () => {\n  document.querySelector("#my-text").textContent = "Button Clicked! 🚀";\n});`,
          practiceTask: 'Create an HTML page with a button and a count label. Write a script that increments the count every time the button is clicked.'
        },
        intermediate: {
          explanation: 'Event bubbling propagates events from child to parents. Event delegation leverages bubbling to listen for events on parent containers rather than adding listeners to individual children. `e.preventDefault()` blocks default behavior.',
          keyPoints: ['Bubbling: events rise up the DOM tree', 'Delegation: single listener on parent handles child clicks', '`e.preventDefault()` cancels actions (like form reload)', '`e.stopPropagation()` stops event bubbling'],
          codeExample: `// Event Delegation\nconst list = document.querySelector("#user-list");\nlist.addEventListener("click", (e) => {\n  if (e.target.classList.contains("user-item")) {\n    console.log("Clicked User:", e.target.textContent);\n  }\n});`,
          practiceTask: 'Build a dynamic list where clicking a list item removes it, using a single event listener on the parent `<ul>` container.'
        },
        advanced: {
          explanation: 'The browser layout pipeline runs in stages: Recalculate Styles → Layout (Reflow) → Paint → Composite. Modifying layout-triggering properties causes reflows. DocumentFragments reduce layout Thrashing by buffering DOM attachments.',
          keyPoints: ['Reflow recalculates element positions; Paint draws pixels', 'DocumentFragments hold DOM nodes in memory, causing only one reflow on attach', 'Passive event listeners improve scroll performance', 'CustomEvents let elements pass data dynamically'],
          codeExample: `const fragment = document.createDocumentFragment();\nfor (let i = 0; i < 100; i++) {\n  const li = document.createElement("li");\n  li.textContent = \`Item \${i}\`;\n  fragment.appendChild(li);\n}\ndocument.querySelector("#list").appendChild(fragment); // single reflow`,
          practiceTask: 'Write a virtual scrolling element mock that renders only visible list rows to maintain 60 FPS performance.'
        }
      },
      quizzes: [
        { question: 'Which method selects the first element matching a CSS selector?', options: ['getElementById', 'querySelectorAll', 'querySelector', 'getElementsByClassName'], answer: 2, explanation: '`querySelector()` returns the first element that matches the specified CSS selector.' },
        { question: 'What does `e.preventDefault()` do in a form submit event?', options: ['Submits the form', 'Validates form inputs', 'Stops the page from reloading', 'Deletes form contents'], answer: 2, explanation: 'It cancels the default action of the submit event, which is reloading the page.' },
        { question: 'What is event delegation?', options: ['Passing events to a server', 'Binding a listener to a parent to handle child events', 'Deleting event listeners', 'Running events in parallel'], answer: 1, explanation: 'Event delegation handles events at a parent level to manage multiple dynamic children efficiently.' }
      ],
      interviewQA: [
        { q: 'What is the difference between event bubbling and capturing?', a: 'Bubbling propagates the event from the target element upwards to its parents. Capturing propagates downwards from the window to the target. Standard listeners run in the bubbling phase unless `capture: true` is specified.' },
        { q: 'Explain event delegation and its benefits.', a: 'Instead of adding listeners to 100 table cells, you add a single listener to the parent `<table>`. When a cell is clicked, the event bubbles up. It saves memory and automatically works for new rows added to the DOM.' },
        { q: 'What is a reflow (layout thrashing) and how do you prevent it?', a: 'Reflow is when the browser recalculates positions of elements. It occurs when layout-triggering properties (like offsetWidth, clientHeight) are read immediately after writes. Prevention: batch DOM operations, read first write later, or use DocumentFragments.' }
      ]
    },
    {
      name: 'Promises, Async/Await & Fetch',
      levels: {
        beginner: {
          explanation: 'JavaScript runs on a single thread. Asynchronous programming lets you fetch network resources or wait for timers without freezing the page. A Promise represents a future value. Async/Await is modern syntax for handling Promises.',
          keyPoints: ['Promises have states: pending, fulfilled, rejected', '`.then()` handles success, `.catch()` handles errors', '`async` functions return Promises automatically', '`await` pauses execution until the Promise resolves'],
          analogy: 'A Promise is like ordering food at a counter. You get a buzzer (Promise). You sit down and wait (pending). When it buzzes (fulfilled), you eat (resolve). If they run out of food, it turns red (rejected).',
          codeExample: `// Fetching data\nfetch("https://api.github.com/users/octocat")\n  .then(res => res.json())\n  .then(data => console.log(data.name))\n  .catch(err => console.error(err));`,
          practiceTask: 'Write an async function that fetches a user profile and logs their name, with error handling.'
        },
        intermediate: {
          explanation: '`Promise.all` executes promises concurrently and resolves when all succeed. `Promise.race` resolves as soon as the first promise settles. Custom Promises can be instantiated using `new Promise((resolve, reject) => {})`. Network fetches should specify headers and methods.',
          keyPoints: ['`Promise.all([...])` rejects if ANY promise fails', '`Promise.allSettled([...])` waits for all to finish, success or failure', 'Fetch options: method, headers, credentials, body', 'Always check `res.ok` on fetch responses'],
          codeExample: `const delay = (ms) => new Promise(res => setTimeout(res, ms));\n\nasync function loadAll() {\n  const [res1, res2] = await Promise.all([\n    fetch("/api/users"),\n    fetch("/api/settings")\n  ]);\n  return [await res1.json(), await res2.json()];\n}`,
          practiceTask: 'Create a custom fetch wrapper that implements a timeout (rejects if request takes more than 3 seconds).'
        },
        advanced: {
          explanation: 'Promises execute inside the Microtask queue, which takes priority over the Macrotask queue (event loop). AbortController allows canceling active fetches. Catch blocks must handle fetch exceptions vs HTTP error statuses.',
          keyPoints: ['Microtasks (Promises) run before Macrotasks (setTimeout, UI render)', '`AbortController` + `signal` cancels active fetches', 'Check `res.status` for API-level exception handling', 'Avoid Promise constructor anti-pattern when wrapping sync operations'],
          codeExample: `const controller = new AbortController();\nconst signal = controller.signal;\n\nfetch("/api/weights", { signal })\n  .then(r => r.json())\n  .catch(e => {\n    if (e.name === "AbortError") console.log("Fetch aborted!");\n  });\n\ncontroller.abort(); // cancel request`,
          practiceTask: 'Write a retry fetch utility that retries a request up to N times with exponential backoff before failing.'
        }
      },
      quizzes: [
        { question: 'What state is a Promise in when it is still waiting for a value?', options: ['fulfilled', 'rejected', 'pending', 'resolved'], answer: 2, explanation: 'Promises start in the pending state before settling into fulfilled or rejected.' },
        { question: 'Which Promise method runs multiple async tasks concurrently and fails if one fails?', options: ['Promise.race', 'Promise.all', 'Promise.any', 'Promise.allSettled'], answer: 1, explanation: '`Promise.all` runs promises concurrently and rejects immediately if any promise is rejected.' },
        { question: 'What does `await` do?', options: ['Starts a new thread', 'Pauses function execution until a Promise resolves', 'Deletes a Promise', 'Runs a loop'], answer: 1, explanation: '`await` blocks execution inside an async function until the awaited Promise is resolved or rejected.' }
      ],
      interviewQA: [
        { q: 'What is the difference between a Promise and Async/Await?', a: 'A Promise is an object representing asynchronous results, handled with `.then()`/`.catch()` callbacks. Async/Await is syntactic sugar on top of Promises, allowing asynchronous code to be written sequentially, improving readability and error handling with try-catch.' },
        { q: 'Explain the difference between Microtasks and Macrotasks.', a: 'Microtasks (Promises, MutationObserver) have higher priority and run immediately after the current execution stack finishes, before the next event loop tick. Macrotasks (setTimeout, setInterval, user input, UI rendering) run on separate loop ticks.' },
        { q: 'How do you cancel a fetch request in modern JavaScript?', a: 'Instantiate an `AbortController` and pass its `signal` as an option in the fetch request. Call `controller.abort()` to terminate the HTTP request, which throws an AbortError inside the catch block.' }
      ]
    },
    {
      name: 'Array Methods & ES6 Syntaxes',
      levels: {
        beginner: {
          explanation: 'ES6 introduced clean syntaxes: arrow functions, template literals, destructuring, and spread operators. Array helper methods let you transform or filter arrays without writing verbose `for` loops.',
          keyPoints: ['Destructuring extracts variables: `const {name} = user`', 'Spread operator: `const copy = [...arr]`', '`map` transforms arrays; `filter` removes elements', 'Arrow functions: `() => value`'],
          analogy: 'Destructuring is like opening a lunchbox and taking out only the apple, rather than pulling the whole box container out. Spread is pouring Lego bricks from one container into a new one.',
          codeExample: `const scores = [85, 92, 78];\nconst scaled = scores.map(s => s + 5);\nconst passed = scores.filter(s => s >= 80);\n\nconsole.log(scaled); // [90, 97, 83]\nconsole.log(passed); // [85, 92]`,
          practiceTask: 'Create an array of user objects. Use filter to get active users, and map to extract their email addresses.'
        },
        intermediate: {
          explanation: '`reduce()` aggregates an array into a single value (like a sum or hash map). Rest parameters collect arguments into an array. Default parameters define fallbacks. Array methods (`find`, `some`, `every`) provide high-level searches.',
          keyPoints: ['`reduce((acc, val) => acc + val, 0)` accumulates values', 'Rest parameters: `def log(first, ...others)`', '`find` returns the first match; `some` checks if any match', '`every` checks if all elements pass a condition'],
          codeExample: `const cart = [{price: 10}, {price: 25}, {price: 15}];\nconst total = cart.reduce((sum, item) => sum + item.price, 0);\nconsole.log(total); // 50\n\nconst hasExpensive = cart.some(item => item.price > 20);\nconsole.log(hasExpensive); // true`,
          practiceTask: 'Use reduce to calculate the frequency of categories in an array of courses.'
        },
        advanced: {
          explanation: 'Array methods execute callbacks iteratively. Spread operators perform shallow copies. Set objects maintain unique values, while Map provides keyed hash entries. Generators can yield array slices dynamically.',
          keyPoints: ['Spread creates shallow copies of arrays/objects', '`Set` filters out duplicates: `[...new Set(arr)]`', '`Map` maintains insertion order for keys of any type', 'Use `Array.from()` to convert array-like objects'],
          codeExample: `const dupes = [1, 2, 2, 3, 3, 3];\nconst unique = [...new Set(dupes)];\nconsole.log(unique); // [1, 2, 3]\n\nconst userMap = new Map();\nuserMap.set("id_101", {name: "Alex"});\nconsole.log(userMap.get("id_101").name); // "Alex"`,
          practiceTask: 'Write a function that merges two arrays of objects, overriding duplicate keys based on an ID field.'
        }
      },
      quizzes: [
        { question: 'Which array method is best for creating a new array with modified values?', options: ['forEach', 'map', 'filter', 'reduce'], answer: 1, explanation: '`map()` creates a new array by applying a transform function to every element of the source array.' },
        { question: 'How do you extract the first element of an array `const colors = ["red", "blue"]` using destructuring?', options: ['const first = colors[0]', 'const [first] = colors', 'const {first} = colors', 'const first = colors.first()'], answer: 1, explanation: 'Array destructuring uses square brackets: `const [first] = colors` extracts the first element.' },
        { question: 'What does `array.some(x => x > 10)` return?', options: ['A filtered array', 'The first number > 10', 'A boolean indicating if at least one item matches', 'A new array with modified elements'], answer: 2, explanation: '`some()` returns `true` if at least one element passes the test, otherwise `false`.' }
      ],
      interviewQA: [
        { q: 'What is the difference between map() and forEach()?', a: '`map()` returns a new array with the transformed values, leaving the original array unchanged (pure function). `forEach()` executes a function for each element but returns `undefined` — it is used for side effects.' },
        { q: 'How does reduce() work and what are its parameters?', a: '`reduce()` executes a reducer function on each element, resulting in a single output value. Parameters: `callback(accumulator, currentValue, index, array)` and `initialValue` (crucial to specify to avoid errors on empty arrays).' },
        { q: 'Explain the difference between deep copying and shallow copying in JavaScript.', a: 'Shallow copying (via spread `[...arr]` or `Object.assign()`) copies references of nested objects, so mutating a nested object affects the copy. Deep copying copies everything (via `structuredClone()` or `JSON.parse(JSON.stringify())`), severing all references.' }
      ]
    },
    {
      name: 'Local Storage & Session State',
      levels: {
        beginner: {
          explanation: 'LocalStorage and SessionStorage allow storing key-value pairs in the browser. LocalStorage survives browser reloads; SessionStorage is wiped when the browser tab is closed. Only string data can be stored.',
          keyPoints: ['LocalStorage persists across tabs and restarts', 'SessionStorage persists only in the active tab session', 'Save: `localStorage.setItem("key", "value")`', 'Retrieve: `localStorage.getItem("key")`'],
          analogy: 'LocalStorage is like a diary on your desk — it stays there until you throw it away. SessionStorage is like writing on a whiteboard in a meeting room — once you leave and close the door (tab), it gets erased.',
          codeExample: `localStorage.setItem("username", "Alex");\nconst user = localStorage.getItem("username");\nconsole.log(user); // "Alex"\n\n// Clear storage\nlocalStorage.removeItem("username");`,
          practiceTask: 'Save a boolean "theme_preference" to LocalStorage. Retrieve it and toggle the background color based on the value.'
        },
        intermediate: {
          explanation: 'Since storage only holds strings, you must serialize objects using `JSON.stringify()` before saving and deserialize using `JSON.parse()` on retrieval. Storage events allow sync across multiple browser tabs.',
          keyPoints: ['Use `JSON.stringify(obj)` to save arrays/objects', 'Use `JSON.parse(string)` to retrieve arrays/objects', 'Storage limits: ~5MB for LocalStorage', '`window.addEventListener("storage", callback)` syncs tabs'],
          codeExample: `const config = {theme: "dark", sync: true};\nlocalStorage.setItem("app_config", JSON.stringify(config));\n\nconst loaded = JSON.parse(localStorage.getItem("app_config"));\nconsole.log(loaded.theme); // "dark"`,
          practiceTask: 'Create an offline shopping cart cache that stores objects in an array in LocalStorage, updating counts dynamically.'
        },
        advanced: {
          explanation: 'LocalStorage operations are synchronous and block the main UI thread. For larger, structured datasets, use IndexedDB (asynchronous). LocalStorage acts as local state backup in Federated implementations.',
          keyPoints: ['LocalStorage is synchronous and I/O blocking', 'IndexedDB is asynchronous and handles large binary payloads', 'Storage quotas vary by browser (typically 10% of disk space)', 'Differential privacy noise addition happens before saving cache'],
          codeExample: `// Tab Sync Listener\nwindow.addEventListener("storage", (e) => {\n  if (e.key === "fl_local_model_weights") {\n    console.log("Weights updated in another tab! Reloading local caches...");\n    window.FederatedSystem.syncWeightsFromServer();\n  }\n});`,
          practiceTask: 'Implement a LocalStorage wrapper that adds an expiration timestamp to entries (cache invalidation after 1 hour).'
        }
      },
      quizzes: [
        { question: 'What type of data can be stored in LocalStorage?', options: ['Objects', 'Numbers', 'Strings only', 'Binary Buffers'], answer: 2, explanation: 'LocalStorage only stores strings. You must convert objects/arrays to JSON strings to save them.' },
        { question: 'Which storage API persists data even after closing the browser?', options: ['SessionStorage', 'LocalStorage', 'RuntimeCache', 'Cookie Session'], answer: 1, explanation: 'LocalStorage persists indefinitely until cleared manually or programmatically.' },
        { question: 'How do you remove a specific item from LocalStorage?', options: ['localStorage.clear()', 'localStorage.delete("key")', 'localStorage.removeItem("key")', 'localStorage.remove("key")'], answer: 2, explanation: '`localStorage.removeItem(key)` deletes the specified key-value pair.' }
      ],
      interviewQA: [
        { q: 'What are the key differences between LocalStorage, SessionStorage, and Cookies?', a: 'LocalStorage: stores ~5MB, persists indefinitely, synchronous, client-only. SessionStorage: stores ~5MB, persists only in the active tab, client-only. Cookies: store ~4KB, sent to server on every request via headers, support expiration dates.' },
        { q: 'Why is LocalStorage not suitable for large or high-frequency database entries?', a: 'LocalStorage operations are synchronous. Every write/read blocks the main browser thread, slowing down UI rendering. For high-frequency logs or large assets, IndexedDB (async) is preferred.' },
        { q: 'How does LocalStorage support offline-first local-first applications?', a: 'By caching critical UI states, course syllabus details, and user weights in LocalStorage, the application can render instantly without network hits. A Service Worker can intercept page fetches, fallback to cache, and sync changes back when online.' }
      ]
    }
  ],


  // ────────────────────── SQL ──────────────────────
  sql: [
    {
      name: 'Relational Database Principles',
      levels: {
        beginner: { explanation: 'A relational database stores data in structured tables with rows and columns — like spreadsheets that can talk to each other. Each table represents an entity (like Users, Orders). Rows are records; columns are attributes. A primary key uniquely identifies each row.',
          keyPoints: ['Tables store data in rows (records) and columns (fields)', 'Primary Key (PK): uniquely identifies each row', 'Foreign Key (FK): references a PK in another table', 'Schema: the structure/blueprint of the database', 'RDBMS examples: MySQL, PostgreSQL, SQLite, SQL Server'],
          analogy: 'A database is like a well-organized filing cabinet. Each drawer (table) holds files (rows) with labeled sections (columns).',
          codeExample: `-- Create a table\nCREATE TABLE Students (\n    student_id INT PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    age INT,\n    grade CHAR(1)\n);\n\n-- Insert records\nINSERT INTO Students VALUES (1, 'Alice', 20, 'A');\nINSERT INTO Students VALUES (2, 'Bob', 22, 'B');\n\n-- Query\nSELECT * FROM Students;`,
          practiceTask: 'Design a schema for a library system with Books and Members tables.' },
        intermediate: { explanation: 'Normalization removes data redundancy by organizing data into related tables. First Normal Form (1NF): atomic values. 2NF: no partial dependencies. 3NF: no transitive dependencies. Indexes speed up queries. ACID properties (Atomicity, Consistency, Isolation, Durability) guarantee transaction integrity.',
          keyPoints: ['1NF: No repeating groups, atomic values', '2NF: No partial dependencies (requires 1NF)', '3NF: No transitive dependencies (requires 2NF)', 'Indexes: B-tree structures that speed up lookups', 'ACID: guarantees reliable transaction processing'],
          codeExample: `-- Add an index\nCREATE INDEX idx_student_name ON Students(name);\n\n-- Transaction with ACID\nBEGIN;\n  UPDATE Accounts SET balance = balance - 100 WHERE id = 1;\n  UPDATE Accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;`,
          practiceTask: 'Normalize a denormalized Orders table into 3NF.' },
        advanced: { explanation: 'Advanced database design includes partitioning (horizontal/vertical), sharding for distributed systems, and query optimization using execution plans. MVCC (Multi-Version Concurrency Control) allows concurrent reads without locking. CAP theorem states distributed systems can only guarantee 2 of: Consistency, Availability, Partition tolerance.',
          keyPoints: ['Partitioning splits large tables for performance', 'Sharding distributes data across multiple servers', 'MVCC: readers don\'t block writers and vice versa', 'CAP theorem: C + A + P — pick 2', 'Execution plans: `EXPLAIN ANALYZE` reveals query costs'],
          codeExample: `-- Execution plan\nEXPLAIN ANALYZE\nSELECT s.name, COUNT(e.id) as enrollments\nFROM Students s\nLEFT JOIN Enrollments e ON s.student_id = e.student_id\nGROUP BY s.name\nORDER BY enrollments DESC;`,
          practiceTask: 'Analyze a slow query using EXPLAIN and identify missing indexes.' }
      },
      quizzes: [
        { question: 'What does PRIMARY KEY ensure?', options: ['No duplicate values in a column', 'A column cannot be NULL', 'Both uniqueness and NOT NULL', 'Foreign key relationships'], answer: 2, explanation: 'PRIMARY KEY ensures both uniqueness and NOT NULL — it uniquely identifies each row.' },
        { question: 'What is a Foreign Key?', options: ['An encrypted primary key', 'A column that references the PK of another table', 'A key from another database system', 'A temporary key'], answer: 1, explanation: 'A Foreign Key creates a link between two tables by referencing the Primary Key of another table.' },
        { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Question Language', 'Sequential Query Logic', 'System Query Layer'], answer: 0, explanation: 'SQL stands for Structured Query Language.' },
        { question: 'Which SQL command retrieves data?', options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], answer: 2, explanation: 'SELECT is used to query and retrieve data from tables.' },
        { question: 'What is normalization?', options: ['Encrypting database data', 'Organizing data to reduce redundancy', 'Indexing all columns', 'Making all values normal distribution'], answer: 1, explanation: 'Normalization organizes data into related tables to eliminate redundancy and improve integrity.' },
        { question: 'What does ACID stand for?', options: ['Automated, Consistent, Independent, Durable', 'Atomicity, Consistency, Isolation, Durability', 'Active, Complete, Integrated, Dynamic', 'Async, Cached, Indexed, Distributed'], answer: 1, explanation: 'ACID properties guarantee reliable database transactions: Atomicity, Consistency, Isolation, Durability.' },
        { question: 'Which constraint prevents NULL values in a column?', options: ['UNIQUE', 'PRIMARY KEY', 'NOT NULL', 'CHECK'], answer: 2, explanation: 'NOT NULL constraint ensures a column always contains a value.' },
        { question: 'What is an index in a database?', options: ['A table\'s row count', 'A data structure that speeds up queries', 'A type of primary key', 'A view definition'], answer: 1, explanation: 'An index (typically a B-tree) allows the database to find rows faster without scanning the entire table.' },
        { question: 'What is the difference between DELETE and TRUNCATE?', options: ['No difference', 'TRUNCATE removes specific rows, DELETE removes all', 'DELETE can have WHERE clause, TRUNCATE removes all rows faster', 'TRUNCATE is for tables, DELETE is for columns'], answer: 2, explanation: 'DELETE with WHERE removes specific rows and logs each deletion. TRUNCATE removes all rows much faster without logging individual deletions.' },
        { question: 'What does 1NF (First Normal Form) require?', options: ['No NULL values', 'Atomic column values and no repeating groups', 'A primary key on every table', 'All columns must have the same type'], answer: 1, explanation: '1NF requires each column to hold atomic (indivisible) values and no repeating groups of columns.' }
      ],
      interviewQA: [
        { q: 'What are the ACID properties and why do they matter?', a: 'Atomicity: all operations in a transaction succeed or all fail (no partial updates). Consistency: a transaction brings the database from one valid state to another. Isolation: concurrent transactions don\'t interfere with each other. Durability: committed transactions persist even after system failure. These properties prevent data corruption.' },
        { q: 'Explain database normalization and its forms.', a: '1NF: Atomic values, no repeating groups. 2NF (requires 1NF): No partial dependencies — non-key attributes depend on the whole PK. 3NF (requires 2NF): No transitive dependencies — non-key attributes depend only on PK. Normalization reduces redundancy but may require more JOINs, which can affect performance.' },
        { q: 'What is the difference between clustered and non-clustered indexes?', a: 'A clustered index determines the physical sort order of rows in the table — there can only be one per table (usually the PK). A non-clustered index creates a separate structure pointing to the data rows — a table can have many. Non-clustered indexes have overhead for INSERT/UPDATE operations.' },
        { q: 'What is the CAP theorem?', a: 'In distributed systems, you can only guarantee 2 of 3 properties: Consistency (every read sees the latest write), Availability (every request gets a response), and Partition Tolerance (system works despite network splits). Since network partitions are unavoidable, databases choose between CP (e.g., HBase) or AP (e.g., Cassandra) trade-offs.' },
        { q: 'What is MVCC (Multi-Version Concurrency Control)?', a: 'MVCC allows multiple transactions to read data concurrently without blocking writers. Instead of locking, the database maintains multiple versions of each row with timestamps. Readers see a consistent snapshot. PostgreSQL uses MVCC; each transaction gets its own snapshot of the database state.' }
      ]
    },
    {
      name: 'SELECT Statements & Filtering',
      levels: {
        beginner: {
          explanation: 'The `SELECT` statement is used to retrieve data from a database. You can filter rows using the `WHERE` clause with operators like `=`, `>`, `<`, `LIKE`, and `IN`.',
          keyPoints: ['`SELECT column1, column2 FROM table` selects specific fields', '`SELECT *` retrieves all columns (use sparingly)', '`WHERE` filters records before they are grouped or selected', '`ORDER BY` sorts results in ascending (ASC) or descending (DESC) order'],
          analogy: 'Imagine a spreadsheet: `SELECT` selects the columns you want to view, while `WHERE` hides the rows that do not match your filter criteria.',
          codeExample: `-- Filtering active student profiles\nSELECT name, email, streak\nFROM users\nWHERE streak >= 10 AND status = 'active'\nORDER BY streak DESC;`,
          practiceTask: 'Write a query to retrieve the name and email of all users who have registered after January 1, 2026.'
        },
        intermediate: {
          explanation: 'Using `LIMIT` (or `OFFSET`) restricts the number of returned records. Pattern matching is done with `LIKE` and wildcards (`%` for multi-character, `_` for single). `AND`, `OR`, and `NOT` combine logical filters.',
          keyPoints: ['Use `%` as a wildcard for zero or more characters in `LIKE` checks', '`LIMIT` restricts return counts to save API network bandwidth', '`BETWEEN` matches ranges inclusively: `BETWEEN 10 AND 50`', '`IS NULL` checks for empty fields: `email IS NULL`'],
          codeExample: `-- Pattern matching and ranges\nSELECT id, name\nFROM courses\nWHERE category = 'programming'\n  AND name LIKE '%Python%'\nLIMIT 5 OFFSET 0;`,
          practiceTask: 'Write a query that finds all courses with names containing "Data" and ratings between 4.0 and 5.0.'
        },
        advanced: {
          explanation: 'Regular expression matching is done using `SIMILAR TO` or `~` (regex match operator in PostgreSQL). CASE statements implement conditional select logic. Null handling uses `COALESCE` to swap default values.',
          keyPoints: ['`CASE WHEN cond THEN val ELSE default END` handles values dynamically', '`COALESCE(val, fallback)` returns the first non-null argument', '`NULLS LAST` specifies sort order for records with empty fields', 'Use regex syntax `~*` for case-insensitive matching in Postgres'],
          codeExample: `-- Conditional selection\nSELECT name,\n       CASE WHEN rating >= 4.5 THEN 'Exceptional'\n            WHEN rating >= 4.0 THEN 'Good'\n            ELSE 'Standard'\n       END as quality,\n       COALESCE(status, 'inactive') as user_status\nFROM courses;`,
          practiceTask: 'Implement a case statement that categorizes user streaks into three ranges (Beginner, Intermediate, Master).'
        }
      },
      quizzes: [
        { question: 'Which clause is used to sort the result set?', options: ['SORT BY', 'ORDER BY', 'GROUP BY', 'ARRANGE BY'], answer: 1, explanation: '`ORDER BY` is the SQL standard clause used to sort query results.' },
        { question: 'What does `SELECT *` do?', options: ['Deletes a table', 'Selects all rows', 'Selects all columns', 'Creates an index'], answer: 2, explanation: '`SELECT *` tells the database to retrieve all columns from the table.' },
        { question: 'Which operator matches a string pattern with wildcards?', options: ['MATCH', 'LIKE', 'SIMILAR', 'IN'], answer: 1, explanation: 'The `LIKE` operator is used in a WHERE clause to search for a specified pattern in a column.' }
      ],
      interviewQA: [
        { q: 'What is the difference between WHERE and HAVING?', a: '`WHERE` filters rows before any grouping or aggregations are calculated. `HAVING` filters grouped rows after aggregation has been applied.' },
        { q: 'What does COALESCE do and when should you use it?', a: '`COALESCE(val1, val2, ...)` returns the first non-null value in the arguments list. It is commonly used to replace null values with defaults in query reports.' },
        { q: 'How does LIMIT and OFFSET work for pagination?', a: '`LIMIT N` specifies the maximum number of rows to return. `OFFSET M` specifies how many rows to skip before returning results. E.g., for page 3 with 10 rows per page: `LIMIT 10 OFFSET 20`.' }
      ]
    },
    {
      name: 'Aggregations & Grouping (GROUP BY)',
      levels: {
        beginner: {
          explanation: 'Aggregation functions compile a set of values into a single summary statistic. The main aggregate functions are `COUNT()`, `SUM()`, `AVG()`, `MIN()`, and `MAX()`. `GROUP BY` groups rows that have the same values.',
          keyPoints: ['`COUNT(column)` returns the number of non-null values', '`AVG(column)` calculates the arithmetic mean', '`GROUP BY` collapses rows into summary groups based on matching fields', 'Aggregations ignore NULL values by default'],
          analogy: 'Imagine a list of classroom scores: `AVG` tells you the class average, and `GROUP BY ClassName` gives the average for each classroom separately.',
          codeExample: `-- Count users and find average streak\nSELECT status, COUNT(*) as user_count, AVG(streak) as avg_streak\nFROM users\nGROUP BY status;`,
          practiceTask: 'Write a query that calculates the total number of courses and the maximum rating in each category.'
        },
        intermediate: {
          explanation: '`COUNT(DISTINCT column)` returns the number of unique non-null values. The `HAVING` clause is used to filter groups based on aggregated results, as `WHERE` cannot be used with aggregate functions.',
          keyPoints: ['Use `COUNT(DISTINCT name)` to find unique items', '`HAVING` filters groups after `GROUP BY` execution', 'Columns in `SELECT` that are not aggregated MUST be in `GROUP BY`', 'Aggregations can be combined inside calculations: `SUM(a) / SUM(b)`'],
          codeExample: `-- Aggregate filtering using HAVING\nSELECT category, AVG(rating) as avg_rating\nFROM courses\nGROUP BY category\nHAVING COUNT(*) > 3 AND AVG(rating) >= 4.0;`,
          practiceTask: 'Write a query that lists all user categories where the sum of user streaks is greater than 100.'
        },
        advanced: {
          explanation: 'Aggregations can be modified using `FILTER (WHERE ...)` (SQL standard). Grouping sets, `ROLLUP`, and `CUBE` generate multi-dimensional hierarchical reports. Aggregate states can be preserved.',
          keyPoints: ['`ROLLUP(a, b)` generates group summaries and grand totals', '`FILTER(WHERE condition)` filters rows before applying the aggregate function', '`GROUPING SETS` specifies multiple group groupings in a single query', '`STRING_AGG` concatenates text values across rows'],
          codeExample: `-- Advanced grouping with ROLLUP\nSELECT category, status, COUNT(*)\nFROM courses\nGROUP BY ROLLUP(category, status);`,
          practiceTask: 'Use ROLLUP to generate a report of total students grouped by category and course name, including category totals.'
        }
      },
      quizzes: [
        { question: 'Which aggregate function returns the total number of rows?', options: ['SUM()', 'COUNT()', 'TOTAL()', 'ADD()'], answer: 1, explanation: '`COUNT()` counts the number of rows or non-null values in a query.' },
        { question: 'Can you use a WHERE clause to filter based on AVG(score) > 80?', options: ['Yes', 'No, must use HAVING', 'Only if grouped', 'Only in NoSQL'], answer: 1, explanation: 'Aggregate functions cannot be used in a `WHERE` clause. You must filter aggregates using a `HAVING` clause.' },
        { question: 'What does `COUNT(DISTINCT category)` do?', options: ['Counts all categories', 'Counts only duplicate categories', 'Counts unique categories', 'Groups categories'], answer: 2, explanation: 'It returns the count of unique, non-null values inside the category column.' }
      ],
      interviewQA: [
        { q: 'What happens if you omit a non-aggregated column from the GROUP BY clause?', a: 'It raises a syntax error in most SQL engines (like PostgreSQL, SQL Server). The database needs to know how to group the non-aggregated column; otherwise, it cannot determine which row value to display.' },
        { q: 'Explain the difference between COUNT(*) and COUNT(column_name).', a: '`COUNT(*)` counts every row in the result set, including rows with NULL values. `COUNT(column_name)` only counts rows where that specific column is NOT NULL.' },
        { q: 'How does ROLLUP differ from GROUP BY?', a: '`GROUP BY a, b` groups only by unique combinations of a and b. `GROUP BY ROLLUP(a, b)` generates groupings for (a,b), (a), and an overall grand total (empty group), creating hierarchical sub-totals.' }
      ]
    },
    {
      name: 'Table Joins (INNER, LEFT, RIGHT)',
      levels: {
        beginner: {
          explanation: 'Joins are used to combine rows from two or more tables based on a related column between them (usually primary and foreign keys). `INNER JOIN` returns matching records in both tables. `LEFT JOIN` returns all records from the left table and matched from the right.',
          keyPoints: ['Use `ON table1.id = table2.table1_id` to specify relationship', '`INNER JOIN` requires a match in both tables', '`LEFT JOIN` (or LEFT OUTER JOIN) includes all left table rows, filling unmatched right fields with NULL', 'Alias tables (`FROM users u`) simplifies query text'],
          analogy: 'Imagine a list of students and a list of library cards. `INNER JOIN` lists only students who have library cards. `LEFT JOIN` lists every student, leaving the card number blank (NULL) if they do not have one.',
          codeExample: `-- Inner join to get user logs\nSELECT u.name, l.event_type, l.timestamp\nFROM users u\nINNER JOIN local_logs l ON u.email = l.user_email;`,
          practiceTask: 'Write a query that joins the users table and progress table to list all users and their completed course percentages.'
        },
        intermediate: {
          explanation: '`RIGHT JOIN` returns all records from the right table and matched from the left. `FULL OUTER JOIN` returns all records when there is a match in either table. Self Joins join a table to itself to compare records.',
          keyPoints: ['`FULL OUTER JOIN` returns all rows from both tables, filling mismatches with NULL', 'Self join joins a table to itself: `FROM employees e1 JOIN employees e2`', 'Cross join returns the Cartesian product of the two tables (all combinations)', 'Use `USING(column)` as shorthand if columns share the exact same name'],
          codeExample: `-- Left outer join with NULL filtering\nSELECT u.name\nFROM users u\nLEFT JOIN local_logs l ON u.email = l.user_email\nWHERE l.id IS NULL; -- users with no logs`,
          practiceTask: 'Write a self-join query on a table of employees to display each employee name next to their manager\'s name.'
        },
        advanced: {
          explanation: 'Under the hood, database query planners execute joins using Nested Loops, Hash Joins, or Merge Sort Joins depending on indexes and data size. Join ordering affects query plan efficiency.',
          keyPoints: ['Hash Joins build in-memory hash tables of the smaller table', 'Merge Joins sort both inputs on the join key first; highly efficient for large datasets', 'Cross joins can trigger catastrophic layout sizes if accidental', 'Verify join performance using `EXPLAIN ANALYZE`'],
          codeExample: `-- Multiple joins with conditions\nSELECT u.name, c.name, p.progress_percent\nFROM users u\nINNER JOIN progress p ON u.email = p.user_email\nINNER JOIN courses c ON p.course_id = c.id\nWHERE p.progress_percent = 100;`,
          practiceTask: 'Join 3 tables: Users, Progress, and Settings, to find the average progress of users who have "dark_mode" enabled in their settings.'
        }
      },
      quizzes: [
        { question: 'Which join returns only rows where there is a match in both tables?', options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'], answer: 2, explanation: '`INNER JOIN` selects records that have matching values in both tables.' },
        { question: 'In a LEFT JOIN, what value is filled in columns of the right table if no match is found?', options: ['0', 'Empty string', 'NULL', 'Throws an error'], answer: 2, explanation: 'If no match is found, columns of the right table are filled with NULL.' },
        { question: 'How do you join a table to itself?', options: ['Using SELF JOIN keyword', 'You cannot join a table to itself', 'Using a regular join with different table aliases', 'Using UNION'], answer: 2, explanation: 'A self join is a regular join where the table is joined with itself using different alias names (e.g. `FROM users u1 JOIN users u2`).' }
      ],
      interviewQA: [
        { q: 'What is the difference between LEFT JOIN and RIGHT JOIN?', a: '`LEFT JOIN` returns all records from the left table and matched records from the right. `RIGHT JOIN` returns all records from the right table and matched records from the left. They are logically interchangeable by swapping table order.' },
        { q: 'What is a cross join and when would you use it?', a: 'A cross join returns the Cartesian product of two tables — every row of table A matched with every row of table B. It is used when you need to generate all possible combinations of records (e.g., combinations of sizes and colors).' },
        { q: 'How does a Hash Join differ from a Nested Loop Join?', a: 'Nested Loop compares every row of table A with every row of B (good for small tables, O(N*M)). Hash Join hashes the join key of the smaller table into memory and scans the larger table against it (O(N+M), fast for large unsorted datasets).' }
      ]
    },
    {
      name: 'Subqueries & Nested Operations',
      levels: {
        beginner: {
          explanation: 'A subquery is a query nested inside another query (e.g. inside `SELECT`, `FROM`, or `WHERE`). Subqueries must be enclosed in parentheses.',
          keyPoints: ['Subquery: inner query evaluated first', 'Can return a single value (scalar), a column (list), or a table', 'Used in WHERE with operators like `IN`, `EXISTS`, `>`, `<`', 'Always enclosed in parentheses: `WHERE age > (SELECT AVG(...) ...)`'],
          analogy: 'Imagine looking up the average class grade first, and then using that number to filter students who scored higher. A subquery does this in a single query.',
          codeExample: `-- Scalar subquery in WHERE\nSELECT name, streak\nFROM users\nWHERE streak > (SELECT AVG(streak) FROM users);`,
          practiceTask: 'Write a query that finds all courses where the rating is greater than the average rating of all courses.'
        },
        intermediate: {
          explanation: 'Correlated subqueries reference columns from the outer query, executing once for each row. The `EXISTS` operator checks for the presence of rows, which is faster than `IN` for large tables.',
          keyPoints: ['Correlated subquery: references outer table columns', '`EXISTS` stops evaluation early once a match is found (efficient)', 'Subquery in FROM acts as a temporary inline table (must be aliased)', '`ANY` / `ALL` compare values to a subquery list'],
          codeExample: `-- Correlated subquery using EXISTS\nSELECT c.name\nFROM courses c\nWHERE EXISTS (\n  SELECT 1 FROM progress p\n  WHERE p.course_id = c.id AND p.progress_percent = 100\n);`,
          practiceTask: 'Write a correlated subquery that finds users who have logged at least one event in the logs table.'
        },
        advanced: {
          explanation: 'Common Table Expressions (CTEs) define temporary named result sets using the `WITH` clause, improving readability over nested subqueries. Recursive CTEs can traverse hierarchical or tree-structured data.',
          keyPoints: ['CTEs: `WITH my_cte AS (...) SELECT ... FROM my_cte`', 'Recursive CTEs reference themselves using `UNION ALL`', 'Lateral joins (`LATERAL`) act like a foreach loop over outer rows', 'Inline views must be optimized by the query compiler'],
          codeExample: `-- CTE configuration\nWITH CategoryStats AS (\n  SELECT category, AVG(rating) as avg_rating, COUNT(*) as count\n  FROM courses\n  GROUP BY category\n)\nSELECT category, avg_rating\nFROM CategoryStats\nWHERE count > 2;`,
          practiceTask: 'Write a recursive CTE that generates a sequence of numbers from 1 to 10.'
        }
      },
      quizzes: [
        { question: 'What is a subquery?', options: ['A query that runs on a sub-database', 'A SELECT query nested inside another SQL statement', 'A query written in lowercase', 'A backup database table'], answer: 1, explanation: 'A subquery is a nested SELECT query enclosed in parentheses inside an outer query.' },
        { question: 'Which operator is best for checking if a subquery returns any rows?', options: ['IN', 'LIKE', 'EXISTS', 'ANY'], answer: 2, explanation: '`EXISTS` is highly efficient because it stops scanning as soon as it finds the first matching row.' },
        { question: 'What clause defines a Common Table Expression (CTE)?', options: ['WITH', 'DEFINE', 'CREATE TEMP', 'USING'], answer: 0, explanation: 'A CTE is defined using the `WITH` clause at the start of a query.' }
      ],
      interviewQA: [
        { q: 'What is a correlated subquery?', a: 'A correlated subquery is a nested query that depends on columns from the outer query. It is evaluated once for each row processed by the outer query, which can make it slower than non-correlated subqueries.' },
        { q: 'How does CTE differ from a subquery?', a: 'A CTE (Common Table Expression) is defined at the top of a query using `WITH`, making it highly readable and reusable multiple times in the query. Subqueries are nested inline and can make complex queries hard to read.' },
        { q: 'When is EXISTS preferred over IN?', a: '`EXISTS` is preferred when checking for existence in a large dataset because it stops processing as soon as a match is found (semi-join optimization). `IN` evaluates the entire subquery list first, which can consume significant memory.' }
      ]
    }
  ]

  // All other courses use the intelligent fallback generator below
};

/**
 * Get rich per-topic data for a course, falling back to generated content.
 */
function getRichTopicData(courseId, topicIndex) {
  const richCourse = TOPIC_RICH_DATA[courseId];
  if (richCourse && richCourse[topicIndex]) {
    return richCourse[topicIndex];
  }
  return null;
}

/**
 * Generate 10 quiz questions for any topic using course/topic context.
 */
function generateFallbackQuizzes(courseName, topicName, topicKeyword) {
  const q = (question, options, answer, explanation) => ({ question, options, answer, explanation });
  return [
    q(`What is the main purpose of "${topicName}" in ${courseName}?`,
      [`Managing unrelated data structures`, `Understanding and applying core concepts of ${topicName}`, `Running automated tests only`, `Deploying to cloud platforms`], 1,
      `${topicName} is a fundamental area in ${courseName} that provides essential tools and concepts for building real-world applications.`),
    q(`Which of the following best describes ${topicName}?`,
      [`An optional advanced topic`, `A core component integral to ${courseName} architecture`, `A deprecated legacy feature`, `A testing framework`], 1,
      `${topicName} is a core building block in ${courseName} that practitioners must master.`),
    q(`In ${courseName}, when would you use concepts from "${topicName}"?`,
      [`Only in legacy projects`, `When building scalable, maintainable applications`, `Only for front-end projects`, `Only when using cloud services`], 1,
      `Concepts from ${topicName} apply broadly across most ${courseName} projects.`),
    q(`What is the beginner's first step when learning ${topicName}?`,
      [`Deploying immediately to production`, `Understanding the underlying concepts and basic syntax`, `Writing advanced algorithms`, `Skipping to advanced optimization`], 1,
      `Beginners should focus on fundamentals — understanding what ${topicName} is and how basic patterns work.`),
    q(`Which practice improves performance in ${topicName}?`,
      [`Ignoring errors`, `Writing clean, well-structured code and following best practices`, `Using only global variables`, `Avoiding all abstractions`], 1,
      `Following best practices and writing clean code significantly improves maintainability and performance.`),
    q(`A common mistake when working with ${topicName} is:`,
      [`Using clear variable names`, `Ignoring edge cases and failing to validate inputs`, `Writing tests`, `Reading documentation`], 1,
      `Ignoring edge cases and input validation is one of the most common and dangerous mistakes in software development.`),
    q(`What does an intermediate ${courseName} developer focus on in ${topicName}?`,
      [`Basic syntax only`, `Performance optimization and integration patterns`, `Only following tutorials`, `Avoiding the topic entirely`], 1,
      `Intermediate developers apply ${topicName} concepts to real problems with an eye on performance and integration.`),
    q(`Which tool or technique is commonly used with ${topicName} in ${courseName}?`,
      [`Manual pen-and-paper calculations`, `Industry-standard tools and frameworks aligned with ${courseName}`, `Deprecated approaches from the 1990s`, `Only command-line without any libraries`], 1,
      `${courseName} professionals use modern tools and frameworks that complement ${topicName} concepts.`),
    q(`How does ${topicName} contribute to a production-ready application?`,
      [`It doesn't — it's only for learning`, `It provides the structural foundation and reliability needed for production systems`, `It only works in development environments`, `It slows down production systems`], 1,
      `${topicName} concepts form the backbone of production-grade applications in ${courseName}.`),
    q(`What is the advanced application of ${topicName} in enterprise ${courseName} projects?`,
      [`Using it for hobby projects only`, `Scaling patterns, optimization strategies, and architectural integration`, `Replacing all code with ${topicName} only`, `Avoiding it in favor of simpler approaches`], 1,
      `Advanced practitioners use ${topicName} for scalable architectures, optimization, and enterprise integration patterns.`)
  ];
}

/**
 * Generate 5 interview Q&A pairs for any topic.
 */
function generateFallbackInterviewQA(courseName, topicName) {
  return [
    { q: `Can you explain what "${topicName}" means in the context of ${courseName}?`, a: `${topicName} is a core concept in ${courseName} that covers the principles, patterns, and tools needed to effectively work in this domain. It forms the foundation for understanding how ${courseName} systems are designed and operated.` },
    { q: `What are the most important best practices when working with ${topicName} in ${courseName}?`, a: `Key best practices include: following established naming and structural conventions, writing clear and maintainable code, handling errors gracefully, testing thoroughly, keeping code modular and reusable, and referring to official documentation for ${courseName}.` },
    { q: `What challenges did you face when learning ${topicName} and how did you overcome them?`, a: `Common challenges include understanding abstract concepts, debugging unexpected behavior, and integrating ${topicName} into larger systems. Overcoming them involves hands-on projects, reading documentation, studying error messages carefully, and building progressively more complex examples.` },
    { q: `How does ${topicName} differ at beginner vs advanced levels in ${courseName}?`, a: `At beginner level, focus is on understanding syntax and basic patterns. At intermediate level, you apply concepts to real problems with attention to performance. At advanced level, you architect systems using ${topicName} at scale, understanding internals, trade-offs, and enterprise patterns.` },
    { q: `How would you explain ${topicName} to a non-technical stakeholder?`, a: `${topicName} in ${courseName} provides the tools and structure needed to build reliable, maintainable software. Think of it as the blueprint and building blocks — without it, the application would be disorganized and hard to maintain. It helps ensure the product is fast, reliable, and scalable.` }
  ];
}

// Generate the full 7-step learning structure details for a given course
function generateCourseSyllabus(courseId) {
  const course = COURSES_DATA.find(c => c.id === courseId);
  if (!course) return null;
  
  const topics = getTopicsForCourse(courseId, course.name);
  
  return {
    course,
    skills: [
      `Understand foundational ${course.name} architectures`,
      `Implement core syntax structures, operations, and models`,
      `Design and optimize projects using ${course.name} best practices`,
      `Debug common syntax errors and handle configurations`,
      `Build real-world projects and address interview questions`
    ],
    subjects: [
      `${course.name} Core Principles`,
      `Intermediate Workflows & Automation`,
      `Advanced Project Implementations`,
      `Security, Optimization & Testing`
    ],
    syllabus: topics.map((t, idx) => ({
      unit: `Unit ${idx + 1}`,
      title: t.name,
      description: t.desc
    })),
    topics: topics.map((t, idx) => ({
      id: `${courseId}_topic_${idx}`,
      name: t.name,
      desc: t.desc,
      index: idx
    }))
  };
}

// Global Exports for UI use
window.SmartLearningDB = {
  getCourses: () => COURSES_DATA,
  getCourseById: (id) => COURSES_DATA.find(c => c.id === id),
  getTopicsForCourse: (courseId, courseName) => getTopicsForCourse(courseId, courseName),
  generateTopicContent: (courseId, courseName, topicIndex) => generateTopicContent(courseId, courseName, topicIndex),
  generateCourseSyllabus: (courseId) => generateCourseSyllabus(courseId),
  getRichTopicData: (courseId, topicIndex) => getRichTopicData(courseId, topicIndex),
  generateFallbackQuizzes: (courseName, topicName, keyword) => generateFallbackQuizzes(courseName, topicName, keyword),
  generateFallbackInterviewQA: (courseName, topicName) => generateFallbackInterviewQA(courseName, topicName)
};

