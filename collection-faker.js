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

const isLinkedField = (collection, field) => {
  let linkName;
  _.forOwn(collection.getLinks(), (value, key) => {
    if(field === value.linkConfig.field){
      linkName = value.linkName;
    }
  });
  return linkName;
};

// This returns a fake item from the specified collection ready to be inserted
export const genFakeItem = (options) => {
  const collection = options.collection;
  const numItems = options.numItems || 20;
  const numArrayElements = options.numArrayElements || 10;

  const schema = collection.simpleSchema()['_schema'];

  function parseKey(key){
    const linkName = isLinkedField(collection, key);
    if(linkName){
      const linkedFakeItem = genFakeItem({
        collection: collection.getLink(null,linkName).linkedCollection,
        numItems,
        numArrayElements,
      });
      return collection.getLink(null,linkName).linkedCollection.insert(linkedFakeItem);
    }
    else if(schema[key].allowedValues){
      const val = faker.random.arrayElement(schema[key].allowedValues);
      return val;
    }
    else if(schema[key].type === String){
      if(key.toLowerCase().includes('image') || key.toLowerCase().includes('picture')){
        return faker.image.image();
      }
      else if(key === 'firstName'){
        return faker.name.firstName();
      }
      else if(key.toLowerCase().includes('email')){
        return faker.internet.email();
      }
      else if(key === 'lastName'){
        return faker.name.lastName();
      }
      else if(key.startsWith('address')){
        return faker.address[key.slice(key.indexOf('address') + 'address'.length + 1)]();
      }
      else if(key.startsWith('locations.$')){
        return faker.address[key.slice(key.indexOf('locations.$') + 'locations.$'.length + 1)]();
      }
      else if(schema[key].min >= 200) {
        return faker.lorem.paragraph(10);
      }
      else {
        return faker.lorem.word();
      }
    } else if(schema[key].type === Number){
      return faker.random.number();
    } else if(schema[key].type === Date){
      return new Date();
    } else if(schema[key].type === Boolean) {
      return faker.random.boolean();
    }
  }

  let fakeItem = {};

  _.forOwn(schema, (value, key) => {
    if(value.type === Array || value.type === Object){
      return;
    }
    else if(key.includes('.$')){
      const arrKey = key.slice(0,key.indexOf('.$'));
      const marginSize = '.$.'.length;
      const theRestOfTheKey = key.slice(key.indexOf('.$') + marginSize);

      if(!fakeItem[arrKey]) {
        _.set(fakeItem, arrKey, []);
      }

      _.times(numArrayElements, (i) => {
        const linkName = isLinkedField(collection, arrKey);
        if(theRestOfTheKey === ''){
          fakeItem[arrKey].push(parseKey(key));
        }
        else {
          if(!fakeItem[arrKey][i]) {
            fakeItem[arrKey].push({});
          }
          if(linkName && key.endsWith('_id')){
            _.set(fakeItem[arrKey][i], theRestOfTheKey, collection.getLink(null,linkName).linkedCollection.insert(genFakeItem({
              collection: collection.getLink(null,linkName).linkedCollection,
              numItems,
              numArrayElements,
            })));
          }
          else {
            _.set(fakeItem[arrKey][i], theRestOfTheKey, parseKey(key));
          }
        }
      });
    }
    else {
      _.set(fakeItem, key, parseKey(key));
    }
  });

  return fakeItem;
};
