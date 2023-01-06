import { Children, isValidElement, cloneElement } from "react";
import type { PropsWithChildren } from "react";
import type { MDXProps } from "mdx/types";

const components = {
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol style={{ listStyle: "inside decimal" }}>{children}</ol>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul style={{ listStyle: "inside disc" }}>{children}</ul>
  ),
};

const PageLayout = ({ children, ...props }: PropsWithChildren) =>
  Children.map(children, (child) => {
    // Checking isValidElement is the safe way and avoids a
    // typescript error too.
    if (isValidElement(child)) {
      // Insert the components for MDX to render when converting from markdown
      return cloneElement(child, { ...props, components } as MDXProps);
    }
    return child;
  });

export default PageLayout;
