import fs from 'fs';
import path from 'path';
import { Octokit } from '@octokit/rest';

const task = async () => {
  const keywords = (
    JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json')).toString(),
    ).keywords as Array<string>
  ).map((eachKeyword) =>
    eachKeyword.includes(' ') ? eachKeyword.split(' ').join('-') : eachKeyword,
  );
  await new Octokit().repos.replaceAllTopics({
    owner: 'ApexCaptain',
    repo: 'cdktf-injector',
    names: keywords,
  });
  process.exit(0);
};
// eslint-disable-next-line @typescript-eslint/no-floating-promises
task();
