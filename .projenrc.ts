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
    devdirs: ['test', 'tasks', 'project', '@octokit/rest'],
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
      schedule: javascript.UpgradeDependenciesSchedule.DAILY,
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
  deps: ['term-size@2.2.1'],
  devDeps: [
    'eslint-plugin-spellcheck',
    'typedoc',
    'typedoc-plugin-missing-exports',
    'husky',
    '@octokit/rest',
    '@cdktf/provider-aws', // tmp
  ],
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
  release: false,
  releaseToNpm: false,
  gitignore: ['auth/'],
  majorVersion: 1,
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
  ].sort();

  const srcWords = ['terraform', 'Getters', 'dep'].sort();

  const testWords = [].sort();

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
  'auth',
  '.devContainer',
  '.editorconfig',
  '.eslintrc.json',
  '.gitattributes',
  '.prettierignore',
  '.prettierrc.json',
  '.projenrc.ts',
  '.ToDo',
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
