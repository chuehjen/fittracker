# Exercise Catalog Notice

`exercise_catalog.json` is generated from the non-media data in:

https://github.com/hasaneyldrm/exercises-dataset

Only metadata and instruction text are included. Images, thumbnails, GIFs, and
other Gym visual media are intentionally excluded because that repository's
media files are not covered by the MIT license.

Regenerate with:

```bash
node scripts/build-exercise-catalog.js
```

Set `EXERCISES_DATASET_JSON=/path/to/exercises.json` to build from a different
local checkout.
