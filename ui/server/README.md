# Server-only files

These files set up an express server to respond to requests, handle
authentication, etc. None of this code is shared with the browser-side app.
Further, none of these files are transpiled by Next.js, so we must use
Node-style imports.
