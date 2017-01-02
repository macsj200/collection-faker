# collection-faker

## fake meteor collections, with support for [grapher](https://github.com/cult-of-coders/grapher) links

### For now, you're going to need to use [my forked version of grapher](https://github.com/macsj200/grapher) branch `patch-1` (see [this PR](https://github.com/cult-of-coders/grapher/pull/97) for more info)

To use, add this repo to `/packages`, then do
```
meteor add maxjohansen:collection-faker
```

---------------
Sample usage
---------------

```
import {seedCollections} from "meteor/maxjohansen:collection-faker";

const collectionsToSeed = [Practices, Appointments];
seedCollections(collectionsToSeed, {
  numItemsPerCollection:15,
});
```
