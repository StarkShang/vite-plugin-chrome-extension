# Work flow

Because Chrome extensions cannot use ES6 import, the outputs of the vite-plugin-chrome-extension should in format IIFE (Immediately Invoked Function Expression) for each entry (such as service worker, content scripts).

However, rollup neither support code-split for iife format([rollup/issues/2072](https://github.com/rollup/rollup/issues/2072)), nor support multiple entries([rollup/issues/3325](https://github.com/rollup/rollup/issues/3325)).

Current solutions is:

1. Parse the manifest.json file to get all entries:
   1. service work
   2. content scripts
   3. popup
   4. options page
   5. web accessible resources
2. Start additional rollup routines to bundle each entry, and generate iife outputs
3. Update path of entries in manifest.json
