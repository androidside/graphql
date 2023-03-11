import { Message } from './db.js';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

function rejectIf(condition) {
  if (condition) {
    throw new Error('Unauthorized');
  }
}

export const resolvers = {
  Query: {
    messages: (_root, _args, { userId }) => {
      rejectIf(!userId);
      return Message.findAll();
    },
  },

  Mutation: {
    addMessage: async (_root, { input }, { userId }) => {
      rejectIf(!userId);
      const message = await Message.create({ from: userId, text: input.text });
      // messageAdded is the subscription field we declared in the schema
      pubSub.publish('MESSAGE_ADDED', { messageAdded: message });
      return message;
    },
  },
  Subscription: {
    messageAdded: {
      //Trigger = string that identifies a certain event.
      //This subscription will emit a new value whenever a
      // message is added to the chat
      subscribe: () => pubSub.asyncIterator('MESSAGE_ADDED'),
    },
  },
};
