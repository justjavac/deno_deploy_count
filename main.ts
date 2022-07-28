import { serve } from "https://deno.land/std@0.149.0/http/server.ts";
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

  if (pathname.startsWith("/style.css")) {
    const style = new URL("public/style.css", import.meta.url);
    const response = await fetch(style);
    const headers = new Headers(response.headers);
    headers.set("content-type", "text/css; charset=utf-8");
    return new Response(response.body, { ...response, headers });
  }

  const index = new URL("public/index.html", import.meta.url);
  const response = await fetch(index);
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(response.body, { ...response, headers });
}

function json(jsobj: Parameters<typeof JSON.stringify>[0]) {
  return new Response(JSON.stringify(jsobj) + "\n");
}

serve(handleRequest);
