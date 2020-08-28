import { getInput, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { getOctokit, context } from '@actions/github';

import {
  normaliseFingerprint,
  diffSizes,
  buildOutputText,
  getPullRequest,
  getAssetSizes,
  buildAssets,
} from './lib/helpers';

let octokit;

async function run() {
  try {
    const myToken = getInput('repo-token', { required: true });
    const files = JSON.parse(getInput('files', { required: false }));
    const withSame = getInput('with-same', { required: false }) === 'true';
    const buildAssetsCommand = getInput('build-assets', { required: false });

    const octokit = getOctokit(myToken)
    const pullRequest = await getPullRequest(context, octokit);

    await buildAssets(buildAssetsCommand);
    const prAssets = await getAssetSizes(files);

    await exec(`git checkout ${pullRequest.base.sha}`);
    await buildAssets(buildAssetsCommand);
    const masterAssets = await getAssetSizes(files);

    const fileDiffs = diffSizes(normaliseFingerprint(masterAssets), normaliseFingerprint(prAssets));
    let body= buildOutputText(fileDiffs, withSame);
    try {
      await octokit.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pullRequest.number,
        body,
      });
    } catch (e) {
      console.log('Could not create a comment automatically.');

      console.log(`Copy and paste the following into a comment yourself if you want to still show the diff:`);
      console.log(body);

      console.log('')
      console.log('Exception:')
      console.log(e)
    }
  } catch (error) {
    setFailed(error.message);
  }
}

export default run;
