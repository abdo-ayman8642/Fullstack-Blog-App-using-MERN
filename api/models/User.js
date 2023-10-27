const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, min: 4, unique: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password: { type: String, required: true },
  resetCode: { type: String },
  resetCodeExpiration: { type: Date },
});

// Define a unique index on the username field
UserSchema.index({ username: 1 }, { unique: true });

const UserModel = model("User", UserSchema);

module.exports = UserModel;
