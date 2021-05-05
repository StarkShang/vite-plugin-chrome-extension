# Work flow

Because Chrome extensions cannot use ES6 import, the outputs of the vite-plugin-chrome-extension should in format IIFE (Immediately Invoked Function Expression) for each entry (such as service worker, content scripts).

However, rollup neither support code-split for iife format([rollup/issues/2072](https://github.com/rollup/rollup/issues/2072)), nor support multiple entries([rollup/issues/3325](https://github.com/rollup/rollup/issues/3325)).

Current solutions is:

1. Parse the manifest.json file to get all entries:
   1. service worker
   2. content scripts
   3. popup
   4. options page
   5. web accessible resources
2. Start main build process, and generate bundles;
3. Start additional rollup routines to bundle IIFE outputs:
   - background service worker
   - content scripts
4. Update path of entries in manifest.json

## Service Worker

A service worker is a script that runs in the background. It doesn't have access to DOM and not deal with style asset.

- Should be an IIFE script;
- Dynamically imports using `chrome.scripting.executeScript` should considered, and needn't include in `web_accessible_resources`.⚠ Note: Currently, a maximum of a single file is supported by Chrome Extensions.;
- Dynamically insert css using `chrome.scripting.insertCSS` should considered, and also needn't include in `web_accessible_resources`;

## Content Scripts

Content Scripts will be injected statically, dynamically or programmatically. Css files may be included by `import ".css"`.

### Static declarations

Static declared content scripts exist in `manifest.json`. `vite-plugin-chrome-extension` will parse `manifest.json` and add these scripts as entry.

### Dynamic declarations

Call `chrome.scripting.executeScript` in background service worker will dynamically inject content scripts. These scripts should bundle as IIFE outputs, and references in background service worker should updated.

⚠ Note: Currently, a maximum of a single file is supported by Chrome Extensions

## Options and Popup Pages

The entries of options and popup pages are HTML files, their outputs are same as nomarl page.
