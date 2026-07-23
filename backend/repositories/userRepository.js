/**
 * userRepository.js
 * Data Access Layer Repository for Backend User Management
 */

class UserRepository {
  constructor(db) {
    this.db = db;
  }

  findByEmail(email, callback) {
    this.db.get("SELECT * FROM users WHERE email = ?", [email], callback);
  }

  create(user, callback) {
    this.db.run(
      "INSERT INTO users (email, password, name, bio) VALUES (?, ?, ?, ?)",
      [user.email, user.password, user.name, user.bio || ''],
      callback
    );
  }
}

module.exports = UserRepository;
