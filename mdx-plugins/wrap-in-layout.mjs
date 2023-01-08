export const remarkWrapInLayout = () => (tree, file, done) => {
  const absoluteFilePath = file?.history?.[0];

  if (!absoluteFilePath) {
    throw new Error(
      "Failed to wrap in layout: Cannot determine .mdx file path"
    );
  }

  // only handle pages
  if (!absoluteFilePath.endsWith("page.mdx")) {
    done();
    return;
  }

  tree.children.push(
    // Import and render our page layout component
    {
      type: "mdxjsEsm",
      value: "import PageLayout from '~/components/mdx'",
      data: {
        estree: {
          type: "Program",
          body: [
            {
              type: "ImportDeclaration",
              specifiers: [
                {
                  type: "ImportDefaultSpecifier",
                  local: {
                    type: "Identifier",
                    name: "PageLayout",
                  },
                },
              ],
              source: {
                type: "Literal",
                value: "~/components/mdx",
                raw: "'~/components/mdx'",
              },
            },
          ],
          sourceType: "module",
          comments: [],
        },
      },
    },

    {
      type: "mdxjsEsm",
      value:
        "export default (props) => <PageLayout {...props} matter={matter} />",
      data: {
        estree: {
          type: "Program",
          body: [
            {
              type: "ExportDefaultDeclaration",
              declaration: {
                type: "ArrowFunctionExpression",
                id: null,
                expression: true,
                generator: false,
                async: false,
                params: [
                  {
                    type: "Identifier",
                    name: "props",
                  },
                ],
                body: {
                  type: "JSXElement",
                  openingElement: {
                    type: "JSXOpeningElement",
                    attributes: [
                      {
                        type: "JSXSpreadAttribute",
                        argument: {
                          type: "Identifier",
                          name: "props",
                        },
                      },
                      {
                        type: "JSXAttribute",
                        name: {
                          type: "JSXIdentifier",
                          name: "matter",
                        },
                        value: {
                          type: "JSXExpressionContainer",
                          expression: {
                            type: "Identifier",
                            name: "matter",
                          },
                        },
                      },
                    ],
                    name: {
                      type: "JSXIdentifier",
                      name: "PageLayout",
                    },
                    selfClosing: true,
                  },
                  closingElement: null,
                  children: [],
                },
              },
            },
          ],
          sourceType: "module",
          comments: [],
        },
      },
    }
  );

  done();
};
