import { Company, Job } from './db.js';

function rejectIf(condition) {
  if (condition) {
    throw new Error('Unauthroized');
  }
}
export const resolvers = {
  Query: {
    job: (_root, { id }) => Job.findById(id),
    //root is the parent object, we don't use it,
    //that's why we prefix it with an underscore
    jobs: async () => Job.findAll(),
    company: (_root, { id }) => Company.findById(id),
  },

  //We want a to include a jobs object nested inside
  // the resolvers object for "company: (_root, { id }) => Company.findById(id)"
  Company: {
    jobs: (company) => Job.findAll((job) => job.companyId === company.id),
  },
  // We implement the Job to Company association
  // We write a resolver function for the company field
  // inside the Job object on schema.graphql
  //   type Job {
  //   id: ID!
  //   title: String!
  //   company: Company! <-- Company field inside Job object
  //   description: String
  // }

  Job: {
    //Job is the query object
    company: (job) => Company.findById(job.companyId),
  },

  Mutation: {
    //_root object will be mutation which is a top-level type
    //We destructure the context and obtain the auth field set on
    // the expresss server
    createJob: (_root, { input }, { user }) => {
      if (!user) {
        throw new Error('Unauthroized');
      }
      console.log('[createJob] user', user);
      // Return a promise
      return Job.create({ ...input, companyId: user.companyId });
    },
    deleteJob: async (_root, { id }, { user }) => {
      //Check user is authenticated and Job bleongs to their company
      rejectIf(!user);
      console.log('[createJob] user', user);
      const job = await Job.findById(id);
      rejectIf(job.companyId !== user.companyId);

      // Return a promise
      return Job.delete(id);
    },
    updateJob: async (_root, { input }, { user }) => {
      rejectIf(!user);
      console.log('[updateJob] user', user);
      const job = await Job.findById(input.id);
      console.log('[updateJob] Job', job);
      // rejectIf(job.companyId !== user.companyId);

      // Return a promise
      return Job.update({ ...input, companyId: user.companyId });
    },
  },
};
