const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  //   async items(parent, args, context, info) {
  //     const items = await context.db.query.items();
  //     return items;
  //   }
  me(parent, args, context, info) {
    // check if there is a current user
    if (!context.request.userId) {
      return null;
    }
    return context.db.query.user(
      { where: { id: context.request.userId } },
      info
    );
  },
  async users(parent, args, context, info) {
    // 1. see if there is a user logged in
    if (!context.request.userId) {
      throw new Error("Must be logged in");
    }
    // 2. return the users
    hasPermission(context.request.user, ["ADMIN", "PERMISSIONUPDATE"]);
    // 3. return the users
    return context.db.query.users({}, info);
  }
};

module.exports = Query;
