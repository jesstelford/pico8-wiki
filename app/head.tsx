export default function Head() {
  return (
    <>
      <title>PICO-8 Unofficial Wiki</title>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <meta name="description" content="PICO-8 Unofficial Wiki" />

      {"" /* Required by https://dohliam.github.io/dropin-minimal-css */}
      {/* @ts-expect-error */}
      <link rel="stylesheet" href="#" precedence="default" />

      <link rel="icon" href="/favicon.ico" />
    </>
  );
}
