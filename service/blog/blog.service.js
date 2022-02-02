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
    const [theRecentBlog] = await this.getRecentBlog({ user_id });

    return F.goS(
      blogs,
      F.stopIf(() => !theRecentBlog, { user_id, blogs }),
      F.filter(({ created }) => dayjs(created).isAfter(theRecentBlog.written_date)),
      F.reject(({ title }) => title === theRecentBlog.title),
      (filteredNewBlogs) => ({
        user_id,
        blogs: filteredNewBlogs,
      }),
    );
  }
}

module.exports = BlogService;