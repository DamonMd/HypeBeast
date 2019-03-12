// This file connects to the remote prisma DB and gives us the ability to query
// with js
const { Prisma } = require("prisma-binding");

//debug when true will consolelog all the queries so turn on or off whenever
const db = new Prisma({
  typeDefs: "src/generated/prisma.graphql",
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  debug: false
});

module.exports = db;
