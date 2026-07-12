const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('smart_learn.db');

db.serialize(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    console.log('\n📋 ALL TABLES IN smart_learn.db:');
    (tables || []).forEach(t => console.log('  -', t.name));
  });

  db.all("SELECT * FROM users LIMIT 20", [], (err, rows) => {
    console.log('\n👤 USERS TABLE:');
    if (rows && rows.length) {
      console.log('  Columns:', Object.keys(rows[0]).join(', '));
      rows.forEach(r => console.log('  ', JSON.stringify(r)));
    } else console.log('  (empty)');
  });

  db.all("SELECT * FROM course_progress LIMIT 20", [], (err, rows) => {
    console.log('\n📊 COURSE PROGRESS:');
    if (rows && rows.length) rows.forEach(r => console.log('  ', JSON.stringify(r)));
    else console.log('  (empty)');
  });

  db.all("SELECT * FROM chat_history LIMIT 10", [], (err, rows) => {
    console.log('\n💬 CHAT HISTORY:');
    if (rows && rows.length) rows.forEach(r => console.log('  ', JSON.stringify(r)));
    else console.log('  (empty)');
  });

  db.all("SELECT * FROM local_logs LIMIT 10", [], (err, rows) => {
    console.log('\n📝 LOCAL LOGS:');
    if (rows && rows.length) rows.forEach(r => console.log('  ', JSON.stringify(r)));
    else console.log('  (empty)');
  });

  db.all("SELECT * FROM settings LIMIT 10", [], (err, rows) => {
    console.log('\n⚙️  SETTINGS:');
    if (rows && rows.length) rows.forEach(r => console.log('  ', JSON.stringify(r)));
    else console.log('  (empty)');

    db.close(() => console.log('\n✅ Done.'));
  });
});
