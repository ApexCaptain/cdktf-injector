import { javascript, typescript } from 'projen';
import { huskyAuxiliary } from './project';
const PROJECT_NAME = 'cdktf-injector';
const project = new typescript.TypeScriptProject({
  /* Typescript */
  libdir: 'lib',
  srcdir: 'src',
  testdir: 'test',
  eslint: true,
  eslintOptions: {
    tsconfigPath: './tsconfig.dev.json',
    dirs: ['src'],
    devdirs: ['test', 'tasks', 'project'],
    fileExtensions: ['.ts'],
    ignorePatterns: [
      '*.js',
      '*.d.ts',
      'node_modules/',
      '*.generated.ts',
      'coverage',
    ],
    lintProjenRc: true,
    prettier: true,
    // aliasMap
    // aliasExtensions
    tsAlwaysTryTypes: true,
  },
  typescriptVersion: '4.4',

  // tsconfig
  tsconfigDev: {
    include: ['tasks/**/*.ts', 'project/**/*.ts'],
    compilerOptions: {},
  },
  tsconfigDevFile: 'tsconfig.dev.json',
  disableTsconfig: false,
  // sampleCode
  // entrypointTypes
  projenrcTs: true,
  // projenrcTsOptions

  /* Node */
  // copyrightOwner
  // copyrightPeriod
  // projenVersion
  projenDevDependency: true,
  buildWorkflow: true,

  /* ETC */
  depsUpgrade: true,
  depsUpgradeOptions: {
    exclude: ['term-size'],
    // include
    workflow: true,
    workflowOptions: {
      schedule: javascript.UpgradeDependenciesSchedule.WEEKLY,
    },
    taskName: 'upgrade',
    pullRequestTitle: 'upgrade dependencies',
    ignoreProjen: true,
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
    'eslint-plugin-spellcheck',
    'typedoc@0.22.18',
    'typedoc-plugin-missing-exports@0.23.0',
    'husky',
    '@octokit/rest',
    '@types/lodash',
    '@cdktf/provider-aws', // tmp
  ],
  autoApproveOptions: {
    allowedUsernames: ['ApexCaptain'],
    label: 'auto-merge-upgrade',
  },
  autoApproveProjenUpgrades: true,
  autoApproveUpgrades: true,
  peerDeps: ['cdktf', 'constructs'],

  projenrcJsonOptions: {
    filename: '.projenrc.ts',
  },
  scripts: {
    predocgen: 'rm -r -f ./docs',
    docgen: 'typedoc --options ./typedoc.json',
    precompile: 'rm -r -f ./lib',
    postprojen: 'chmod +x .husky/*',
  },
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
  gitignore: ['auth/', 'cdktf.out/'],
  majorVersion: 1,
  repository: 'https://github.com/ApexCaptain/cdktf-injector',
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
  ].sort();

  const srcWords = ['terraform', 'Getters', 'dep'].sort();

  const testWords = ['tf'].sort();

  eslint.addRules({
    'spellcheck/spell-checker': [
      'warn',
      {
        skipWords: [
          ...projenWords,
          ...srcWords,
          ...testWords,
          ...huskyAuxiliary.dictionary,
        ],
      },
    ],
  });
}

// Package Ignore (.npmignore)
[
  '.devContainer',
  '.husky',
  'assets',
  'auth',
  'docs',
  'project',
  'tasks',
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
/* Auxiliary */
void (async () => {
  await huskyAuxiliary
    .addHook('pre-commit', 'yarn docgen && git add -A')
    .addHook('pre-push', 'yarn ts-node ./tasks/DeployKeywordsAsRepoTopics.task')
    .build();
})();
