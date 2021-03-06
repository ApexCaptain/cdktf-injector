import fs from 'fs';
import path from 'path';
import * as husky from 'husky';
import { Auxiliary } from '../module';

type HookType =
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
class HuskyAuxiliary implements Auxiliary {
  private huskyDirPath = path.join(process.cwd(), '.husky');
  private hooks = new Map<HookType, Array<string>>();
  dictionary = ['applypatch', 'msg', 'cmd', 'unlink', 'readdir'];
  constructor() {
    if (!fs.existsSync(this.huskyDirPath)) fs.mkdirSync(this.huskyDirPath);
  }
  private addAllCommand(fileDir: string, cmdArray: Array<string>) {
    cmdArray.forEach((eachCmd) => husky.add(fileDir, eachCmd));
  }

  async build() {
    const hooksMapKeys = Array.from(this.hooks.keys());
    fs.readdirSync(this.huskyDirPath).forEach((eachFileName) => {
      const eachFilePath = path.join(this.huskyDirPath, eachFileName);
      if (
        !fs.statSync(eachFilePath).isDirectory() &&
        !hooksMapKeys.includes(eachFileName as HookType)
      ) {
        fs.unlinkSync(eachFilePath);
        console.log(`husky - deleted ${eachFilePath}`);
      }
    });
    for (const [hookName, cmdArray] of this.hooks) {
      const eachFileName = path.join(this.huskyDirPath, hookName);
      if (fs.existsSync(eachFileName)) {
        const prevHookContents = fs
          .readFileSync(eachFileName)
          .toString()
          .split('\n');
        if (!cmdArray.every((eachCmd) => prevHookContents.includes(eachCmd))) {
          fs.unlinkSync(eachFileName);
          this.addAllCommand(eachFileName, cmdArray);
        }
      } else this.addAllCommand(eachFileName, cmdArray);
    }
    husky.install();
  }

  addHook(hookName: HookType, cmd: string) {
    (this.hooks.has(hookName)
      ? this.hooks.get(hookName)!
      : this.hooks.set(hookName, new Array()).get(hookName)!
    ).push(cmd);
    return this;
  }
}
export const huskyAuxiliary = new HuskyAuxiliary();
