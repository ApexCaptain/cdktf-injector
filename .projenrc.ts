import { javascript, JsonFile, typescript } from 'projen';
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
  typescriptVersion: '~6.0.3',

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
  packageManager: javascript.NodePackageManager.PNPM,
  pnpmVersion: '10.33.0',
  addPackageManagerToDevEngines: false,
  // Dependency build script allow-list. With strictDepBuilds, any package not listed
  // in allowScripts or ignoredBuiltDependencies fails the install.
  allowScripts: ['unrs-resolver', '@parcel/watcher'],
  pnpmOptions: {
    workspaceYamlOptions: {
      strictDepBuilds: true,
      // rulesync → fastmcp → mcp-proxy → pipenet → tldjs. postinstall은
      // public suffix 목록 갱신일 뿐, rulesync generate/doctor에는 필요 없다.
      ignoredBuiltDependencies: ['tldjs'],
      // Dependabot 열린 알림. 같은 메이저 줄만 패치 하한. 4.x/5.x는 그대로.
      // rulesync 26.0.0이 @modelcontextprotocol/sdk를 1.31.0에 고정한다.
      overrides: {
        '@modelcontextprotocol/sdk': '1.32.2',
        'flatted@3': '3.4.4',
        'js-yaml@3': '3.15.2',
        'brace-expansion@1': '1.1.21',
        'picomatch@2': '2.3.2',
      },
    },
  },
  projenVersion: '^0.104.11',
  projenDevDependency: true,
  minNodeVersion: '22.0.0',
  workflowNodeVersion: '24',
  buildWorkflow: true,
  stale: true,

  /* ETC */
  depsUpgrade: true,
  depsUpgradeOptions: {
    workflow: true,
    workflowOptions: {
      schedule: javascript.UpgradeDependenciesSchedule.WEEKLY,
      branches: ['develop'],
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
  deps: ['lodash@^4.18.1'],
  devDeps: [
    'cdktf@0.20.3',
    'constructs@^10.5.0', // projen 0.104 peer requirement
    'eslint-plugin-spellcheck',
    'typedoc@^0.28.20',
    'typedoc-plugin-missing-exports@^4.1.4',
    'husky@^9.1.7',
    '@octokit/rest',
    '@types/lodash',
    // 2주 사이 메이저가 뛰어 레퍼런스와 같은 26.0.0에 고정한다. 올리려면 별도 이슈.
    'rulesync@26.0.0',
  ],
  autoApproveOptions: {
    allowedUsernames: ['ApexCaptain'],
    label: 'auto-merge-upgrade',
  },
  autoApproveUpgrades: true,
  peerDeps: ['cdktf@>=0.20.3 <0.22', 'constructs@^10.3.0'],
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
  npmTrustedPublishing: true,
  gitignore: [
    'auth/',
    'cdktf.out/',
    '/.pnpm-store',
    'tmp/',
    '.superpowers',
    // rulesync generate 산출물. SSOT는 .rulesync/
    '/.cursor/rules/',
    '/.cursor/skills/',
    '/.claude/rules/',
    '/.claude/skills/',
    '/.rulesync.local/',
    '/rulesync.local.jsonc',
    '/.github/generated',
    '.DS_Store',
  ],
  majorVersion: 2,
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
    'stash',
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
    'workspace',
    'yaml',
    'unrs',
    'rulesync',
    'jsonc',
    'claudecode',
    'claude',
    'ai',
    'mcp',
    'fastmcp',
    'pipenet',
    'tldjs',
    'postinstall',
    'sha',
    'evans',
    'dependabot',
    'flatted',
    'picomatch',
    'modelcontextprotocol',
    'sdk',
  ].sort();

  const srcWords = ['terraform', 'Getters', 'dep', 'stdout'].sort();

  const testWords = ['tf'].sort();

  const huskyWords = ['applypatch', 'msg', 'cmd', 'unlink', 'readdir'].sort();

  eslint.addRules({
    'spellcheck/spell-checker': [
      'warn',
      {
        skipWords: [...projenWords, ...srcWords, ...testWords, ...huskyWords],
        skipIfMatch: ['[0-9a-f]{40}'],
      },
    ],
  });
}

// Package Ignore (.npmignore)
[
  '.devcontainer',
  '.husky',
  '.pnpm-store',
  'pnpm-workspace.yaml',
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
  'issues',
  '.rulesync',
  'rulesync.jsonc',
  '.cursor',
  '.claude',
].forEach((eachNpmIgnorePattern) =>
  project.addPackageIgnore(eachNpmIgnorePattern),
);

new JsonFile(project, 'rulesync.jsonc', {
  obj: {
    $schema:
      'https://github.com/dyoshikawa/rulesync/releases/latest/download/config-schema.json',
    targets: {
      cursor: ['rules', 'skills'],
      claudecode: ['rules', 'skills'],
    },
    outputRoots: ['.'],
    delete: true,
  },
});

project.addScripts({
  'ai:generate': 'rulesync generate',
  'ai:check': 'rulesync generate --check',
  'ai:doctor': 'rulesync doctor',
  postprojen: 'pnpm ai:generate',
  'git@commit': 'git commit -F .github/generated/commit-message.txt',
  'git@pr':
    'gh pr create --base main --title "$(cat .github/generated/pull-request-title.txt)" --body-file ".github/generated/pull-request-body.md"',
});

// checkout / upload-artifact / download-artifact / semantic-pull-request는
// projen이 이미 커밋 sha를 쓴다. 태그로 남은 액션만 해당 태그의 커밋에 고정한다.
if (project.github) {
  const actionPins: Array<[string, string]> = [
    [
      'pnpm/action-setup@v6.0.10',
      'pnpm/action-setup@0977fd99725f1db4007ccb2928dbb4e90d06cc86',
    ],
    [
      'actions/setup-node@v7.0.0',
      'actions/setup-node@820762786026740c76f36085b0efc47a31fe5020',
    ],
    [
      'actions/stale@v11.0.0',
      'actions/stale@4391f3da665fdf50b6810c1a66712fb9ba21aa93',
    ],
    [
      'peter-evans/create-pull-request@v8.1.1',
      'peter-evans/create-pull-request@5f6978faf089d4d20b00c7766989d076bb2fc7f1',
    ],
  ];
  for (const [action, override] of actionPins) {
    project.github.actions.set(action, override);
  }
}

project.synth();

/* Git Hooks */
generateHuskyHooks({
  projectPath: project.outdir,
  hooks: {
    'pre-commit': [
      'if ! command -v pnpm >/dev/null 2>&1; then',
      '  exit 0',
      'fi',
      'if ! git diff --cached --name-only -- src typedoc.json | grep -q .; then',
      '  exit 0',
      'fi',
      'if ! git diff --quiet -- src || [ -n "$(git ls-files --others --exclude-standard -- src)" ]; then',
      '  git stash push --keep-index --quiet -- src',
      '  pnpm exec projen docgen',
      '  git add docs',
      '  git stash pop --quiet',
      'else',
      '  pnpm exec projen docgen && git add docs',
      'fi',
    ].join('\n'),
  },
});
