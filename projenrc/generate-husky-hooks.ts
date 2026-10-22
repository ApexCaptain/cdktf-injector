import fs from 'fs';
import path from 'path';

export type HuskyHookName =
  | 'applypatch-msg'
  | 'commit-msg'
  | 'post-applypatch'
  | 'post-checkout'
  | 'post-commit'
  | 'post-merge'
  | 'post-rewrite'
  | 'pre-applypatch'
  | 'pre-auto-gc'
  | 'pre-commit'
  | 'pre-merge-commit'
  | 'pre-push'
  | 'pre-rebase'
  | 'prepare-commit-msg';

export interface GenerateHuskyHooksOptions {
  projectPath: string;
  hooks: Partial<Record<HuskyHookName, string>>;
}

export function generateHuskyHooks(options: GenerateHuskyHooksOptions) {
  const { projectPath, hooks } = options;
  const huskyDirPath = path.join(projectPath, '.husky');
  if (!fs.existsSync(huskyDirPath)) {
    fs.mkdirSync(huskyDirPath, { recursive: true });
  }

  // Clear previous hook files (keep sub directories such as husky's own `_`)
  fs.readdirSync(huskyDirPath).forEach((eachFileName) => {
    const eachFilePath = path.join(huskyDirPath, eachFileName);
    if (fs.statSync(eachFilePath).isFile()) fs.unlinkSync(eachFilePath);
  });

  // Generate new hooks as executable files
  Object.entries(hooks).forEach(([hookName, hookContent]) => {
    fs.writeFileSync(path.join(huskyDirPath, hookName), `${hookContent}\n`, {
      mode: 0o755,
    });
  });
}
