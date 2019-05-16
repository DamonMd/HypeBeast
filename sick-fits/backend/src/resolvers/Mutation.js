const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");
const { hasPermission } = require("../utils");
const stripe = require("../stripe");

const Mutations = {
  //TODO: check if they are logged in

  async createItem(parent, args, context, info) {
    if (!context.request.userId) {
      throw new Error("must be logged in to create an item");
    }
    const item = await context.db.mutation.createItem(
      {
        data: {
          // This is how to create a relationship between the Item and the User
          user: {
            connect: {
              id: context.request.userId
            }
          },
          ...args
        }
      },
      info
    );
    console.log("new item", item);
    return item;
  },
  async updateItem(parent, args, context, info) {
    // get a copy of the args
    const updates = { ...args };
    // remove id from updates since we don't need to update that
    delete updates.id;
    // run the update method
    const item = await context.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
    return item;
  },
  async deleteItem(parent, args, context, info) {
    const where = { id: args.id };
    // find the item
    const item = await context.db.query.item({ where }, `{id title user{id}}`);
    // check user auth with owner status or permission status
    const owner = item.user.id === context.request.userId;
    const hasPermissions = ["ADMIN", "ITEMDELETE"].some(p =>
      context.request.user.permissions.includes(p)
    );
    // delete it
    if (!owner && !hasPermissions) {
      throw new Error("Not authorized to delete this item");
    }
    return context.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, context, info) {
    // normalize email
    args.email = args.email.toLowerCase();
    // encrypt password
    const password = await bcrypt.hash(args.password, 10);
    // create passing args, createUser comes from prisma.graphql file
    const user = await context.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    //createJWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // SET THE JWT AS A COOKIE ON THE RESPONSE
    context.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });
    // return user to the browser
    return user;
  },
  async signin(parent, { email, password }, context, info) {
    //1. get user based on email
    const user = await context.db.query.user({
      where: { email: email.toLowerCase() }
    });
    //2. if not email found return
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    //3. if email is good, check hashed password against stored password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid Password");
    }
    //4. Generate jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //5. set the cookie with the token
    context.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    //6. return the user
    return user;
  },
  signout(parent, args, context, info) {
    context.response.clearCookie("token");
    return { message: "Goodbye" };
  },
  async requestReset(parent, { email }, context, info) {
    // 1. check if this user exists
    const user = await context.db.query.user({
      where: { email: email.toLowerCase() }
    });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. Set a reset token and expiry on that user
    const randomBytesPromise = promisify(randomBytes);
    const resetToken = (await randomBytesPromise(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // token expires after one hour
    const response = await context.db.mutation.updateUser({
      where: { email: email.toLowerCase() },
      data: { resetToken, resetTokenExpiry }
    });
    // 3. Email the user the reset token
    const mailRes = await transport.sendMail({
      from: "hypebeasty@sprinkles.com",
      to: user.email,
      subject: "Your Password Reset Token",
      html: makeANiceEmail(
        `Your password reset token is here \n\n <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Click Here</a>`
      )
    });
    return { message: "Thanks!" };
  },
  async resetPassword(
    parent,
    { password, confirmPassword, resetToken },
    context,
    info
  ) {
    // 1. check if passwords are the same
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
    // 2. check if it is a legit reset token
    // 3. check if its expired
    // using the users and destructered array since resetToken isn't technically unique
    const [user] = await context.db.query.users({
      where: {
        resetToken: resetToken
        // need to update logic below as it doesnt work. expiry will never be greater
        // MAYBE DO JUST DATE.NOW?
        // resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error("Not a valid token");
    }

    // 4. hash their new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. save the new password and remove old reset token fields
    const updatedUser = await context.db.mutation.updateUser({
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      },
      where: { email: user.email }
    });
    // 6. Generate JWT cookie
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 7. Set the JWT cookie
    context.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });
    // 8. return the new user
    return updatedUser;
  },
  async updatePermissions(parent, args, context, info) {
    // 1. see if user is signed in
    if (!context.request.userId) {
      throw new Error("Must be signed in!");
    }
    // 2. retrieve user from db
    const user = await context.db.query.user(
      {
        where: { id: context.request.userId }
      },
      info
    );
    // 3. see if user has appropriate permissions
    hasPermission(user, ["ADMIN", "PERMISSIONUPDATE"]);
    // 4. update user in db
    return context.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    );
  },
  async addToCart(parent, args, context, info) {
    const { userId } = context.request;
    if (!userId) {
      throw new Error("Gotta Sign In!!!");
    }
    // Query users current cart
    // using the generated by prisma query for all items since it is more
    // flexible than the single item query, destructering the first item since it'll only
    // fine one item with that specific user id and item id
    const [existingCartItem] = await context.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    });
    // check if item is already in the cart
    // increment by one if it is
    if (existingCartItem) {
      console.log("item already exists");
      return context.db.mutation.updateCartItem(
        {
          where: {
            id: existingCartItem.id
          },
          data: {
            quantity: existingCartItem.quantity + 1
          }
        },
        info
      );
    }
    // if not, create fresh cart item for user
    return context.db.mutation.createCartItem(
      {
        data: {
          //since a cart item is really just a connection to an already created item
          //and a user, use the connect syntax from prisma
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    );
  },
  async removeFromCart(parent, args, context, info) {
    // 1. Find the Cart Item
    const item = await context.db.query.cartItem(
      {
        where: {
          id: args.id
        }
      },
      `{id, user {id}}`
    );
    const [existingCartItem] = await context.db.query.cartItems({
      where: {
        user: { id: context.request.userId },
        item: { id: args.id }
      }
    });

    if (!item) throw new Error("no item found!");
    // 2. Make sure they own it
    if (context.request.userId !== item.user.id) {
      throw new Error("doesn't belong to you");
    }
    // 3. Delete that item
    return context.db.mutation.deleteCartItem(
      {
        where: { id: args.id }
      },
      info
    );
  },
  async createOrder(parent, args, context, info) {
    // 1. Query current user and make sure they are signed in
    const { userId } = context.request;
    if (!userId) throw new Error("You must be signed in");
    // 2. recalculate total as you cant rely on front end display price
    const user = await context.db.query.user(
      { where: { id: userId } },
      `
      {
      id
      name 
      email
      cart{
        id
        quantity
        item{
          title
          price
          id
          description
          image
          largeImage
        }
      }
    }
      `
    );
    const amount = user.cart.reduce((total, cartItem) => {
      return total + cartItem.quantity * cartItem.item.price;
    }, 0);
    console.log("going to charge a total of", amount);
    // 3. create stripe Charge (turn token into straight cash homey)
    const charge = await stripe.charges.create({
      amount: amount,
      currency: "USD",
      source: args.token
    });
    // 4. convert Cart Items to order items
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } }
      };
      //don't want the id of the order item to be that of the cartItem.item so we delete
      delete orderItem.id;
      return orderItem;
    });
    // 5. create the order
    const order = await context.db.mutation
      .createOrder({
        data: {
          charge: charge.id,
          total: charge.amount,
          // while creating the order, prisma will also create the order items with the create syntax
          items: { create: orderItems },
          user: { connect: { id: userId } }
        }
      })
      .catch(err => {
        throw new Error("error in processing order at this time");
      });
    // 6. clean up - clear the users cart after payment, delete cart items
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await context.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds
      }
    });
    // 7. return the order to the client
    return order;
  }
};

module.exports = Mutations;
