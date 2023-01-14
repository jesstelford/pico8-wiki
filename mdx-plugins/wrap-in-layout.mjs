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
    // Ensure we don't ever accidentally trigger a "Dynamic" Next.js page.
    // This wont be necessary once we're able to use `next export`.
    {
      type: "mdxjsEsm",
      value: "export const dynamic = 'force-static'",
      data: {
        estree: {
          type: "Program",
          body: [
            {
              type: "ExportNamedDeclaration",
              declaration: {
                type: "VariableDeclaration",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: {
                      type: "Identifier",
                      name: "dynamic",
                    },
                    init: {
                      type: "Literal",
                      value: "force-static",
                      raw: "'force-static'",
                    },
                  },
                ],
                kind: "const",
              },
              specifiers: [],
              source: null,
            },
          ],
          sourceType: "module",
          comments: [],
        },
      },
    },

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
        "export default (props) => <PageLayout {...props} matter={matter} components={typeof components !== 'undefined' ? components : undefined} />",
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
                      {
                        type: "JSXAttribute",
                        name: {
                          type: "JSXIdentifier",
                          name: "components",
                        },
                        value: {
                          type: "JSXExpressionContainer",
                          expression: {
                            type: "ConditionalExpression",
                            test: {
                              type: "BinaryExpression",
                              left: {
                                type: "UnaryExpression",
                                operator: "typeof",
                                prefix: true,
                                argument: {
                                  type: "Identifier",
                                  name: "components",
                                },
                              },
                              operator: "!==",
                              right: {
                                type: "Literal",
                                value: "undefined",
                                raw: "'undefined'",
                              },
                            },
                            consequent: {
                              type: "Identifier",
                              name: "components",
                            },
                            alternate: {
                              type: "Identifier",
                              name: "undefined",
                            },
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
