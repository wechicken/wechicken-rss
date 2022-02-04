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

    const userService = new UserService({ db });
    const rssService = new RssService();
    const blogService = new BlogService({ db });

    const [userCount] = await userService.getUserCount();
    console.log(userCount);

    /**
     * TODO:
     *  - 1. userCount 를 기반으로 userService.getUsers limit, offset 설정하기
     *  - 2. 아래 함수들을 파이프로 분리해서 나눠진 유저 리스트를 병렬로 rss 서비스 로직을 타게 함수로 만들 수 있다.
     *  - 3. written_datetime 칼럼 추가하기 or written_date 를 변경하기
     *  - 4. written_datetime 으로 비교해야 글이 쓰여진 시각을 정확히 비교할 수 있음
     */

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