// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by collection-faker.js.
import { name as packageName } from "meteor/maxjohansen:collection-faker";

// Write your tests here!
// Here is an example.
Tinytest.add('collection-faker - example', function (test) {
  test.equal(packageName, "collection-faker");
});
