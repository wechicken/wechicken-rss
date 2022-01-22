const UserService = require('./service/user/user.service');
const knexPool = require('knex');

const app = async () => {
  let knex;

  try {
    knex = knexPool(
      {
        client: 'mysql2',
        debug: true,
        connection: {
          host: 'localhost',
          port: 3307,
          user: 'root',
          password: 'password',
          database: 'wechicken',
        },
      });

    const userService = new UserService({ knex });
    const userCount = await userService.getUserCount();

    const userBlogs = await userService.getUsers({ limit: 30, offset: 0 });
    console.log(userCount);
    console.log(userBlogs);

  } catch (e) {
    console.log(e);
  } finally {
    knex.destroy();
  }
};

app();