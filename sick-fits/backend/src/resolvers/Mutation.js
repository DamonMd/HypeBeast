const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");

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
    const item = await context.db.query.item({ where }, `{id title}`);
    // check user auth
    // delete it
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
  }
};

module.exports = Mutations;
