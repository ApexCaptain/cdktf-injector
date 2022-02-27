import { cdktf, javascript } from 'projen';

const PROJECT_NAME = 'cdktf-injector';

const project = new cdktf.ConstructLibraryCdktf({
  // ConstructLibraryCdktfOptions
  cdktfVersion: '^0.8.3',
  constructsVersion: '^10.0.12',

  // ConstructLibraryOptions
  catalog: {
    twitter: undefined,
    announce: false,
  },

  // JsiiProjectOptions
  rootdir: '.',
  repositoryUrl: 'https://github.com/ApexCaptain/cdktf-injector.git',
  author: 'ApexCaptain',
  authorAddress: 'ayteneve93@gmail.com',
  publishToMaven: {
    javaPackage: PROJECT_NAME,
    mavenArtifactId: PROJECT_NAME,
    mavenGroupId: PROJECT_NAME,
  },
  publishToPypi: {
    distName: PROJECT_NAME,
    module: PROJECT_NAME,
  },
  publishToGo: {
    moduleName: PROJECT_NAME,
  },
  // Basic Info
  name: PROJECT_NAME,

  authorName: 'SangHun Lee',

  authorOrganization: false,
  description: 'Some description', // 추후에 설명 추가
  keywords: [],

  npmAccess: javascript.NpmAccess.PUBLIC,
  // Dependencies

  deps: [],
  devDeps: ['ts-node'],
  peerDeps: [],
  projenrcTs: true,
  projenrcJsonOptions: {
    filename: '.projenrc.ts',
  },
  // ETC
  scripts: {},
  tsconfigDev: {
    include: ['tasks/**/*.ts'],
    compilerOptions: {},
  },
  eslintOptions: {
    devdirs: ['tasks'],
    dirs: [],
  },
  // Prettier
  prettier: true,
  prettierOptions: {
    settings: {
      endOfLine: javascript.EndOfLine.AUTO,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: javascript.TrailingComma.ALL,
    },
  },
  // Jsii
  // Publishing
  defaultReleaseBranch: 'main',
});
project.synth();
