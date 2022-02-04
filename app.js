const UserService = require('./service/user/user.service');
const RssService = require('./service/rss/rss.service');
const BlogService = require('./service/blog/blog.service');
const F = require('fxjs/Strict');
const C = require('fxjs/Concurrency');
const { ALLOWED_BLOG_TYPE_ID } = require('./service/constant');
const { MySQL } = require('fxsql');
const { CONNECT } = MySQL;

const app = async () => {
  let db;

  try {
    db = CONNECT({
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: 'password',
      database: 'wechicken',
    });
    db.FxSQL_DEBUG = true;

    const userService = new UserService({ db });
    const rssService = new RssService();
    const blogService = new BlogService({ db });

    const [userCount] = await userService.getUserCount();
    console.log(userCount);

    await F.goS(
      // userService.getUsers({ limit: 10, offset: 0 }),
      userService.getTestUsers(),
      F.filter(({ blog_type_id }) => F.includes(blog_type_id, ALLOWED_BLOG_TYPE_ID)),
      F.map(rssService.userBlogAddressRssMapper),
      C.map(rssService.rssReader),
      F.reject(({ blogs }) => !F.isArray(blogs)),
      F.map(blogService.filterNewBlogs),
      F.reject(({ blogs }) => blogs.length === 0),
      F.each(({ blogs }) => F.map(F.log, blogs)),
      F.map(blogService.saveBlogs),
    );


  } catch (e) {
    console.log(e);
  } finally {
    await db.END();
  }
};

app();