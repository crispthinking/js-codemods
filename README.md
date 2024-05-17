# JS/TS codemods

A collection of codemods we use throughout our frontend/web repos.

## Usage

You can run these codemods with
[jscodeshift](https://github.com/facebook/jscodeshift). For example:

```sh
npx jscodeshift --parser=ts -t src/material-2-to-3.ts /code/ui/src
```

Where `/code/ui/src` is some repo you want to run the transform against.

## List

- [material-2-to-3](./docs/material-2-to-3.md) - used to upgrade from Material
2.x to 3.x
