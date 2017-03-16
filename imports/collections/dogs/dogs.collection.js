import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

checkNpmVersions({ 'simpl-schema': '0.x.x' }, 'aldeed:meteor-collection2-core');

const SimpleSchema = require('simpl-schema').default;

Dogs = new Mongo.Collection("dogs");

const dogsSchema = new SimpleSchema();

Dogs.attachSchema(dogsSchema);
