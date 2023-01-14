import Script from "next/script";

export const dynamic = "force-static";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <Script src="https://dohliam.github.io/dropin-minimal-css/switcher.js" />
        {/* <link */}
        {/*   rel="stylesheet" */}
        {/*   href="https://unpkg.com/bamboo.css@1.3.11/dist/bamboo.min.css" */}
        {/*   precedence="default" */}
        {/* /> */}
        {/* <style */}
        {/*   dangerouslySetInnerHTML={{ */}
        {/*     __html: ` */}
        {/*     :root { */}
        {/*       --b-link: #1d7484; */}
        {/*     } */}
        {/*     html { */}
        {/*       font-size: 1.125em; */}
        {/*     } */}
        {/*     body { */}
        {/*       line-height: 1.618; */}
        {/*       max-width: 44em; */}
        {/*     } */}
        {/*     ${ */}
        {/*       "" //From https://unpkg.com/simpledotcss/simple.css */}
        {/*     } */}
        {/*     kbd { */}
        {/*       color: var(--b-txt); */}
        {/*       border: 1px solid var(--b-txt); */}
        {/*       border-bottom: 3px solid var(--b-txt); */}
        {/*       border-radius: 5px; */}
        {/*       padding: 0.1rem 0.4rem; */}
        {/*       background: none; */}
        {/*     } */}
        {/*   `, */}
        {/*   }} */}
        {/* /> */}
        {children}
      </body>
    </html>
  );
}
