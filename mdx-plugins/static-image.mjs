// Modified from https://github.com/shuding/nextra/blob/b02449b1309f59f3a1cf24747ecf76ae91df1a85/packages/nextra/src/mdx-plugins/static-image.ts
import { visit } from "unist-util-visit";
import path from "node:path";
import slash from "slash";
import { existsSync } from "next/dist/lib/find-pages-dir.js";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const EXTERNAL_URL_REGEX = /^https?:\/\//;

/**
 * @ link https://github.com/vercel/next.js/blob/6cfebfb02c2a52a1f99fca59a2eac2d704d053db/packages/next/build/webpack/loaders/next-image-loader.js#L6
 * @ link https://github.com/vercel/next.js/blob/6cfebfb02c2a52a1f99fca59a2eac2d704d053db/packages/next/client/image.tsx#LL702
 */
const VALID_BLUR_EXT = [".jpeg", ".png", ".webp", ".avif", ".jpg"];

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

// Based on the remark-embed-images project
// https://github.com/remarkjs/remark-embed-images
export const remarkStaticImage = () => (tree, _file, done) => {
  const filePath = _file?.history?.[0] ?? "";
  const importsToInject = [];

  visit(tree, "image", (node) => {
    let { url } = node;
    if (!url) {
      console.warn(
        `File "${filePath}" contain image with empty "src" property, skipping…`
      );
      return;
    }

    if (EXTERNAL_URL_REGEX.test(url)) {
      // do nothing with images with external url
      return;
    }

    if (url.startsWith("/")) {
      const urlPath = path.join(PUBLIC_DIR, url);
      if (!existsSync(urlPath)) {
        console.error(
          `File "${filePath}" contain image with url "${url}" that not found in "/public" directory, skipping…`
        );
        return;
      }
      url = slash(urlPath);
    }

    // Unique variable name for the given static image URL.
    const tempVariableName = `$imgImport${importsToInject.length}`;
    const blur = VALID_BLUR_EXT.some((ext) => url.endsWith(ext));
    // Replace the image node with an MDX component node, <Image>.
    // <Image> component is expected to be injected via the 'components'
    // prop on the MDX parser / bundler / provider
    Object.assign(node, {
      type: "mdxJsxFlowElement",
      name: "Image",
      children: [],
      attributes: [
        // do not render empty alt in html markup
        node.alt && {
          type: "mdxJsxAttribute",
          name: "alt",
          value: node.alt,
        },
        blur && {
          type: "mdxJsxAttribute",
          name: "placeholder",
          value: "blur",
        },
        {
          type: "mdxJsxAttribute",
          name: "src",
          value: {
            type: "mdxJsxAttributeValueExpression",
            value: tempVariableName,
            data: {
              estree: {
                type: "Program",
                sourceType: "module",
                body: [
                  {
                    type: "ExpressionStatement",
                    expression: {
                      type: "Identifier",
                      name: tempVariableName,
                    },
                  },
                ],
              },
            },
          },
        },
      ].filter(Boolean),
    });

    // Inject the static image import into the root node.
    importsToInject.push(getASTNodeImport(tempVariableName, url));
  });

  tree.children.unshift(...importsToInject);
  done();
};
