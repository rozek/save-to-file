# save-to-file #

a Svelte preprocessor that writes the results of any previous preprocessing into a file

For Svelte to work as foreseen (i.e. to create Javascript and CSS bundles with no multiple inclusion of any required dependencies), all Svelte components, actions and other modules should be provided as source code (perhaps along with other build results such as, e.g., CJS, AMD or UMD modules, if these modules are not only to be used in Svelte).

However, this leads to a problem: if a module does not consist of plain JavaScript, CSS and HTML only, but requires some *preprocessing* to convert the original sources into these formats, such source code can only be handled by build environments which include any required preprocessor.

A typical example are scripts written in TypeScript which first have to be transpiled into plain JavaScript in order to be used by Svelte environments lacking TypeScript support.

To solve this problem, not the original source code should be published, but the preprocessed one (the one which contains plain JavaScript, CSS and HTML only)

If included as part of the build process, `save-to-file` writes the results of any previous preprocessing into a given file which may then be safely published.

**NPM users**: please consider the [Github README](https://github.com/rozek/save-to-file/blob/main/README.md) for the latest description of this package (as updating the docs would otherwise always require a new NPM package version)

Just a small note: if you like this preprocessor and plan to use it, consider "starring" this repository (you will find the "Star" button on the top right of this page), such that I know which of my repositories to take most care of.

## Installation ##

```
npm install --save-dev save-to-file
```

## Usage ##

Typically, a svelte component or module is built using [rollup.js](https://rollupjs.org/guide/en/) and published as an [npm](https://docs.npmjs.com/) package. Such a scenario requires to provide a `package.json` and a `rollup.config.js` file, at least. The first should provide a `svelte` field which points to the preprocessed Svelte source while the latter should include `save-to-file` as part of the build process.

### package.json ###

A Svelte-compatible package specification should include the following line

```
"svelte":"./dist-folder/package-name.svelte"
```

where `./dist-folder` specifies the path to your distribution files and `package-name.svelte` is the file name of the preprocessed Svelte source.

### rollup.config.js ###

A Svelte-compatible rollup configuration should import and invoke `save-to-file`

```
import saveToFile from 'save-to-file'
...

export default {
  ...
  plugins: [
    svelte({ preprocess:[
      autoPreprocess(...),
      saveToFile('./dist-folder/package-name.svelte')
    ]}),
    ...
  ],
}
```

where `./dist-folder` again specifies the path to your distribution files and `package-name.svelte` is the file name of the preprocessed Svelte source.

Usually, a rollup configuration contains many additional instructions, but the lines shown above should help figuring out how and where to insert `save-to-file`.

If you need a complete working example, you may have a look at the build configuration of the [svelte-sortable-flat-list-view](https://github.com/rozek/svelte-sortable-flat-list-view).

## Build Instructions ##

You may easily build this package yourself.

Just install [NPM](https://docs.npmjs.com/) according to the instructions for your platform and follow these steps:

1. either clone this repository using [git](https://git-scm.com/) or [download a ZIP archive](https://github.com/rozek/save-to-file/archive/refs/heads/main.zip) with its contents to your disk and unpack it there
2. open a shell and navigate to the root directory of this repository
3. run `npm install` in order to install the complete build environment
4. execute `npm run build` to create a new build

You may also look into the author's [build-configuration-study](https://github.com/rozek/build-configuration-study) for a general description of his build environment.

## License ##

[MIT License](LICENSE.md)
