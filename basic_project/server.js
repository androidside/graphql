import { ApolloError, ApolloServer, gql } from 'apollo-server';

// TYPE DEFS === Interface of our API

//We always need this query type that contains all the possible
//queries that can be made by the client when calling the server
//The string is passed to an object that represents an schema
const typeDefs = gql`
  type Query {
    greeting: String
  }
`;

console.log(typeDefs);

// RESOLVERS === Implementation

//Implementation to specify how the server returns a greeting value
//Resolvers object needs to match the structure of the typeDefinitions
//This function will be called by the Graph QL engine everytime a client sends a greeting Query
//This function resolves the value of the greeting field
//Needs to mirror the type definition
const resolvers = {
  Query: {
    greeting: () => 'Hello World', //or we could get it from a database
  },
};

// Create our Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await server.listen({ port: 9000 });
console.log(`Server running at ${url}`);

//Run with
// node server.js
