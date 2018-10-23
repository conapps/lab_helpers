/**
 * modules/awx.js
 *
 * Module that interacts with Ansible Tower
 */
const axios = require('axios');

/** Constants */
const API = process.env.AWX_API_URL;
const TOKEN = process.env.AWX_API_TOKEN;
const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  Accept: 'application/json'
};

/** Exports */
exports = module.exports = {
  launchJobTemplate: launchJobTemplate
};

/** Functions */
async function launchJobTemplate(name) {
  try {
    const id = await getJobTemplateIDByName(name);
    const url = `${API}/api/v2/job_templates/${id}/launch/`;

    console.log(url);

    const { data } = await axios.post(
      url,
      {
        extra_vars: {
          lab_pod: 2,
          aws_region: 'us-east-1'
        }
      },
      { headers: HEADERS }
    );

    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
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
