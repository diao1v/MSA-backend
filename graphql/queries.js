const { GraphQLList, GraphQLID } = require("graphql");
const { UserType, PostType } = require("./types");
const { User, Post } = require("../database-model");

const users = {
  type: new GraphQLList(UserType),
  description: "Retrieves list of users",
  resolve(parent, args) {
    return User.find();
  },
};

const user = {
  type: UserType,
  description: "Retrieves one user",
  args: { id: { type: GraphQLID } },
  resolve(parent, args) {
    return User.findById(args.id);
  },
};

const posts = {
  type: new GraphQLList(PostType),
  description: "Retrieves list of posts",
  resolve(parent, args) {
    return Post.find();
  },
};

const post = {
  type: PostType,
  description: "Retrieves one post",
  args: { id: { type: GraphQLID } },
  resolve(parent, args) {
    return Post.findById(args.id);
  },
};

module.exports = {
  users,
  user,
  posts,
  post,
};
