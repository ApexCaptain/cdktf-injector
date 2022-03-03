import path from 'path';
import * as husky from 'husky';
const huskyDir = path.join(process.cwd(), '.husky');
husky.install(huskyDir);
type hookName =
  | 'applypatch-msg'
  | 'post-update'
  | 'pre-commit'
  | 'pre-rebase'
  | 'prepare-commit-msg'
  | 'commit-msg'
  | 'pre-applypatch'
  | 'pre-push'
  | 'pre-receive'
  | 'update';
export const HuskyProjectSetter = {
  huskyDir,
  addHook: (hookName: hookName, cmd: string) => {
    husky.add(`${huskyDir}/${hookName}`, cmd);
    return HuskyProjectSetter;
  },
  dictionary: ['applypatch', 'msg', 'cmd'].sort(),
};
