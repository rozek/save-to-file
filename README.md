# save-to-file #

a Svelte preprocessor that writes the results of any previous preprocessing into a file

For Svelte to work as foreseen (i.e. to create Javascript and CSS bundles with no multiple inclusing of any required dependencies), all Svelte components, actions and other modules should be provided as source code (perhaps along with other build results such as, e.g., CJS, AMD or UMD modules, if these modules are not only to be used in Svelte).

However, this leads to a problem: if a module does not consist of plain JavaScript, CSS and HTML only, but requires some *preprocessing* to convert the original sources into these formats, such source code can only be handled by build environments which include any required preprocessor.

A typical example are scripts written in TypeScript which first have to be transpiled into plain JavaScript in order to be used by Svelte environments lacking TypeScript support.

To solve this problem, not the original source code should be published, but the preprocessed one (the one which contains plain JavaScript, CSS and HTML only)

If included as part of the build process, `save-to-file` writes the results of any previous preprocessing into a given file which may then be safely published.
