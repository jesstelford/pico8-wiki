import { visit } from "unist-util-visit";
import path from "node:path";
import slash from "slash";
import { existsSync } from "next/dist/lib/find-pages-dir.js";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const EXTERNAL_URL_REGEX = /^https?:\/\//;

const getASTNodeImport = (name, from) => ({
  type: "mdxjsEsm",
  value: `import ${name} from "${from}"`,
  data: {
    estree: {
      type: "Program",
      sourceType: "module",
      body: [
        {
          type: "ImportDeclaration",
          specifiers: [
            {
              type: "ImportDefaultSpecifier",
              local: { type: "Identifier", name },
            },
          ],
          source: {
            type: "Literal",
            value: from,
            raw: `"${from}"`,
          },
        },
      ],
    },
  },
});

const findLastIndex = (arr, finder) => arr?.filter(finder).pop();

export const remarkP8PngLoader = () => (tree, _file, done) => {
  const filePath = _file?.history?.[0] ?? "";
  const importsToInject = [];

  visit(
    tree,
    ({ type, name }) => type === "mdxJsxFlowElement" && name === "Player",
    (node) => {
      const cartProp = findLastIndex(
        node.attributes,
        ({ type, name }) => type === "mdxJsxAttribute" && name === "cart"
      );

      const cart = cartProp?.value;

      if (!cart) {
        console.warn(
          `File "${filePath}" contain <Player> without a valid "cart" prop (got ${JSON.stringify(
            cartProp
          )}), skipping…`
        );
        return;
      }

      if (typeof cart !== "string") {
        console.warn(
          `File "${filePath}" contain <Player> with non-string "cart" prop, skipping…`
        );
        return;
      }

      if (EXTERNAL_URL_REGEX.test(cart)) {
        // do nothing with images with external url
        return;
      }

      // absolute paths must be files already in the public folder
      if (cart.startsWith("/")) {
        const urlPath = path.join(PUBLIC_DIR, cart);
        if (!existsSync(urlPath)) {
          console.error(
            `File "${filePath}" contain <Player> with "cart=${cart}" that wasn't found in "/public" directory, skipping…`
          );
          return;
        }
        cart = slash(urlPath);
      }

      // Unique variable name for the given static image URL.
      const tempVariableName = `$cartImgImport${importsToInject.length}`;

      cartProp.value = {
        type: "mdxJsxAttributeValueExpression",
        value: `${tempVariableName}?.src`,
        data: {
          estree: {
            type: "Program",
            sourceType: "module",
            body: [
              {
                type: "ExpressionStatement",
                expression: {
                  type: "ChainExpression",
                  expression: {
                    type: "MemberExpression",
                    object: {
                      type: "Identifier",
                      name: tempVariableName,
                    },
                    property: {
                      type: "Identifier",
                      name: "src",
                    },
                    computed: false,
                    optional: true,
                  },
                },
              },
            ],
          },
        },
      };

      // Inject the static image import into the root node.
      importsToInject.push(getASTNodeImport(tempVariableName, cart));
    }
  );

  tree.children.unshift(...importsToInject);
  done();
};
