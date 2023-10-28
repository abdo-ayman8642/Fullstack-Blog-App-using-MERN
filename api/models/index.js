const UserSchema = require("./User");
const PostSchema = require("./Post");
const mongoose = require("mongoose");
const { model } = mongoose;

const UserModel = model("User", UserSchema);
const PostModel = model("Post", PostSchema);

module.exports = {
  User: UserModel,
  Post: PostModel,
};
