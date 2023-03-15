import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import { expressjwt } from 'express-jwt';
import { readFile } from 'fs/promises';
import jwt from 'jsonwebtoken';
import { User } from './db.js';
import { resolvers } from './resolvers.js';
import { createServer as createHttpServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocket, WebSocketServer } from 'ws';
import { useServer as useWsServer } from 'graphql-ws/lib/use/ws';

const PORT = 9000;
const JWT_SECRET = Buffer.from('+Z3zPGXY7v/0MoMm1p8QuHDGGVrhELGd', 'base64');

const app = express();
app.use(
  cors(),
  express.json(),
  expressjwt({
    algorithms: ['HS256'],
    credentialsRequired: false,
    secret: JWT_SECRET,
  })
);

app.post('/login', async (req, res) => {
  const { userId, password } = req.body;
  console.log(`Login hit for: ${userId} + ${password}`);
  const user = await User.findOne((user) => user.id === userId);
  if (user && user.password === password) {
    const token = jwt.sign({ sub: user.id }, JWT_SECRET);
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

function getHttpContext({ req }) {
  if (req.auth) {
    return { userId: req.auth.sub };
  }
  return {};
}

function getWsContext({ connectionParams }) {
  //We use the optional chaining operator in case connection params is undefined
  const token = connectionParams?.accessToken;
  if (token) {
    //we decode the token manually
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('token Payload', payload);
    return { userId: payload.sub };
  }
  //If there is no token we return an empty object
  return {};
}
const httpServer = createHttpServer(app);
//Extend our http server to accept websocket connections
const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

const typeDefs = await readFile('./schema.graphql', 'utf8');
const schema = makeExecutableSchema({ typeDefs, resolvers });
//Adds the graphQL functionality on top of the web socket protocol
useWsServer({ schema, context: getWsContext }, wsServer);

const apolloServer = new ApolloServer({
  schema,
  context: getHttpContext,
});
await apolloServer.start();
apolloServer.applyMiddleware({ app, path: '/graphql' });

httpServer.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
