import app from './index.js';

// app export is the Express application. But app.listen is called inside index.js synchronously!
// Wait! If app.listen is called inside index.js synchronously, index.js doesn't export the server instance.
// But we can override app.listen or wrap the server.
// Actually, we can intercept app.listen in index.js by looking at how index.js is structured.
// In index.js:
// app.listen(PORT, ...)
// Wait, index.js executes app.listen immediately on import.
// How can we get the server instance?
// We can modify index.js to export the server, or we can just listen to the events.
// Wait, can we listen to the server events by hacking into Express?
// Express doesn't expose the server until listen is called. But we can modify index.js temporarily to log events!
