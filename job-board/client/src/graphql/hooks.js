import { useQuery } from '@apollo/client';
import { JOB_QUERY, JOBS_QUERY, COMPANY_QUERY } from '../graphql/queries';
import { useMutation } from '@apollo/client';
import { CREATE_JOB_MUTATION } from '../graphql/queries';
import { getAccessToken } from '../auth';

//Section 7 of the Videos
export function useCompany(id) {
  const { data, loading, error } = useQuery(COMPANY_QUERY, {
    variables: { id },
  });
  return { company: data?.company, loading, error: Boolean(error) };
}

//Video 49
export function useJobCreate(job) {
  const [mutate, { loading, error }] = useMutation(CREATE_JOB_MUTATION);
  return {
    //We return a function that we can call whenever we want to mutate an object
    createJob: async (title, description) => {
      const {
        data: { job },
      } = await mutate({
        //What we want to modify
        // This matches the CreateJobInput on the server!
        variables: { input: { title, description } },
        //Auth Token required to only modify jobs from our company
        context: { headers: { Authorization: 'Bearer ' + getAccessToken() } },
        //function from useMutation (available through apollo server) that
        //allow us to update the cache and avoid a 2nd request
        update: (cache, { data: { job } }) => {
          console.log(`[CreateJob job`, job);
          cache.writeQuery({
            //We use Job Query defined in queries.js
            query: JOB_QUERY,
            //We need it for the Cache data object
            variables: { id: job.id },
            data: { job },
          });
        },
      });
      return job;
    },
    loading,
    error: Boolean(error),
  };
}

export function useJob(id) {
  const { data, loading, error } = useQuery(JOB_QUERY, {
    variables: { id },
  });
  return { job: data?.job, loading, error: Boolean(error) };
}

export function useJobs() {
  const { data, loading, error } = useQuery(JOBS_QUERY, {
    fetchPolicy: 'network-only',
  });
  return {
    //Data can be undefined if it's still loading, that's why we use the
    // optional data chaining operation ?
    jobs: data?.jobs,
    loading,
    //error is an apollo error object
    error: Boolean(error),
  };
}
