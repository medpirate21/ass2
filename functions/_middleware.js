export async function onRequest({ request, next }) {
    const url = new URL(request.url);
    
    // Block direct access to JSON files
    if (url.pathname.includes('/jsons/')) {
      const referer = request.headers.get('referer');
      if (!referer || !referer.includes(url.hostname)) {
        return new Response('Unauthorized', { status: 403 });
      }
    }
    
    return next();
  }