class Checker {
  constructor(acc, kw, et) {
    this._account = acc;
    this._keywords = kw;
    this._eventname = et;
    this._last_id = "";
  }

  get account() {
    return this._account;
  }
  get keywords() {
    return this._keywords;
  }
  get eventname() {
    return this._eventname;
  }
  get last_id() {
    return this._last_id;
  }
  set last_id(id) {
    this._last_id = id;
  }
}

module.exports = Checker;