const BlogRepository = require('./blog.repository');

class BlogService {
  constructor({ db }) {
    this.blogRepository = new BlogRepository({ db });
  }

  saveBlog({ title, link, written_date, user_id }) {
    return this.blogRepository.insert({ title, link, written_date, user_id });
  }
}

module.exports = BlogService;