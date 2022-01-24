const F = require('fxjs/Strict');
const { parse } = require('rss-to-json');

const rssMapper = ({ blog_address, blog_type_id }) => ({
  1: () => F.go(
    blog_address,
    F.split('/'),
    F.last,
    F.replace('@', ''),
    (userName) => `https://v2.velog.io/rss/${userName}`,
  ),
  2: () => F.go(
    blog_address,
    F.split('/'),
    (a) => F.insert(a.length - 1, 'feed', a),
    F.join('/'),
  ),
  3: () => F.go(
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
   * @param blog_address
   * @param blog_type_id
   * @returns string
   */
  static userBlogAddressRssMapper({ blog_address, blog_type_id }) {
    return rssMapper({ blog_address, blog_type_id })();
  }

  /**
   * rss 주소가 인풋으로 넘어오면
   * rss API 를 통해 XML 을 얻어온다.
   * XML 로 부터 블로그 엔티티를 뽑아낸다.
   * @param rssUrl
   * @return Promise<RssBlog{ link, title, category, created }[]>
   */
  static rssReader(rssUrl) {
    return F.goS(
      rssUrl,
      makeSureHttpsIncluded,
      parseRSS,
      F.stopIf((a) => a === null, rssUrl),
      ({ items }) => items,
      F.map(({ link, title, category, created }) => ({ link, title, category, created })),
    );
  }
}


module.exports = RssService;