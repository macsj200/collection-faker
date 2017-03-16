Npm.depends({
  'faker':'3.1.0',
});

Package.describe({
  name: 'maxjohansen:collection-faker',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.2.3');
  api.use('ecmascript');
  api.use('xolvio:cleaner@0.3.1');
  api.mainModule('collection-faker.js','server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('maxjohansen:collection-faker');
  api.mainModule('collection-faker-tests.js');
});
