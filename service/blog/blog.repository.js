class BlogRepository {
  constructor({ db }) {
    this.db = db;
  }

  insert({ title, link, written_date, user_id }) {
    return this.db.QUERY`
        INSERT INTO blog (title,
                          link,
                          written_date,
                          user_id)
        VALUES (title, link, written_date, user_id)
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