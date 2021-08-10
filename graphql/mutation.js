const { GraphQLString } = require("graphql");

const { PostType, UserType, CommentType } = require("./types");
const { User, Post, Comment } = require("../database-model");

const { createJwtToken } = require("../util/jwt-auth");

const register = {
  type: GraphQLString,
  description: "register user",
  args: {
    username: { type: GraphQLString },
    access_token: { type: GraphQLString },
    avatar_url: { type: GraphQLString },
  },
  async resolve(parent, args) {
    const { username, access_token, avatar_url } = args;
    const user = new User({ username, access_token, avatar_url });

    await user.save();
    const token = createJwtToken(user);
    return token;
  },
};

const login = {
  type: GraphQLString,
  description: "login user",
  args: {
    access_token: { type: GraphQLString },
  },
  async resolve(parent, args) {
    const user = await User.findOne({ access_token: args.access_token });
    if (!user) {
      throw new Error("User is not exist");
    }

    const token = createJwtToken(user);
    return token;
  },
};

const addPost = {
  type: PostType,
  description: "create a new post",
  args: {
    title: { type: GraphQLString },
    youtube_uri: { type: GraphQLString },
  },
  resolve(parent, args, { verifiedUser }) {
    //console.log("Verified User: ", verifiedUser);
    if (!verifiedUser) {
      throw new Error("Unauthenticated");
    }
    const post = new Post({
      authorId: verifiedUser._id,
      title: args.title,
      youtube_uri: args.youtube_uri,
    });
    return post.save();
  },
};

const updatePost = {
  type: PostType,
  description: "update a post, only the author can update it",
  args: {
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    youtube_uri: { type: GraphQLString },
  },
  async resolve(parent, args, { verifiedUser }) {
    if (!verifiedUser) {
      throw new Error("Unauthenticated");
    }

    const postUpdated = await Post.findOneAndUpdate(
      {
        _id: args.id,
        authorId: verifiedUser._id,
      },
      {
        title: args.title,
        youtube_uri: args.youtube_uri,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!postUpdated) {
      throw new Error("No post with the give ID found for the author");
    }

    return postUpdated;
  },
};

const deletePost = {
  type: GraphQLString,
  description: "delete post",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, { verifiedUser }) {
    if (!verifiedUser) {
      throw new Error("Unauthenticated");
    }

    const postDeleted = await Post.findOneAndDelete({
      _id: args.id,
      authorId: verifiedUser._id,
    });

    if (!postDeleted) {
      throw new Error("No post with the give ID found for the author");
    }

    return "Post deleted";
  },
};

const addComment = {
  type: CommentType,
  description: "create a new comment on the post",
  args: {
    comment: { type: GraphQLString },
    postId: { type: GraphQLString },
  },
  resolve(parent, args, { verifiedUser }) {
    if (!verifiedUser) {
      throw new Error("Unauthenticated");
    }
    const comment = new Comment({
      userId: verifiedUser._id,
      postId: args.postId,
      comment: args.comment,
    });
    return comment.save();
  },
};

const updateComment = {
  type: CommentType,
  description: "update a comment, only the author can update it",
  args: {
    id: { type: GraphQLString },
    comment: { type: GraphQLString },
  },
  async resolve(parent, args, { verifiedUser }) {
    if (!verifiedUser) {
      throw new Error("Unauthenticated");
    }

    const commentUpdated = await Comment.findOneAndUpdate(
      {
        _id: args.id,
        userId: verifiedUser._id,
      },
      {
        comment: args.comment,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!commentUpdated) {
      throw new Error("No comment with the give ID found for the author");
    }

    return commentUpdated;
  },
};

const deleteComment = {
  type: GraphQLString,
  description: "delete comment",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, { verifiedUser }) {
    if (!verifiedUser) {
      throw new Error("Unauthenticated");
    }

    const commentDeleted = await Comment.findOneAndDelete({
      _id: args.id,
      userId: verifiedUser._id,
    });

    if (!commentDeleted) {
      throw new Error("No post with the give ID found for the author");
    }

    return "Comment deleted";
  },
};

module.exports = {
  register,
  login,
  addPost,
  addComment,
  updatePost,
  deletePost,
  updateComment,
  deleteComment,
};
