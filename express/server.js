const express = require("express")
const graphqlHTTP = require("express-graphql")
const gql = require("graphql")
const makeExecutableSchema = require("graphql-tools").makeExecutableSchema
const cors = require("cors")
const serverless = require("serverless-http")

const typeDefs = require("../graphql/typedefs")
const resolvers = require("../graphql/resolvers")
const app = express()
const schema = makeExecutableSchema({ typeDefs, resolvers })

app.use(
  "/graphql",
  cors(),
  graphqlHTTP({
    schema,
    graphiql: true
  })
)

module.exports = app
module.exports.handler = serverless(app)
