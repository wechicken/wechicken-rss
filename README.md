# Wechicken-rss

## Service
### app
- lambda
- cron job 형식으로 주기적으로 수행될 수 있도록 한다.
- 주요 서비스 로직을 실행시키기 위한 entry 파일
- `user-blog-address-rss-mapper` 를 호출해서 블로그 마다 RSS 주소를 얻어낸다.
> **고민해야할 사항**
> - 병렬적으로 몇명의 유저를 처리할지 quota 정하기
> - user 테이블 COUNT 해서 유저의 총 수를 얻어내기
- `rss-reader` 를 호출해서 각 유저 별로 파싱된 블로그 엔티티 Blog[] 얻어내기
- `get-new-blogs` 를 호출해서 각 유저 별로 새롭게 쓰여진 글 Blog[] 걸러내기
- `save-new-blogs` 를 호출해서 각 유저 별로 새롭게 쓰여진 글 Blog[] DB에 저장하기

### user-blog-address-rss-mapper
- user 테이블에서 blog 주소와 type 을 읽는다.
- blog 서비스 마다의 RSS 주소를 맵핑한다.

> **고민해야할 사항**
> - blog 서비스 마다 RSS 주소가 어떻게 맵핑되는지 규칙 파악하기

### rss-reader
- rss 주소가 인풋으로 넘어오면
- rss API 를 통해 XML 을 얻어온다.
- XML 로 부터 블로그 엔티티(제목, 썸네일, 부제목, ..etc)를 뽑아낸다.

> **고민해야할 사항**
> - blog 서비스 마다 XML 구조가 어떻게 되는지 파악하기
> - blogType groupby COUNT 해서 가장 많은 상위 블로그타입 3개만 지원하는 형식으로 하기 

### get-new-blogs
- 해당 유저의 blog 내역과 rss-reader 가 넘겨준 Blog[] 와 
- blog 테이블에서 유저의 글을 읽어들여서 비교하는 로직 작성
- 다른 내용의 것만 (새롭게 쓰여진 글들) filter 하기
 
> **고민해야할 사항**
> - 현재 가진 글의 정보로 어떻게 unique 함을 보장할 것인가
> - 각 블로그 서비스마다 link 가 바뀌어도 thumbnail 은 동일한가? 
> - 유사도 알고리즘을 써야하나?
> - 간단하게 link 가 다른 것만 추려내는 것도.. 서비를 위한 시작일지도

```sql
-- auto-generated definition
create table blog
(
    id           int auto_increment
        primary key,
    title        varchar(255)                             not null,
    subtitle     varchar(255)                             null,
    link         varchar(2000)                            not null,
    thumbnail    varchar(2000)                            null,
    written_date date                                     not null,
    created_at   datetime(6) default CURRENT_TIMESTAMP(6) not null,
    updated_at   datetime(6) default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6),
    deleted_at   datetime                                 null,
    user_id      int                                      not null
)
    collate = utf8mb4_unicode_ci;

create index idx_user_id
    on blog (user_id);
```

### save-new-blogs
- 해당 유저별로 새롭게 쓰여진 글 Blog[] 저장하기
- `INSERT INTO blog (...) values(...)`