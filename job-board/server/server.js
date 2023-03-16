import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloExpress } from '@apollo/server/express4';

import cors from 'cors';
import express from 'express';
import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';
import { User } from './db.js';
import { readFile } from 'fs/promises';
import { resolvers } from './resolvers.js';

const PORT = 9000;
const JWT_SECRET = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');

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
  const { email, password } = req.body;
  const user = await User.findOne((user) => user.email === email);
  if (user && user.password === password) {
    const token = jwt.sign({ sub: user.id }, JWT_SECRET);
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

// Set up Apollo Server
const typeDefs = await readFile('./schema.graphql', 'utf-8');
const context = async ({ req }) => {
  //auth { sub: 'uogQAZnLcAlT6lMuNbpQg', iat: 1678331412 }
  if (req.auth) {
    const user = await User.findById(req.auth.sub);
    console.log('[serverJS user]: ', user);
    return { user };
  }
  console.log('[serverJS no req.auth]');
  return {};
};
const apolloServer = new ApolloServer({ typeDefs, resolvers });
await apolloServer.start();
//Plug apollo server into our Express application
//Any http request sent to graphql will be re-routed by the Express framework to the graph QL server
//Apollo 3
//apolloServer.applyMiddleware({ app, path: '/graphql' });
//Apollo 4
app.use('/graphql', apolloExpress(apolloServer, { context: context }));

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint : http://localhost:${PORT}/graphql`);
});
