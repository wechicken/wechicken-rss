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


}

module.exports = BlogRepository;