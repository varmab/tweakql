const express = require("express")
const graphqlHTTP = require("express-graphql")
const gql = require("graphql")
const makeExecutableSchema = require("graphql-tools").makeExecutableSchema
const cors = require("cors")
const serverless = require("serverless-http")
const path = require("path")
const bodyParser = require("body-parser")

const typeDefs = require("../graphql/typedefs")
const resolvers = require("../graphql/resolvers")
const app = express()
const schema = makeExecutableSchema({ typeDefs, resolvers })

const router = express.Router()
router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" })
  res.write("<h1>Hello from Tweak Videos!</h1>")
  res.end()
})

app.use(bodyParser.json())
app.use("/.netlify/functions/server", router) // path must route to lambda
app.use("/", (req, res) => res.sendFile(path.join(__dirname, "../index.html")))
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
