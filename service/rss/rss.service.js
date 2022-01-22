const F = require('fxjs/Strict');
const { parse } = require('rss-to-json');

const rssMapper = ({ blog_address, blog_type_id }) => ({
  1: F.go(
    blogAddress,
    F.split('/'),
    F.last,
    F.replace('@', ''),
    (userName) => `https://v2.velog.io/rss/{userName}`,
  ),
  2: `${blogAddress}/feed`,
  3: `${blogAddress}/feed`,
});

class RssService {
  /**
   * blog 서비스 마다의 RSS 주소를 맵핑한다.
   * @param blog_address
   * @param blog_type_id
   * @returns string
   */
  static userBlogAddressRssMapper({ blog_address, blog_type_id }) {
    return rssMapper({ blog_address, blog_type_id });
  }

  /**
   * rss 주소가 인풋으로 넘어오면
   * rss API 를 통해 XML 을 얻어온다.
   * XML 로 부터 블로그 엔티티를 뽑아낸다.
   * @param rssUrl
   * @return Promise<RssBlog{ link, title, category, created }[]>
   */
  static rssReader(rssUrl) {
    return F.go(
      rssUrl,
      parse,
      ({ items }) => items,
      F.map(({ link, title, category, created }) => ({ link, title, category, created })),
    );
  }
}


module.exports = RssService;