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
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    const userService = new UserService({ db });
    const rssService = new RssService();
    const blogService = new BlogService({ db });

    const [userCount] = await userService.getUserCount();

    const ETL = F.pipe(
      F.filter(({ blog_type_id }) => F.includes(blog_type_id, ALLOWED_BLOG_TYPE_ID)),
      F.map(rssService.userBlogAddressRssMapper),
      C.map(rssService.rssReader),
      F.reject(({ blogs }) => !F.isArray(blogs)),
      F.map(blogService.filterNewBlogs),
      F.reject(({ blogs }) => blogs.length === 0),
      F.each(({ blogs }) => F.map(F.log, blogs)),
      F.map(blogService.saveBlogs),
    );

    const TIME_LABEL = `ALL ${userCount} USERS NEW BLOGS SYNCED`;
    console.time(TIME_LABEL);

    await F.goS(
      userService.getUsers(),
      F.chunk(50),
      F.map(ETL),
    );

    console.timeEnd(TIME_LABEL);

  } catch (e) {
    console.error(e);
  } finally {
    await db.END();
  }
};

app();