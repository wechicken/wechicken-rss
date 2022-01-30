const BlogRepository = require('./blog.repository');
const F = require('fxjs/Strict');
const dayjs = require('dayjs');

class BlogService {
  constructor({ db }) {
    this.blogRepository = new BlogRepository({ db });
    this.filterNewBlogs = this.filterNewBlogs.bind(this);
  }

  saveBlog({ title, link, written_date, user_id }) {
    return this.blogRepository.insert({ title, link, written_date, user_id });
  }

  getRecentBlog = ({ user_id }) => {
    return this.blogRepository.findRecentItem({ user_id });
  };

  async filterNewBlogs({ user_id, blogs }) {
    const theRecentBlog = await this.getRecentBlog({ user_id });
    console.log(theRecentBlog);

    return F.go(
      blogs,
      // F.filter(({ created }) => created < theRecentBlog.written_date),
      F.each(({ created }) => {
        F.log(created);
        F.log(dayjs(created).format('YYYY-MM-DD'));
      }),
      (newBlogs) => ({
        user_id,
        blogs: newBlogs,
      }),
    );
  }
}

module.exports = BlogService;