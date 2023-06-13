
export default class User {
  constructor(userData) {
    this.id = userData.id;
    this.firstName = userData.firstname;
    this.lastName = userData.lastname;
    this.date_created = userData.created_at;
  }
}