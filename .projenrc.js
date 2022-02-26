const { cdktf, javascript } = require('projen');
const project = new cdktf.ConstructLibraryCdktf({
  // Basic Info
  name: 'cdktf-injector',
  author: 'ApexCaptain',
  authorName: 'SangHun Lee',
  authorEmail: 'ayteneve93@gmail.com',
  authorOrganization: false,
  description: 'Some description', // 추후에 설명 추가
  keywords: [],
  repositoryUrl: 'https://github.com/ApexCaptain/TerraformInjector.git',
  npmAccess: javascript.NpmAccess.PUBLIC,
  // Dependencies
  cdktfVersion: '^0.8.3',
  deps: [],
  devDeps: [],
  peerDeps: [],

  // ETC
  scripts: {}, // 여기에 필요한 스크립트 추가

  // Prettier
  prettier: true,
  prettierOptions: {
    settings: {
      endOfLine: 'auto',
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'all',
    },
  },
  // Jsii
  // Publishing
  defaultReleaseBranch: 'main',
  publishToPypi: {
    distName: 'cdktf-injector-py',
    module: 'cdktf-injector-py',
  },
});
project.synth();
