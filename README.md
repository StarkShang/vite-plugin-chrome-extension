<p align="center">
    <a href="#" target="_blank" rel="noopener noreferrer">
        <img width="180" src="./docs/icons/logo.svg" alt="Vite logo">
    </a>
</p>
<br/>
<p align="center">
</p>
<br/>

# vite-plugin-chrome-extension

> fork from rollup-plugin-chrome-extension and evolve for `vite` and `Chrome Extension Manifest V3`

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation <a name = "installation"></a>

```shell
npm install -D vite-plugin-chrome-extension
```

## Usage <a name = "usage"></a>

In vite.config.ts, 

``` typescript
// vite.config.ts
import { resolve } from "path";
import { defineConfig } from "vite";
import { chromeExtension } from "vite-plugin-chrome-extension";

export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    build: {
        rollupOptions: {
            input: "src/manifest.json"
        }
    },
    plugins: [
        chromeExtension()
    ],
})
```

## Examples from [chrome-extensions-samples](https://github.com/GoogleChrome/chrome-extensions-samples) are test

- [X] [Hello World](examples/hello-world)
- [X] [Page Redder](examples/page-redder)
- [X] [Cookie Clearer](examples/cookie-clearer)
- [X] [Omnibox - New Tab Search](examples/new-tab-search)
- [ ] [Web Accessible Resources](examples/web-accessible-resources)
