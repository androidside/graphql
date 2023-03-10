import { ApolloClient, gql, InMemoryCache } from '@apollo/client';

const GRAPHQL_URL = 'http://localhost:9000/graphql';

//Feeds into ApolloProvider to make it available throughout the app
export const client = new ApolloClient({
  uri: GRAPHQL_URL,
  cache: new InMemoryCache(),
  //If we want to change the default policy for all queries
  // defaultOptions: {
  //   query: {
  //     fetchPolicy: 'network-only',
  //   },
  //   mutate: {
  //     fetchPolicy: 'network-only',
  //   },
  //   watchQuery: {
  //     fetchPolicy: 'network-only',
  //   },
  // },
});

const JOB_DETAIL_FRAGMENT = gql`
  fragment JobDetail on Job {
    id
    title
    company {
      id
      name
    }
    description
  }
`;

export const COMPANY_QUERY = gql`
  query CompanyQuery($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        title
      }
    }
  }
`;

export const JOB_QUERY = gql`
  query JobQuery($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${JOB_DETAIL_FRAGMENT}
`;

export const JOBS_QUERY = gql`
  query {
    jobs {
      id
      title
      company {
        id
        name
      }
    }
  }
`;
// export async function getJobs() {
//   const {
//     data: { jobs },
//   } = await client.query({ query: JOBS_QUERY, fetchPolicy: 'network-only' });
//   return jobs;
//   // const { jobs } = await request(GRAPHQL_URL, query);
//   // return jobs;
// }

// export async function getJob(id) {
//   const variables = { id };
//   const {
//     data: { job },
//   } = await client.query({ query: JOB_QUERY, variables });
//   return job;
// }

export async function getCompany(id) {
  const query = gql`
    query CompanyQuery($id: ID!) {
      company(id: $id) {
        id
        name
        description
        jobs {
          id
          title
        }
      }
    }
  `;
  const variables = { id };
  const {
    data: { company },
  } = await client.query({ query, variables });
  return company;
}

export const CREATE_JOB_MUTATION = gql`
  mutation CreateJobMutation($input: CreateJobInput!) {
    #We create an alias job, bc creatJob is a confusing name
    job: createJob(input: $input) {
      #We request all the job data we need so we add it to the cache
      ...JobDetail
    }
  }
  ${JOB_DETAIL_FRAGMENT}
`;

//OLD, see JobForm.js and how we use the mutation Hook

// export async function createJob(input) {
//   const mutation = gql`
//     mutation CreateJobMutation($input: CreateJobInput!) {
//       #We create an alias job, bc creatJob is a confusing name
//       job: createJob(input: $input) {
//         #We request all the job data we need so we add it to the cache
//         ...JobDetail
//       }
//     }
//     ${JOB_DETAIL_FRAGMENT}
//   `;
//   //Now we include the authentication token on each request
//   //This context is to configure the HTTP Request set by the client
//   const context = { headers: { Authorization: 'Bearer ' + getAccessToken() } };
//   const variables = { input };
//   const {
//     data: { job },
//   } = await client.mutate({
//     mutation,
//     variables,
//     context,
//     // First argument is cache object
//     //Second argument is the result from the mutation
//     update: (cache, { data: { job } }) => {
//       console.log(`[CreateJob job`, job);
//       cache.writeQuery({
//         query: JOB_QUERY,
//         variables: { id: job.id },
//         data: { job },
//       });
//     },
//   });
//   return job;
// }
