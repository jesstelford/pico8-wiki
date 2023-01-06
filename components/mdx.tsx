import { Children, isValidElement, cloneElement } from "react";
import type { PropsWithChildren } from "react";
import type { MDXProps } from "mdx/types";

const components = {
  h1: "h2",
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol style={{ listStyle: "inside decimal" }}>{children}</ol>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul style={{ listStyle: "inside disc" }}>{children}</ul>
  ),
};

const PageLayout = ({ children }: PropsWithChildren) =>
  Children.map(children, (child) => {
    // Checking isValidElement is the safe way and avoids a
    // typescript error too.
    if (isValidElement(child)) {
      return cloneElement(child, { components } as MDXProps);
    }
    return child;
  });

export default PageLayout;
