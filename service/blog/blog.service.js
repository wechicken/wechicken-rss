const BlogRepository = require('./blog.repository');
const F = require('fxjs/Strict');
const dayjs = require('dayjs');

class BlogService {
  constructor({ db }) {
    this.blogRepository = new BlogRepository({ db });

    this.saveBlogs = this.saveBlogs.bind(this);
    this.getRecentBlog = this.getRecentBlog.bind(this);
    this.filterNewBlogs = this.filterNewBlogs.bind(this);
  }

  async saveBlogs({ user_id, blogs }) {
    await F.go(
      blogs,
      F.map((b) => ({ user_id, ...b })),
      F.map(F.omit(['category'])),
      F.map(({ created, ...rest }) => ({ written_datetime: dayjs(created).format('YYYY-MM-DD HH:mm:ss'), ...rest })),
      this.blogRepository.bulkInsert,
      () => console.log(`User: ${user_id} new blogs saved successfully`),
    );
  }

  getRecentBlog({ user_id }) {
    return this.blogRepository.findRecentItem({ user_id });
  };

  async filterNewBlogs({ user_id, blogs }) {
    const [theRecentBlog] = await this.getRecentBlog({ user_id });

    return F.goS(
      blogs,
      F.stopIf(() => !theRecentBlog, { user_id, blogs }),
      F.filter(({ created }) => dayjs(created).isAfter(theRecentBlog.written_datetime)),
      F.reject(({ title }) => title === theRecentBlog.title),
      (filteredNewBlogs) => ({
        user_id,
        blogs: filteredNewBlogs,
      }),
    );
  }
}

module.exports = BlogService;