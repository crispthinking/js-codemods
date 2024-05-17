/* eslint-disable @crispthinking/prefer-array-for-of */
import {
  Transform,
  ImportDeclaration,
  TSTypeReference,
  CallExpression,
  TSHasOptionalTypeParameterInstantiation
} from 'jscodeshift';
import {visit} from 'recast';

interface Replacement {
  path: string;
  symbols: Record<string, string>;
  tags: Record<string, string>;
}

// Set this if you want to run the upgrade for a single component
const filter = 'mwc-circular-progress';

const importReplacements: Record<string, Replacement> = {
  'mwc-list': {
    path: 'list/list.js',
    symbols: {
      List: 'MdList'
    },
    tags: {
      'mwc-list': 'md-list'
    }
  },
  'mwc-list/mwc-list-item': {
    path: 'list/list-item.js',
    symbols: {
      ListItem: 'MdListItem'
    },
    tags: {
      'mwc-list-item': 'md-list-item'
    }
  },
  'mwc-icon': {
    path: 'icon/icon.js',
    symbols: {
      Icon: 'MdIcon'
    },
    tags: {
      'mwc-icon': 'md-icon'
    }
  },
  'mwc-button': {
    path: 'button/filled-button.js',
    symbols: {
      Button: 'MdFilledButton'
    },
    tags: {
      'mwc-button': 'md-filled-button'
    }
  },
  'mwc-dialog': {
    path: 'dialog/dialog.js',
    symbols: {
      Dialog: 'MdDialog'
    },
    tags: {
      'mwc-dialog': 'md-dialog'
    }
  },
  'mwc-checkbox': {
    path: 'checkbox/checkbox.js',
    symbols: {
      Checkbox: 'MdCheckbox'
    },
    tags: {
      'mwc-checkbox': 'md-checkbox'
    }
  },
  'mwc-linear-progress': {
    path: 'progress/linear-progress.js',
    symbols: {
      LinearProgress: 'MdLinearProgress'
    },
    tags: {
      'mwc-linear-progress': 'md-linear-progress'
    }
  },
  'mwc-circular-progress': {
    path: 'progress/circular-progress.js',
    symbols: {
      CiruclarProgress: 'MdCircularProgress'
    },
    tags: {
      'mwc-circular-progress': 'md-circular-progress'
    }
  },
  'mwc-switch': {
    path: 'switch/switch.js',
    symbols: {
      Switch: 'MdSwitch'
    },
    tags: {
      'mwc-switch': 'md-switch'
    }
  },
  'mwc-formfield': {
    path: 'field/filled-field.js',
    symbols: {
      FormField: 'MdFilledField'
    },
    tags: {
      'mwc-formfield': 'md-filled-field'
    }
  },
  'mwc-tab-bar': {
    path: 'tabs/tabs.js',
    symbols: {
      TabBar: 'MdTabs'
    },
    tags: {
      'mwc-tab-bar': 'md-tabs'
    }
  },
  'mwc-tab': {
    path: 'tabs/secondary-tab.js',
    symbols: {
      Tab: 'MdSecondaryTab'
    },
    tags: {
      'mwc-tab': 'md-secondary-tab'
    }
  },
  'mwc-textarea': {
    path: 'textfield/filled-text-field.js',
    symbols: {
      TextArea: 'MdFilledTextField'
    },
    tags: {
      'mwc-textarea': 'md-filled-text-field'
    }
  },
  'mwc-textfield': {
    path: 'textfield/filled-text-field.js',
    symbols: {
      TextField: 'MdFilledTextField'
    },
    tags: {
      'mwc-textfield': 'md-filled-text-field'
    }
  },
  'mwc-select': {
    path: 'select/filled-select.js',
    symbols: {
      Select: 'MdFilledSelect'
    },
    tags: {
      'mwc-select': 'md-filled-select'
    }
  },
  'mwc-menu': {
    path: 'menu/menu.js',
    symbols: {
      Menu: 'MdMenu'
    },
    tags: {
      'mwc-menu': 'md-menu'
    }
  }
};
const importKeys = new Set<string>();
const tagReplacements = new Map<string, string>();
for (const key in importReplacements) {
  if (filter && !key.includes(filter)) {
    continue;
  }
  if (Object.prototype.hasOwnProperty.call(importReplacements, key)) {
    importKeys.add(key);
    importKeys.add(`${key}/${key}`);
    importKeys.add(`${key}/${key}.js`);

    const tags = importReplacements[key].tags;

    for (const oldTag in tags) {
      if (Object.prototype.hasOwnProperty.call(tags, oldTag)) {
        tagReplacements.set(oldTag, tags[oldTag]);
      }
    }
  }
}

const transform: Transform = (file, api) => {
  const ast = api.jscodeshift(file.source);

  const replacedIdents: Record<string, string> = {};

  ast
    .find(ImportDeclaration)
    .filter((decl) => {
      const source = decl.value.source.value;
      return (
        typeof source === 'string' &&
        source.startsWith('@material/') &&
        importKeys.has(source.slice('@material/'.length))
      );
    })
    .forEach((decl) => {
      const source = (decl.value.source.value as string).slice(
        '@material/'.length
      );
      const parts = source.split('/');
      let replacement: Replacement | undefined;

      const key =
        parts.length === 2 && parts[0] === parts[1] ? parts[0] : source;
      if (!filter || key.includes(filter)) {
        replacement = importReplacements[key];
      }

      if (replacement) {
        decl.value.source.value = `@material/web/${replacement.path}`;

        if (decl.value.specifiers) {
          for (const specifier of decl.value.specifiers) {
            if (
              specifier.type === 'ImportSpecifier' &&
              specifier.imported.type === 'Identifier'
            ) {
              const replacementSymbol =
                replacement.symbols[specifier.imported.name];
              if (replacementSymbol) {
                if (specifier.local?.name === specifier.imported.name) {
                  replacedIdents[specifier.local.name] = replacementSymbol;
                }
                specifier.imported.name = replacementSymbol;
              }
            }
          }
        }
      }
    });

  const visitTypeReference = (value: TSTypeReference): void => {
    if (value.typeName.type !== 'Identifier') {
      return;
    }

    const replacement = replacedIdents[value.typeName.name];

    if (!replacement) {
      return;
    }

    value.typeName.name = replacement;
  };

  // TODO: remove this once ast-types supports traversing typeParameters
  // inside call expressions
  ast.find(api.j.CallExpression).forEach((path) => {
    const withParams = path.value as CallExpression &
      TSHasOptionalTypeParameterInstantiation;

    if (!withParams.typeParameters) {
      return;
    }

    visit(withParams.typeParameters, {
      visitTSTypeReference: (p) => {
        visitTypeReference(p.value);
        return false;
      }
    });
  });

  ast.find(TSTypeReference).forEach((path) => {
    visitTypeReference(path.value);
  });

  return ast.toSource().replace(/mwc-[\w-]+/g, (match) => {
    const newTag = tagReplacements.get(match);
    return newTag ?? match;
  });
};

export default transform;
