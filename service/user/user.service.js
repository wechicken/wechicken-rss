const UserRepository = require('./user.repository');

class UserService {

  constructor({ db }) {
    this.userRespository = new UserRepository({ db });
  }

  getUserCount() {
    return this.userRespository.count();
  }

  getUsers() {
    return this.userRespository.findList();
  };

  getTestUsers() {
    return this.userRespository.findTestList();
  }

}

module.exports = UserService;