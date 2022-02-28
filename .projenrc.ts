import { javascript, typescript } from 'projen';
const PROJECT_NAME = 'cdktf-injector';
const project = new typescript.TypeScriptProject({
  // Typescript
  libdir: 'lib',
  srcdir: 'src',
  testdir: 'test',
  eslint: true,
  eslintOptions: {
    tsconfigPath: './tsconfig.dev.json',
    dirs: ['src'],
    devdirs: ['test', 'tasks'],
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
  },
  // Basic Info

  name: PROJECT_NAME,
  authorName: 'SangHun Lee',
  authorOrganization: false,
  description: 'Some description', // 추후에 설명 추가
  keywords: [],
  npmAccess: javascript.NpmAccess.PUBLIC,
  deps: [],
  devDeps: [],
  peerDeps: ['cdktf', 'constructs'],
  projenrcTs: true,
  projenrcJsonOptions: {
    filename: '.projenrc.ts',
  },
  scripts: {
    precompile: 'rm -r -f ./lib',
  },
  tsconfigDev: {
    include: ['tasks/**/*.ts'],
    compilerOptions: {},
  },

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
  release: false, // 이후 true로 변경
  releaseToNpm: false,
});

// Package Ignore (.npmignore)
[
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
