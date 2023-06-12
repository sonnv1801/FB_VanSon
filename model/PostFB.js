const mongoose = require("mongoose");

const PostFBSchema = new mongoose.Schema({
  postUrl: {
    type: String,
    unique: true,
  },
  name: String,
  likes: Number,
  comments: Number,
  //   commentsData: [
  //     {
  //       message: String,
  //     },
  //   ],
});

module.exports = mongoose.model("Post", PostFBSchema);
