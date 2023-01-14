import path from "node:path";

const routeFromRelativeFilePath = (filePath) => {
  // TODO: Better file to route handling (route groups, etc)
  return path.dirname(filePath).replace(/^\/?app\//, "/");
};

export const remarkInjectNextFrontmatter =
  ({ type = "yaml" } = {}) =>
  (tree, file, done) => {
    const absoluteFilePath = file?.history?.[0];

    if (!absoluteFilePath) {
      throw new Error(
        "Failed to inject static route: Cannot determine .mdx file path"
      );
    }

    // only handle pages
    if (!absoluteFilePath.endsWith("page.mdx")) {
      done();
      return;
    }

    const filePath = path.relative(file.cwd, absoluteFilePath);

    const matter = {
      filePath,
      route: routeFromRelativeFilePath(filePath),
    };

    const stringifiedMatter = `_next: ${JSON.stringify(matter)}`;

    const child = tree.children.find((node) => node.type === type);

    // No frontmatter, so insert some
    if (!child) {
      tree.children.unshift({
        type,
        value: stringifiedMatter,
      });
    } else {
      child.value = `${child.value}\n${stringifiedMatter}`;
    }

    done();
  };
