const express = require('express');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql');
const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const cors = require('cors');

const typeDefs=require('./graphql/typedefs')
const resolvers=require('./graphql/resolvers')

const port = process.env.PORT || 3002;
const app = express();
const schema = makeExecutableSchema({ typeDefs, resolvers });

app.use(
  '/graphql',
  cors(),
  graphqlHTTP({
    schema,
    graphiql: true
  })
);

app.listen(port);
console.log(`GraphiQL is now running on http://localhost:${port}/graphql`);