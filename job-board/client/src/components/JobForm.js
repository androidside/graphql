import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useJobCreate } from '../graphql/hooks';

//TODOPLANE Can I navigate to /jobs/new if user is not logged in?
//My guess is that probably yes but wont be able to submit
//TODOPLANE Andre: Eliminaremos todos los useState y usaremos Apollo Caching?
function JobForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  //Unlike the other custom hooks, it doesnt call useMutation right away
  // const [mutate, { loading }] = useMutation(CREATE_JOB_MUTATION);
  const { createJob, loading } = useJobCreate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    const job = await createJob(title, description);
    navigate(`/jobs/${job.id}`);
  };

  return (
    <div>
      <h1 className="title">New Job</h1>
      <div className="box">
        <form>
          <div className="field">
            <label className="label">Title</label>
            <div className="control">
              <input
                className="input"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">Description</label>
            <div className="control">
              <textarea
                className="textarea"
                rows={10}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button
                className="button is-link"
                disabled={loading}
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobForm;
