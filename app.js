const UserService = require('./service/user/user.service');
const RssService = require('./service/rss/rss.service');
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

    const userService = new UserService({ db });

    const [userCount] = await userService.getUserCount();
    console.log(userCount);

    await F.go(
      // userService.getUsers({ limit: 10, offset: 0 }),
      userService.getTestUsers(),
      F.filter(({ blog_type_id }) => F.includes(blog_type_id, ALLOWED_BLOG_TYPE_ID)),
      F.map(RssService.userBlogAddressRssMapper),
      C.map(RssService.rssReader),
      F.filter((a) => !F.isArray(a)),
      F.log,
    );


  } catch (e) {
    console.log(e);
  } finally {
    await db.END();
  }
};

app();