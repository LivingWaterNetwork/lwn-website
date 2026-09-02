// In the app, `import "server-only"` is what guarantees the registry can never
// be pulled into a client bundle. Under Vitest there is no client bundle, so the
// guard is stubbed out to let the test import the module the way a server
// component does. Nothing else about the module changes.
export {};
