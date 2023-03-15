import { Message } from './db.js';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

function rejectIf(condition) {
  if (condition) {
    console('Rejecting user');
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
      console.log('addMessage: MESSAGE_ADDED', message);
      pubSub.publish('MESSAGE_ADDED', { messageAdded: message });
      return message;
    },
  },
  Subscription: {
    messageAdded: {
      //Trigger = string that identifies a certain event.
      //This subscription will emit a new value whenever a
      // message is added to the chat
      //An iterator is something that can return multiple values and you can iterate over
      // An iterator is Like a foor loop.
      //This subscriber will emit a new value whenever a new message is added to the chat
      //To submit values we need to trigger the MESSAGE_ADDED event, we do that in the mutation on top
      subscribe: (_root, _args, { userId }) => {
        rejectIf(!userId);
        console.log('[subscribe] userId', userId);
        return pubSub.asyncIterator('MESSAGE_ADDED');
      },
    },
  },
};
