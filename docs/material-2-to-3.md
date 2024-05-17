# Material 2.x to 3.x

Upgrades from material 2.x components to their 3.x equivalents.

Material 2.x components can be found
[here](https://github.com/material-components/material-web/tree/mwc).

Material 3.x components can be found
[here](https://github.com/material-components/material-web).

The main differences are:

- Tags are prefixed with `md-` rather than `mwc-`
- All components come from a single package (`@material/web`)
- CSS variables are prefixed with `md-` rather than `mdc-`
- Many CSS variables are defined at a "system" level rather than per-component,
meaning you should specify the system vars and the rest will inherit

This codemod, in a rough way, gives you a starting point. It will not usually
produce a working build, but will do much of the find-and-replace.

The steps it takes are as follows:

- Replace all imports of `@material/mwc-{component}` with equivalent imports
from `@material/web`
- Replace all identifiers imported via those imports with their equivalents
in 3.x (e.g. `Icon` becomes `MdIcon`)
- Replace all occurrences of material tag names (via a dumb string replace)
in the source (e.g. `mwc-icon` becomes `md-icon`)
