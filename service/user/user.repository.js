class UserRepository {
  constructor({ db }) {
    this.db = db;
  }

  count() {
    return this.db.QUERY`
        SELECT COUNT(id) as cnt
        FROM user
    `;
  }

  findList() {
    return this.db.QUERY`
        SELECT id AS user_id,
               blog_address,
               blog_type_id
        FROM user
    `;
  }

  findTestList() {
    return this.db.QUERY`
        SELECT id AS user_id,
               blog_address,
               blog_type_id
        FROM user
        WHERE blog_type_id = 2
    `;

  }
}

module.exports = UserRepository;