import { javascript, typescript } from 'projen';
import { generateHuskyHooks } from './projenrc/generate-husky-hooks';
const PROJECT_NAME = 'cdktf-injector';
const project = new typescript.TypeScriptProject({
  /* Typescript */
  libdir: 'lib',
  srcdir: 'src',
  testdir: 'test',
  eslint: true,
  eslintOptions: {
    tsconfigPath: './tsconfig.dev.json',
    projectService: false,
    dirs: ['src'],
    devdirs: ['test', 'tasks', 'projenrc'],
    fileExtensions: ['.ts'],
    ignorePatterns: [
      '*.js',
      '*.d.ts',
      'node_modules/',
      '*.generated.ts',
      'coverage',
      '/.pnpm-store/*',
      'tmp/',
    ],
    prettier: true,
    tsAlwaysTryTypes: true,
  },
  typescriptVersion: '~5.9.3',

  // tsconfig
  tsconfigDev: {
    include: ['.projenrc.ts', 'tasks/**/*.ts', 'projenrc/**/*.ts'],
    exclude: ['.pnpm-store', 'tmp', '.superpowers', 'lib', 'docs'],
    compilerOptions: {},
  },
  tsconfigDevFile: 'tsconfig.dev.json',
  disableTsconfig: false,
  projenrcTs: true,

  /* Node */
  packageManager: javascript.NodePackageManager.YARN_CLASSIC,
  projenVersion: '^0.104.11',
  projenDevDependency: true,
  minNodeVersion: '22.0.0',
  workflowNodeVersion: '24',
  buildWorkflow: true,
  stale: true,

  /* ETC */
  depsUpgrade: true,
  depsUpgradeOptions: {
    exclude: ['term-size'],
    workflow: true,
    workflowOptions: {
      schedule: javascript.UpgradeDependenciesSchedule.WEEKLY,
    },
    taskName: 'upgrade',
    pullRequestTitle: 'upgrade dependencies',
    signoff: true,
  },
  name: PROJECT_NAME,
  authorName: 'SangHun Lee',
  authorOrganization: false,
  description:
    'Dependency Injection for CDKTF(Cloud Development Kit for Terraform) powered by projen.', // 추후에 설명 추가
  keywords: [
    'cdk',
    'cdktf',
    'terraform',
    'di',
    'dependency injection',
    'injection',
    'injector',
    'dependency',
  ],
  npmAccess: javascript.NpmAccess.PUBLIC,
  deps: ['term-size@2.2.1', 'lodash'],
  devDeps: [
    'cdktf@0.20.3',
    'constructs@^10.5.0', // projen 0.104 peer requirement
    'eslint-plugin-spellcheck',
    'typedoc@^0.28.20',
    'typedoc-plugin-missing-exports@^4.1.4',
    'husky@^9.1.7',
    '@octokit/rest',
    '@types/lodash',
  ],
  autoApproveOptions: {
    allowedUsernames: ['ApexCaptain'],
    label: 'auto-merge-upgrade',
  },
  autoApproveUpgrades: true,
  peerDeps: ['cdktf@^0.20.3', 'constructs@^10.3.0'],
  peerDependencyOptions: { pinnedDevDependency: false },

  homepage: 'https://apexcaptain.github.io/cdktf-injector/',
  prettier: true,
  prettierOptions: {
    settings: {
      endOfLine: javascript.EndOfLine.AUTO,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: javascript.TrailingComma.ALL,
    },
  },
  defaultReleaseBranch: 'main',
  release: true,
  releaseToNpm: true,
  gitignore: ['auth/', 'cdktf.out/', '/.pnpm-store', 'tmp/', '.superpowers'],
  majorVersion: 1,
  repository: 'https://github.com/ApexCaptain/cdktf-injector',
});

// Tasks
project.preCompileTask.exec('rm -r -f ./lib');
project.addTask('docgen', {
  steps: [
    { exec: 'rm -r -f ./docs' },
    { exec: 'typedoc --options ./typedoc.json' },
  ],
});
project.addTask('deploy-topics', {
  description: 'Deploy package.json keywords as GitHub repository topics',
  exec: 'ts-node --project tsconfig.dev.json tasks/DeployKeywordsAsRepoTopics.task.ts',
});

// Eslint
if (project.eslint) {
  const eslint = project.eslint;
  /* Spell checking */
  eslint.addPlugins('spellcheck');
  const projenWords = [
    'javascript',
    'cdktf',
    'libdir',
    'srcdir',
    'testdir',
    'tsconfig',
    'devdirs',
    'projen',
    'rc',
    'projenrc',
    'signoff',
    'npmignore',
    'editorconfig',
    'gitattributes',
    'prettierignore',
    'eslintrc',
    'prettierrc',
    'docgen',
    'entrypoint',
    'di',
    'cdk',
    'typedoc',
    'fs',
    'rmdir',
    'octokit',
    'repo',
    'repos',
    'gitignore',
    'fqn',
    'pnpm',
    'devcontainer',
    'outdir',
    'fi',
  ].sort();

  const srcWords = ['terraform', 'Getters', 'dep'].sort();

  const testWords = ['tf'].sort();

  const huskyWords = ['applypatch', 'msg', 'cmd', 'unlink', 'readdir'].sort();

  eslint.addRules({
    'spellcheck/spell-checker': [
      'warn',
      {
        skipWords: [...projenWords, ...srcWords, ...testWords, ...huskyWords],
      },
    ],
  });
}

// Package Ignore (.npmignore)
[
  '.devcontainer',
  '.husky',
  '.pnpm-store',
  '.superpowers',
  'assets',
  'auth',
  'docs',
  'projenrc',
  'tasks',
  'tmp',
  '.editorconfig',
  '.eslintrc.json',
  '.gitattributes',
  '.prettierignore',
  '.prettierrc.json',
  '.projenrc.ts',
  '.ToDo',
  'typedoc.json',
  'markdown',
].forEach((eachNpmIgnorePattern) =>
  project.addPackageIgnore(eachNpmIgnorePattern),
);

project.synth();

/* Git Hooks */
generateHuskyHooks({
  projectPath: project.outdir,
  hooks: {
    'pre-commit': [
      'if ! command -v pnpm >/dev/null 2>&1; then',
      '  exit 0',
      'fi',
      'pnpm exec projen docgen && git add docs',
    ].join('\n'),
  },
});
