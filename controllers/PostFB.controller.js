const PostFB = require("../model/PostFB");
const axios = require("axios");
const cron = require("node-cron");
let accessToken = "";
let postUrl = "";
async function getPostLikes(postUrl, accessToken) {
  try {
    const postId = extractPostIdFromUrl(postUrl);
    const apiUrl = `https://graph.facebook.com/v12.0/${postId}?fields=name,likes.summary(total_count),comments.summary(total_count).filter(stream).limit(0)&access_token=${accessToken}`;

    const response = await axios.get(apiUrl);

    // const comments = response.data.comments.data.map((comment) => ({
    //   message: comment.message,
    // }));

    const result = {
      postUrl,
      name: response.data.name,
      likes: response.data.likes.summary.total_count,
      comments: response.data.comments.summary.total_count,
      //   commentsData: comments,
    };

    return result;
  } catch (error) {
    throw new Error(`Lỗi khi lấy số lượt like: ${error.message}`);
  }
}

function extractPostIdFromUrl(url) {
  const queryString = url.split("?")[1];
  const params = new URLSearchParams(queryString);

  return params.get("fbid");
}

cron.schedule("*/10 * * * * *", async () => {
  try {
    if (!accessToken || !postUrl) {
      console.log("accessToken & postUrl chưa được cung cấp");
      return;
    }

    const result = await getPostLikes(postUrl, accessToken);

    let existingPost = await PostFB.findOne({ postUrl });

    if (existingPost) {
      existingPost.set(result);
      await existingPost.save();

      console.log("Dữ liệu đã được update trong mongoDB");
    } else {
      const post = new PostFB(result);
      await post.save();

      console.log("Một bài viết mới đã thêm vào MongoDB");
    }
  } catch (error) {
    console.error("Thất bại", error);
  }
});

const postFBController = {
  getLikeAndCmt: async (req, res) => {
    try {
      const accessToken = req.body.accessToken;
      const postUrl = req.body.postUrl;

      const result = await getPostLikes(postUrl, accessToken);

      const existingPost = await PostFB.findOne({ postUrl });

      if (existingPost) {
        existingPost.name = result.name;
        existingPost.likes = result.likes;
        existingPost.comments = result.comments;
        // existingPost.commentsData = result.commentsData;
        await existingPost.save();

        res.json(result);
      } else {
        const post = new PostFB(result);

        await post.save();

        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  autoUpdatePost: async (req, res) => {
    try {
      accessToken = req.body.accessToken;
      postUrl = req.body.postUrl;

      res.json({ success: true, msg: "Đã cung cấp accessToken & postUrl" });
    } catch (error) {
      console.error("Thất bại:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = postFBController;
