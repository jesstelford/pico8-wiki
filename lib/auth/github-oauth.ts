// A combination of:
// - https://github.com/digitalinteraction/vercel-netlify-cms-github
// - https://github.com/gr2m/cloudflare-worker-github-oauth-login
import type { NextRequest } from "next/server";

const client_id = process.env.OAUTH_CLIENT_ID;
const client_secret = process.env.OAUTH_CLIENT_SECRET;

/** Render a html response with a script to finish a client-side github authentication */
function renderResponse(status: "success" | "error", content: any) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Authorizing ...</title>
  </head>
  <body>
    <p id="message"></p>
    <script>
      // Output a message to the user
      function sendMessage(message) {
        document.getElementById("message").innerText = message;
        document.title = message
      }

      // Handle a window message by sending the auth to the "opener"
      function receiveMessage(message) {
        console.debug("receiveMessage", message);
        window.opener.postMessage(
          'authorization:github:${status}:${JSON.stringify(content)}',
          message.origin
        );
        window.removeEventListener("message", receiveMessage, false);
        sendMessage("Authorized, closing ...");
      }

      sendMessage("Authorizing ...");
      window.addEventListener("message", receiveMessage, false);

      console.debug("postMessage", "authorizing:github", "*")
      window.opener.postMessage("authorizing:github", "*");
    </script>
  </body>
</html>`;
}

/** An endpoint to start an OAuth2 authentication */
export function auth(req: NextRequest) {
  const host = req.headers.get("host");

  // handle CORS pre-flight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": host || "",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  return Response.redirect(
    `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${encodeURIComponent(
      "repo,user"
    )}&redirect_uri=${encodeURIComponent(
      `https://${host}/api/github-oauth-callback`
    )}`,
    302
  );
}

/** An endpoint to finish an OAuth2 authentication */
export async function callback(req: NextRequest) {
  const host = req.headers.get("host");

  // handle CORS pre-flight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": host || "",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const { code } = await req.json();

    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "cloudflare-worker",
          accept: "application/json",
        },
        body: JSON.stringify({
          client_id,
          client_secret,
          code,
          redirect_uri: `https://${host}/api/github-oauth-callback`,
        }),
      }
    );
    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return new Response(
      renderResponse("success", {
        token: result.access_token,
        provider: "github",
      }),
      {
        status: 200,
        headers: {
          "content-type": "text/html",
        },
      }
    );
  } catch (e) {
    return new Response(renderResponse("error", e), {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
    });
  }
}
