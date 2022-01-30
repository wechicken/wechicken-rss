const UserRepository = require('./user.repository');

class UserService {

  constructor({ db }) {
    this.userRespository = new UserRepository({ db });
  }

  getUserCount() {
    return this.userRespository.count();
  }

  getUsers({ limit, offset }) {
    return this.userRespository.findList({ limit, offset });
  };

  getTestUsers() {
    return this.userRespository.findTestList();
  }

}

module.exports = UserService;