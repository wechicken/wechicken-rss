class UserRepository {
  constructor({ knex }) {
    this.knex = knex;
  }

  count() {
    return this.knex
    .count('id', { as: 'cnt' })
    .from('user');
  }

  findList({ limit, offset }) {
    return this.knex
    .column(['id', 'blog_address', 'blog_type_id'])
    .select()
    .from('user')
    .limit(limit)
    .offset(offset);
  }
}

module.exports = UserRepository;