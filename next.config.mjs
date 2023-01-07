import withMDXFactory from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkUnwrapImages from "remark-unwrap-images";

import { remarkStaticImage } from "./mdx-plugins/static-image.mjs";

const withMDX = withMDXFactory({
  extension: /\.mdx?$/,
  options: {
    // If you use remark-gfm, you'll need to use next.config.mjs
    // as the package is ESM only
    // https://github.com/remarkjs/remark-gfm#install
    remarkPlugins: [
      [
        remarkFrontmatter,
        { type: "yaml", fence: { open: "```yaml", close: "```" } },
      ],
      remarkMdxFrontmatter,
      remarkGfm,
      remarkUnwrapImages,
      remarkStaticImage,
    ],
    rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
    // React Server Components don't support `createContext` so set
    // as `undefined` as  `@next/mdx` sets it to `@mdx-js/react` by default.
    // Uncomment the next line to fix the error
    providerImportSource: undefined,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    // Support Cloudflare Pages
    runtime: "experimental-edge",
  },
  reactStrictMode: true,
  swcMinify: true,
  // add mdx file support
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    // Cloudflare Pages can't run the optimiser, and their own optimiser costs
    // money
    unoptimized: true,
  },
};

export default withMDX(nextConfig);
