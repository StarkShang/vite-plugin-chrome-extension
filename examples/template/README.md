```
.
├── public/
│   ├── _locales/
│   │   └── en/
│   │       └── messages.json
│   ├── icons/
│   │   └── Icons for your extension. Should include a 16, 19, 38, 48, and 128px square image
│   └── browser-extension.html (default target html template)
├── src/
│   ├── assets/
│   │   └── Static assets in use in your app, like logo.png
│   ├── components/
│   │   └── HelloWorld.vue (modified)
│   ├── content-scripts
│   │   └── content-script.js
│   ├── devtools/ (asked during project generation)
│   │   ├── App.vue
│   │   └── main.js
│   ├── options/ (asked during project generation)
│   │   ├── App.vue
│   │   └── main.js
│   ├── popup/ (asked during project generation)
│   │   ├── App.vue
│   │   └── main.js
│   ├── override/ (asked during project generation)
│   │   ├── App.vue
│   │   └── main.js
│   └── standalone/ (asked during project generation)
│      ├── App.vue
│      └── main.js
├── background.js
└── manifest.json
```
