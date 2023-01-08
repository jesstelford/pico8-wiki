import { Children, isValidElement, cloneElement } from "react";
import type { PropsWithChildren } from "react";
import type { MDXProps } from "mdx/types";
import Image from "next/image";

const defaultComponents = {
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol style={{ listStyle: "inside decimal" }}>{children}</ol>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul style={{ listStyle: "inside disc" }}>{children}</ul>
  ),
  Image: ({ src, alt, ...props }: React.ComponentProps<typeof Image>) => {
    // Cloudflare pages uses the Vercel build, which flattens the static assets
    // from /_next/static/ to /static/, but for some reason Next.js doesn't know
    // that, so we have to do it ourselves.
    // The `src` prop can be a few different things, so we try to handle them
    // all here.
    if (process.env.NODE_ENV === "production") {
      if (typeof src === "string") {
        src = src.replace(/^\/_next\//, "/");
      } else if (typeof src === "object") {
        if ("src" in src) {
          src.src = src.src.replace(/^\/_next\//, "/");
        } else {
          src.default.src = src.default.src.replace(/^\/_next\//, "/");
        }
      }
    }

    return (
      <Image
        src={src}
        alt={alt || ""}
        // Causes a 404 in dev mode because we're using the edge runtime, and
        // the next image processor isn't available, but works fine in prod mode
        // which calculates the blur at build time.
        {...(process.env.NODE_ENV === "production" && { placeholder: "blur" })}
        {...props}
      />
    );
  },
};

interface PageLayoutProps extends PropsWithChildren, MDXProps {
  matter: {
    [key: string]: unknown;
  };
}

const PageLayout = ({
  children,
  components /*, matter: { _next } TODO: Use this to render a "Edit on GitHub link" */,
}: PageLayoutProps) => {
  return Children.map(children, (child) => {
    // Checking isValidElement is the safe way and avoids a
    // typescript error too.
    if (isValidElement(child)) {
      return cloneElement(child, {
        // Insert the components for MDX to render when converting from markdown
        components: { ...defaultComponents, ...components },
      } as unknown as MDXProps);
    }
    return child;
  });
};

export default PageLayout;
