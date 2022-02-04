const F = require('fxjs/Strict');
const { parse } = require('rss-to-json');
const { BLOG_TYPES_ENUM } = require('../constant');
const { VELOG, MEDIUM, TISTORY } = BLOG_TYPES_ENUM;

const rssMapper = ({ blog_address, blog_type_id }) => ({
  [VELOG]: () => F.go(
    blog_address,
    F.split('/'),
    F.last,
    F.replace('@', ''),
    (userName) => `https://v2.velog.io/rss/${userName}`,
  ),
  [MEDIUM]: () => F.go(
    blog_address,
    F.split('/'),
    (a) => F.insert(a.length - 1, 'feed', a),
    F.join('/'),
  ),
  [TISTORY]: () => F.go(
    blog_address,
    () => `${blog_address}/feed`,
  ),
}[blog_type_id]);

const HTTPS_REGEXP = /^(https:\/\/)/;
const makeSureHttpsIncluded = (rssUrl) => F.go(
  rssUrl,
  F.ifElse(() => HTTPS_REGEXP.test(rssUrl), () => rssUrl, () => `https://${rssUrl}`),
);

const parseRSS = (rssUrl) => parse(rssUrl).catch(e => {
  // console.log(e);
  return null;
});

class RssService {
  /**
   * blog 서비스 마다의 RSS 주소를 맵핑한다.
   * @param {string} user_id
   * @param {string} blog_address
   * @param {string} blog_type_id
   * @returns {Object} { user_id, rssUrl }
   */
  userBlogAddressRssMapper({ user_id, blog_address, blog_type_id }) {
    return {
      user_id,
      rssUrl: rssMapper({ blog_address, blog_type_id })(),
    };
  }

  /**
   * rss 주소가 인풋으로 넘어오면
   * rss API 를 통해 XML 을 얻어온다.
   * XML 로 부터 블로그 엔티티를 뽑아낸다.
   * @param {string} user_id
   * @param {string} rssUrl
   * @return {Promise<{user_id: string, blogs: BLOG[]}[]>} { user_id, blogs: {link, title, category, created}[] }
   */
  rssReader({ user_id, rssUrl }) {
    return F.goS(
      rssUrl,
      makeSureHttpsIncluded,
      parseRSS,
      F.stopIf((a) => a === null, rssUrl),
      ({ items }) => items,
      F.map(({ link, title, category, created }) => ({ link, title, category, created })),
      (blogs) => ({
        user_id,
        blogs,
      }),
    );
  }
}


module.exports = RssService;