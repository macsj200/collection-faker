import faker from 'faker';
import { Accounts } from 'meteor/accounts-base'
import {Meteor} from 'meteor/meteor';
import _ from 'lodash';

// Write your package code here!

// Variables exported by this module can be imported by other packages and
// applications. See collection-faker-tests.js for an example of importing.
export const name = 'collection-faker';

// This returns a user object ready to be inserted via Accounts.createUser
export const genFakeUser = (options) => {
  const email = options.email || faker.internet.email();
  const password = options.password || 'password';
  const profile = options.profile || {};

  return {
    email,
    password,
    profile,
  };
};

// This returns a fake item from the specified collection ready to be inserted
export const genFakeItem = (options) => {
  const collection = options.collection;
  const numItems = options.numItems || 20;
  const numArrayElements = options.numArrayElements || 10;

  const schema = collection.simpleSchema()['_schema'];

  function parseKey(key){
    if(key === 'createdById'){
      return options.userId;
    }
    else if(schema[key].allowedValues){
      const val = faker.random.arrayElement(schema[key].allowedValues);
      return val;
    }
    else if(schema[key].type === String){
      if(key.includes('images')){
        return faker.image.image();
      }
      else {
        return faker.lorem.word();
      }
    } else if(schema[key].type === Number){
      return faker.random.number();
    }
  }

  let fakeItem = {};

  _.forOwn(schema, (value, key) => {
    if(value.type === Array){
      return;
    }
    else if(key.includes('.$')){
      const arrKey = key.slice(0,-2);
      if(!fakeItem[arrKey]) {
        _.set(fakeItem, arrKey, []);
      }

      _.times(numArrayElements, () => {
        fakeItem[arrKey].push(parseKey(key));
      });
    }
    else {
      _.set(fakeItem, key, parseKey(key));
    }
  });

  return fakeItem;
};
