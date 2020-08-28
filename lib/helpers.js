import prettyBytes from 'pretty-bytes';
import { exec } from '@actions/exec';
import assetSizeReporter from 'asset-size-reporter';

import fs from 'fs';

export function normaliseFingerprint(obj) {
  const normalisedObject = {};

  Object.keys(obj)
    .forEach((fileName) => {
      normalisedObject[fileName] = obj[fileName];
    });

  return normalisedObject;
}

export function diffSizes(baseBranch, pullRequestBranch) {
  const diffObject = {};

  Object.keys(pullRequestBranch)
    .forEach((key) => {
      const newSize = pullRequestBranch[key];
      const originSize = baseBranch[key];

      // new file i.e. does not exist in origin
      if (!originSize) {
        diffObject[key] = {
          raw: newSize.raw,
          gzip: newSize.gzip,
        };
      } else {
        diffObject[key] = {
          raw: newSize.raw - originSize.raw,
          gzip: newSize.gzip - originSize.gzip,
        };
      }

      // TODO cater for deleted files
    });

  return diffObject;
}


export async function getPullRequest(context, octokit) {
  console.log(context)
  console.log(context.payload)
  const pr = context.payload.pull_request;
  console.log(context.payload.pull_request)

  if (!pr) {
    console.log('Could not get pull request number from context, exiting');
    return;
  }

  const { data: pullRequest } = await octokit.pulls.get({
    owner: pr.base.repo.owner.login,
    repo: pr.base.repo.name,
    pull_number: pr.number,
  });

  return pullRequest;
}

export async function buildAssets(buildAssetsCommand) {
  if (buildAssetsCommand === 'auto') {
    if (fs.existsSync('yarn.lock')) {
      await exec('yarn --frozen-lockfile');
      await exec('yarn run prod');
    } else {
      await exec('npm ci');
      await exec('npm run prod');
    }
    return;
  }

  if (buildAssetsCommand === 'false') {
    return;
  }

  await exec(buildAssetsCommand);
}

export async function getAssetSizes(files) {
  let prAssets;

  await assetSizeReporter({
    patterns: files,
    json: true,
    console: {
      log(text) {
        prAssets = JSON.parse(text);
      },
    },
    cwd: process.cwd(),
  });

  return prAssets;
}


function reportTable(data) {
  let table = `File | raw | gzip
--- | --- | ---
`;
  data.forEach((item) => {
    table += `${item.file}|${prettyBytes(item.raw, { signed: true })}|${prettyBytes(item.gzip, { signed: true })}\n`;
  });

  return table;
}

export function buildOutputText(output, withSame) {
  const files = Object.keys(output)
    .map(key => ({
      file: key,
      raw: output[key].raw,
      gzip: output[key].gzip,
    }));

  const bigger = [];
  const smaller = [];
  const same = [];

  files.forEach((file) => {
    if (file.raw > 0) {
      bigger.push(file);
    } else if (file.raw < 0) {
      smaller.push(file);
    } else {
      same.push(file);
    }
  });

  let outputText = '';

  if (bigger.length) {
    outputText += `Files that got Bigger 🚨:\n\n${reportTable(bigger)}\n`;
  }

  if (smaller.length) {
    outputText += `Files that got Smaller 🎉:\n\n${reportTable(smaller)}\n\n`;
  }

  if (same.length && withSame) {
    outputText += `Files that stayed the same size 🤷‍:\n\n${reportTable(same)}\n\n`;
  }

  return outputText.trim();
}
