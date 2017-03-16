# collection-faker

## fake meteor collections, with support for [grapher](https://github.com/cult-of-coders/grapher) links

### For now, you're going to need to use [my forked version of grapher](https://github.com/macsj200/grapher) branch `patch-1` (see [this PR](https://github.com/cult-of-coders/grapher/pull/97) for more info)

To use, add this repo to `/packages`, then do
```
meteor add maxjohansen:collection-faker
```

-------
`seedCollection` documentation
-------
Options configuration

```JavaScript
seedCollection({
    collection,
    numItemsPerCollection = 20,
    numArrayElements = 5,
    preseed = [],
    mutators = [],
})
```
* `collection` collection to seed
* `numItemsPerCollection` how many items to seed, **including** preseeded items
* `numArrayElements` how many elements to populate array keys with
* `preseed` Definitions of objects to seed the collection with first. Only keys that are **not** specified will be generated. I.E. if you specify a `name` attribute, `item.name === name`, and all other fields will be generated on `item`.
* `mutators` list of actions to perform after document insertion is complete. Specify `mutateSelector` mongo selection query object, and `mutate(item)` to specify logic.
---------------
Sample usage
---------------
Add `SeedDatabase` to your settings.json file 
```JSON
{ 
    "SeedDatabase" : true 
}
```

Optionally, you can elect to add an extra settings parameter, `clearDbBeforeSeed`, which will drop the database upon every app reload (recommended only for development of this package).

```JSON
{ 
    "SeedDatabase" : true,
    "clearDbBeforeSeed": true 
}
```


In server code
```JavaScript
import {seedCollection} from "meteor/maxjohansen:collection-faker";

seedCollection({
    collection:Meteor.users,
    numItemsPerCollection:15,
});
```

