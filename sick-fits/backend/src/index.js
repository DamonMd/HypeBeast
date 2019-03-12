require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const server = createServer();

server.express.use(cookieParser());

// decode the JWT so we can get the UserID on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  console.log("token", token);
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // attach the userId to the req for other requests to access
    req.userId = userId;
  }
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(`Server is now running on port ${deets.port}`);
  }
);
