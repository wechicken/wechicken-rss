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

  findList({ limit, offset }) {
    return this.db.QUERY`
        SELECT id,
               blog_address,
               blog_type_id
        FROM user
        LIMIT ${limit} OFFSET ${offset}
    `;
  }

  findTestList() {
    return this.db.QUERY`
        SELECT id,
               blog_address,
               blog_type_id
        FROM user
        WHERE blog_type_id = 1
    `;

  }
}

module.exports = UserRepository;