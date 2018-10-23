/**
 * controllers/awx.js
 *
 * AWX resource controller
 */
const express = require('express');
const cuid = require('cuid');
const omit = require('lodash/omit');

const awx = require('../modules/awx.js');
const utils = require('../modules/utils.js');
const asyncMiddleware = require('../middlewares/async.js');
const jobs = require('../models/jobs.js');
/** Create the express router */
const router = express.Router();

/** Exports */
exports = module.exports = router;

/** Constants */
const AWX_API_URL = process.env.AWX_API_URL;

/** Routes */
router.get(
  '/launch/:name/',
  asyncMiddleware(async (req, res) => {
    const name = req.params.name;

    if (name === undefined)
      utils.handleError(res, 'job template "name" is undefined');

    const result = await awx.launchJobTemplate(name);

    let job = jobs.create({
      description: result.description,
      extra_vars: JSON.parse(result.extra_vars),
      job_id: result.id,
      job_template_id: result.job_template,
      name: result.name,
      playbook: result.playbook,
      activtity_stream_url: `${AWX_API_URL}${result.related.activity_stream}`,
      cancel_url: `${AWX_API_URL}${result.related.cancel}`,
      job_events_url: `${AWX_API_URL}${result.related.job_events}`,
      relaunch_url: `${AWX_API_URL}${result.related.relaunch}`
    });

    job = mutateJob(job);

    res.status(200).json(job);
  })
);

/** Functions */
function mutateJob(job) {
  const { id, data: { extra_vars, name, playbook, description } = {} } = job;
  job = omit(job, 'data');
  job.data = { extra_vars, name, playbook, description };
  job.related = {
    activtity_stream: utils.makeURL('jobs', `activtity_stream/${id}`),
    cancel: utils.makeURL('jobs', `cancel/${id}`),
    relaunch: utils.makeURL('jobs', `relaunch/${id}`)
  };
  return job;
}
