/**
 * modules/awx.js
 *
 * Module that interacts with Ansible Tower
 */
const axios = require('axios');

const jobs = require('../models/jobs.js');
/** Constants */
const API = process.env.AWX_API_URL;
const TOKEN = process.env.AWX_API_TOKEN;
const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  Accept: 'application/json'
};
const CONFIG = { headers: HEADERS };
const ACCEPT =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8';

/** Exports */
exports = module.exports = {
  cancelJob,
  getJob,
  getJobActivityStream,
  getJobStdout,
  launchJobTemplate,
  relaunchJob
};

/** Functions */
async function getJob(jobId) {
  const job = jobs.get(jobId);

  if (job === undefined) throw new Error('"job" is undefined');

  const { data } = await axios(job.data.job_url, CONFIG);

  return data;
}

async function getJobActivityStream(jobId) {
  const job = jobs.get(jobId);

  if (job === undefined) throw new Error('"job" is undefined');

  const { data } = await axios(job.data.activity_stream_url, CONFIG);

  return data;
}

async function cancelJob(jobId) {
  const job = jobs.get(jobId);

  if (job === undefined) throw new Error('"id" is undefined');

  const { data: get_data } = await axios.get(job.data.cancel_url, CONFIG);

  if (get_data.can_cacel === false) return get_data;

  const { data: post_data } = await axios.post(job.data.cancel_url, {}, CONFIG);

  return post_data;
}

async function relaunchJob(jobId) {
  const job = jobs.get(jobId);

  if (job === undefined) throw new Error('"id" is undefined');

  const { data } = await axios.post(job.data.relaunch_url, {}, CONFIG);

  return data;
}

async function getJobStdout(jobId, { format, dark } = {}) {
  const job = jobs.get(jobId);

  if (job === undefined) throw new Error('"id" is undefined');

  const url = job.data.stdout_url + `?format=${format}&dark=${dark}`;
  const config = Object.assign({}, CONFIG, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: ACCEPT
    }
  });

  const { data } = await axios(url, config);

  return data;
}

async function launchJobTemplate(name, extraVars) {
  const id = await getJobTemplateIDByName(name);
  const url = `${API}/api/v2/job_templates/${id}/launch/`;

  console.log(url);

  const { data } = await axios.post(
    url,
    {
      extra_vars: extraVars
    },
    CONFIG
  );

  return data;
}
/**
 * Gets a job_template by its name.
 * @param {string} name Name of the job_template
 */
async function getJobTemplateIDByName(name) {
  try {
    const url = `${API}/api/v2/job_templates/?name=${name}`;

    console.log(url);

    const { data } = await axios.get(url, {
      headers: HEADERS
    });

    if (data.count === 0) throw new Error('job_template not found');

    if (data.count > 1)
      console.log('Found more than 1 element. Discarding other than the first');

    return data.results[0]['id'];
  } catch (err) {
    console.error(err);
    return;
  }
}
/**
 * Simplifies the creation of job_template getter functions.
 * @param {string} name Name of the job_template.
 */
function getJobTemplateIDByNameFactory(name) {
  return async function() {
    return getJobTemplateIDByName(name);
  };
}
