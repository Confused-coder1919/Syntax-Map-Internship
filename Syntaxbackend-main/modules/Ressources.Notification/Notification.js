class Notification {
  #notification_id;
  #user_id;
  #message;
  #type;
  #created_at;
  #is_read;

  constructor(notification, dbRow, bodyJson) {
    if (notification) {
      this.#notification_id = notification.notification_id;
      this.#user_id = notification.user_id;
      this.#message = notification.message;
      this.#type = notification.type;
      this.#created_at = notification.created_at;
      this.#is_read = notification.is_read;
    } else if (dbRow) {
      this.#notification_id = dbRow.notification_id;
      this.#user_id = dbRow.user_id;
      this.#message = dbRow.message;
      this.#type = dbRow.type;
      this.#created_at = dbRow.created_at;
      this.#is_read = dbRow.is_read;
    } else if (bodyJson) {
      this.#notification_id = bodyJson.notification_id;
      this.#user_id = bodyJson.user_id;
      this.#message = bodyJson.message;
      this.#type = bodyJson.type;
      this.#created_at = bodyJson.created_at || new Date();
      this.#is_read = bodyJson.is_read || false;
    } else {
      this.#notification_id = null;
      this.#user_id = null;
      this.#message = null;
      this.#type = null;
      this.#created_at = null;
      this.#is_read = false;
    }
  }

  toObject() {
    return {
      notification_id: this.#notification_id,
      user_id: this.#user_id,
      message: this.#message,
      type: this.#type,
      created_at: this.#created_at,
      is_read: this.#is_read
    };
  }

  get notification_id() { return this.#notification_id; }
  get user_id() { return this.#user_id; }
  get message() { return this.#message; }
  get type() { return this.#type; }
  get created_at() { return this.#created_at; }
  get is_read() { return this.#is_read; }

  set notification_id(notification_id) { this.#notification_id = notification_id; }
  set user_id(user_id) { this.#user_id = user_id; }
  set message(message) { this.#message = message; }
  set type(type) { this.#type = type; }
  set created_at(created_at) { this.#created_at = created_at; }
  set is_read(is_read) { this.#is_read = is_read; }
}

module.exports = Notification;