export async function onRequest(context) {
  const { QUIZ_BUCKET } = context.env;
  const file = context.params.filename;

  try {
    // 🔒 Restrict by Origin (only allow your domain)
    const origin = context.request.headers.get("Origin");
    const referer = context.request.headers.get("Referer");

    const allowedOrigins = [
      "https://medac.pages.dev",   // your Pages domain
      "https://quiz.onlymed.fun",  // your custom domain if used
      "https://t.me"               // allow Telegram WebView
    ];

    if (
      origin && !allowedOrigins.includes(origin) &&
      referer && !allowedOrigins.some(o => referer.startsWith(o))
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    // ✅ Fetch from R2
    const object = await QUIZ_BUCKET.get(file);

    if (!object) {
      return new Response("File not found", { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        "content-type": "application/json",
        // cache long-term in browser/CDN
        "cache-control": "public, max-age=31536000, immutable",
        // only allow your domain to read it via JS
        "access-control-allow-origin": "https://medac.pages.dev"
      }
    });
  } catch (err) {
    return new Response("Error fetching file: " + err.message, { status: 500 });
  }
}
