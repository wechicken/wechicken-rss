const UserRepository = require('./user.repository');

class UserService {

  constructor({ knex }) {
    this.userRespository = new UserRepository({ knex });
  }

  getUserCount() {
    return this.userRespository.count();
  }


  getUsers({ limit, offset }) {
    return this.userRespository.findList({ limit, offset });
  };

}

module.exports = UserService;