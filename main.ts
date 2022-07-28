import { serve } from "https://deno.land/std@0.149.0/http/server.ts";
import { CSS, render } from "https://deno.land/x/gfm@0.1.22/mod.ts";

import { createCount, findCount, updateCount } from "./count.ts";

async function handleRequest(request: Request) {
  const { pathname } = new URL(request.url);

  if (pathname.startsWith("/api/")) {
    try {
      const key = decodeURIComponent(pathname.substr(5));
      const currentCount = await findCount(key);

      if (currentCount == null) {
        return json(await createCount(key));
      }

      return json(
        await updateCount({
          _id: currentCount._id,
          key,
          value: currentCount.value + 1,
        }),
      );
    } catch (error) {
      return new Response((error as Error).message);
    }
  }

  const readme = await Deno.readTextFile("./README.md");

  const body = render(readme);
  const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Count Service</title>
        <style>
          body {
            margin: 0;
            background-color: var(--color-canvas-default);
            color: var(--color-fg-default);
          }
          main {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }
          ${CSS}
        </style>
      </head>
      <body data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">
        <main class="markdown-body">
          ${body}
        </main>
      </body>
    </html>`;
  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=utf-8",
    },
  });
}

function json(jsobj: Parameters<typeof JSON.stringify>[0]) {
  return new Response(JSON.stringify(jsobj) + "\n");
}

serve(handleRequest);
