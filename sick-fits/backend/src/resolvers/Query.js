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
  },
  async order(parent, args, context, info) {
    // 1. Make sure they are logged in
    const { userId } = context.request;
    if (!userId) {
      throw new Error("You must be logged in");
    }
    // 2. query current order
    const order = await context.db.query.order(
      {
        where: { id: args.id }
      },
      info
    );
    // 3. check if they have permissions to see the order
    const ownsOrder = order.user.id === userId;
    const hasPermission = context.request.user.permissions.includes("ADMIN");
    if (!ownsOrder || !hasPermission) {
      throw new Error("this aint yo order!!!!!!");
    }
    // 4. return the order
    return order;
  },
  async orders(parent, args, context, info) {
    const { userId } = context.request;
    if (!userId) {
      throw new Error("You must be logged in");
    }
    // const hasPermission = context.request.user.permissions.includes("ADMIN");
    // if (!hasPermission) {
    //   throw new Error("you don't have permission, bruh!!!!!!");
    // }
    const orders = await context.db.query.orders(
      {
        where: {
          user: {
            id: userId
          }
        }
      },
      info
    );
    return orders;
  }
};

module.exports = Query;
