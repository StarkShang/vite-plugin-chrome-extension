# Work flow

由于 Chrome 扩展不支持 ES6 中的 import 语法， vite-plugin-chrome-extension 中每一种 entry 的输出格式都为 IIFE (Immediately Invoked Function Expression)。

然而，rollup 不支持 IIFE 格式的 code-split([rollup/issues/2072](https://github.com/rollup/rollup/issues/2072))，也不支持多 entries([rollup/issues/3325](https://github.com/rollup/rollup/issues/3325))。当前的解决办法如下：

1. 解析 manifest.json 文件获取全部的入口：
   1. service worker
   2. content scripts
   3. popup
   4. options page
   5. web accessible resources
2. 启动主 build 进程，生成各自的 bundles；
3. 启动额外的 rollup 进程来构建 IIFE 输出：
   1. service worker
   2. content scripts
4. 更新 manifast.json 中 entries 的路径

## Service Worker

Service worker 是后台运行的脚本。它无法访问 DOM，也不能处理样式文件。

- 输出为 IIFE 格式的文件;
- 应该使用 `chrome.scripting.executeScript` 进行动态 imports，它不需要包含在 `web_accessible_resources`中。 ⚠ 注意： Currently, a maximum of a single file is supported by Chrome Extensions.;
- 应该使用 `chrome.scripting.insertCSS` 动态导入 css 文件, 它不需要包含在 `web_accessible_resources` 中。 ⚠ 注意：Currently, a maximum of a single file is supported by Chrome Extensions.;

## Content Scripts

Content Scripts 可以被静态注入、动态注入或程序化注入。 Css 文件可以通过 `import ".css"` 导入。

### 静态注入

在 `manifest.json` 中静态声明 content scripts， `vite-plugin-chrome-extension` 会自动解析 `manifest.json` ，并将这些脚本视作 entry 。

### 动态注入

在 service worker 中调用 `chrome.scripting.executeScript` 动态注入 content scripts。 这些脚本会被输出成 IIFE 格式, 并且 service worker 中的引用也会被更新。

⚠ 注意： Currently, a maximum of a single file is supported by Chrome Extensions.

## Options and Popup Pages

Options 和 popup pages 页面就是普通的 HTML 页面, 这些文件会被当做普通页面进行处理。
