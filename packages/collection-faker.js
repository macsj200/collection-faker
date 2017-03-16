import faker from 'faker';
import { Accounts } from 'meteor/accounts-base'
import {Meteor} from 'meteor/meteor';
import _ from 'lodash';
import { resetDatabase } from 'meteor/xolvio:cleaner';

const insertIntoCollection = (collection, doc) => {
  let docId;
  
  if(collection === Meteor.users){
    let email;
    let password = 'password';

    if(Meteor.users.find().count() === 0){
        email = 'test@test.com';
        if(doc.emails){
            doc.emails[0] = email;
        }
    }
    else if(doc.emails && doc.emails.length !== 0){
      email = doc.emails[0].address;
    }
    else {
      email = faker.internet.email();
    }

    const userObject = {
      profile:doc,
      email,
      password,
      ...doc
    };

    docId = Accounts.createUser(userObject);
  } else {
    docId = collection.insert(doc, {
      getAutoValues: false,
    });
  }

  return docId;
};

const getLinkName = (collection, field) => {
  let linkName;
  _.forOwn(collection.getLinks(), (value, key) => {
    if(field === value.linkConfig.field){
      linkName = value.linkName;
    }
  });
  return linkName;
};

// This returns a fake item from the specified collection ready to be inserted
export const genFakeItem = ({
    collection,
    numArrayElements = 5,
    maxRecursionDepth = 3,
    currentRecursionDepth = 0,
    preseededItem = {},
} = {}) => {
  const schema = collection.simpleSchema()['_schema'];

  let fakeItem = {...preseededItem};

  function parseKey(key){
    let linkName;
    if(key.endsWith('._id')){
        linkName = getLinkName(collection, key.slice(0, key.indexOf("._id")));
    } else {
        linkName = getLinkName(collection, key);
    }
    if(linkName){
      const link = collection.getLink(null, linkName);
      if(link.linkedCollection === collection){
        //console.log('recursive field', linkName);
        currentRecursionDepth++;
        if(currentRecursionDepth > maxRecursionDepth){
            //console.log('recursion limit reached', linkName);
            return null;
        }
      }
      
      if('grabExisting' in link.linker.linkConfig){
          return link.linkedCollection.findOne(link.linker.linkConfig.grabExisting)._id;
      }
      else{
          const linkedFakeItem = genFakeItem({
            collection: link.linkedCollection,
            numArrayElements,
            maxRecursionDepth,
            currentRecursionDepth,
          });
          
          return insertIntoCollection(link.linkedCollection, linkedFakeItem);
      }
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
        return faker.address[key.slice(key.indexOf('.') + 1)]();
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
      if(schema[key].min && schema[key].max){
        return faker.random.number({
          min:schema[key].min,
          max:schema[key].max,
        });
      }
      return faker.random.number();
    } else if(schema[key].type === Date){
      return new Date();
    } else if(schema[key].type === Boolean) {
      return faker.random.boolean();
    }
  }

  _.forOwn(schema, (value, key) => {
    if(value.type === Array || value.type === Object){
      return;
    }
    else if(key.includes('.$')){
      const arrKey = key.slice(0,key.indexOf('.$'));
      if(arrKey in preseededItem){
          return;
      }
      const marginSize = '.$.'.length;
      const theRestOfTheKey = key.slice(key.indexOf('.$') + marginSize);

      if(!_.get(fakeItem,arrKey)) {
        _.set(fakeItem, arrKey, []);
      }

      _.times(numArrayElements, (i) => {
        const linkName = getLinkName(collection, arrKey);
        if(theRestOfTheKey === ''){
          _.get(fakeItem,arrKey).push(parseKey(key));
        }
        else {
          if(!_.get(fakeItem,arrKey)[i]) {
            _.get(fakeItem,arrKey).push({});
          }
          _.set(_.get(fakeItem,arrKey)[i], theRestOfTheKey, parseKey(key));
        }
      });
    }
    else {
      if(key in preseededItem){
          return;
      }
      _.set(fakeItem, key, parseKey(key));
    }
  });

  return fakeItem;
};

let dbCleared = false;
if(!dbCleared && Meteor.settings.SeedDatabase && Meteor.settings.clearDbBeforeSeed){
    console.log('clearDbBeforeSeed set, clearing db');
    resetDatabase();
    dbCleared = true;
}


export const seedCollection = ({
    collection,
    numItemsPerCollection = 20,
    numArrayElements = 5,
    preseed = [],
    mutators = [],
} = {}) => {
  if(Meteor.settings.SeedDatabase){
      if(collection.find({}).count() === 0){
        console.log(`Seeding collection ${collection._name}`);
        _.times(numItemsPerCollection, () => {
          let preseededItem = preseed.pop();
          insertIntoCollection(collection, genFakeItem({
            numArrayElements,
            collection,
            preseededItem,
          }));
        });
        mutators.forEach((mutator) => {
            collection.find(mutator.mutateSelector).forEach((item) => {
                collection.update(item._id, {$set: mutator.mutate(item)});
            });
        });
      } else {
        console.log(`Collection ${collection._name} is populated, skipping seed`);
      }
  }
};
