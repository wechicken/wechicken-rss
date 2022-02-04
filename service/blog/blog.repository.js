class BlogRepository {
  constructor({ db }) {
    this.db = db;

    this.bulkInsert = this.bulkInsert.bind(this);
    this.findRecentItem = this.findRecentItem.bind(this);
  }

  bulkInsert(blogs) {
    const { QUERY, VALUES } = this.db;

    return QUERY`
        INSERT INTO blog
            ${VALUES(blogs)}
    `;
  }

  findRecentItem({ user_id }) {
    return this.db.QUERY`
        SELECT id AS blog_id,
               title,
               written_date,
               created_at
        FROM blog
        WHERE user_id = ${user_id}
        ORDER BY written_date DESC
        LIMIT 1
    `;
  }

}

module.exports = BlogRepository;