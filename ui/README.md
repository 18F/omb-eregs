# OMB eRequirements UI App

The primary public and agency-facing interface for the OMB eReqs data is a
Node-based app largely contained in this directory. Build scripts and
configuration are in the project's root directory -- see that README for
instructions on how to build and run this code.

## Isomorphism

One of the primary motivators for using Node in this application is the
potential for easy parity between client-side (browser), AJAX-based rendering
and server-side rendering. This ability to render the same markup, client or
server side is also known as "isomorphic" Javascript. This app is designed to
serve the same (or nearly the same) content regardless of whether or not the
user's browser has Javascript enabled.

One implication of this is that the app state is almost entirely defined by
the URL requested. As a result, we do not (currently) use redux or similar to
store our application state and handle events. Instead, the URL is compared
against our routes (via `react-router`) to determine which components to
render. Users which have a push-state-capable browsers will not hit the Node
server as they navigate between "pages" -- data is queried from the API and
rendered into markup within the browser. As most pages will require data from
the API to render, we also utilize the `react-resolver` library, which
asynchronously grabs API results in the browser but performs synchronously
when rendered server-side.

Given this context, it's accurate to say that this app is *both* a single-page
application and a traditional server-rendered application, depending on the
browser's capabilities. While most single-page apps render an initial, empty
page to be filled with content rendered in the browser, we instead render each
full page on the server and then hand off control to the browser's Javascript
for future renders. The upshot is that we ensure all users see the same
content; the downside is that the initial page load is larger. We may optimize
this process in the future.
