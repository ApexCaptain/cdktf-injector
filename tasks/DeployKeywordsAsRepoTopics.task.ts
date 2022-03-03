import fs from 'fs';
import path from 'path';
import { Octokit } from '@octokit/rest';

const task = async () => {
  const auth = JSON.parse(
    fs
      .readFileSync(path.join(process.cwd(), 'auth', 'credential.json'))
      .toString(),
  ).githubToken;
  const names = (
    JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json')).toString(),
    ).keywords as Array<string>
  ).map((eachKeyword) =>
    (eachKeyword.includes(' ')
      ? eachKeyword.split(' ').join('-')
      : eachKeyword
    ).toLocaleLowerCase(),
  );
  await new Octokit({
    auth,
  }).repos.replaceAllTopics({
    names,
    owner: 'ApexCaptain',
    repo: 'cdktf-injector',
  });
  process.exit(0);
};
// eslint-disable-next-line @typescript-eslint/no-floating-promises
task();
