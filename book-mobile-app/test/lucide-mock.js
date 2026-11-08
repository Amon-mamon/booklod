// Jest-only stub: every lucide icon becomes a no-op component.
module.exports = new Proxy({}, { get: (_t, name) => (name === "__esModule" ? false : () => null) });
