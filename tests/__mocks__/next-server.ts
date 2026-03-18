// Mock next/server for unit tests.
// Pure object mock — no browser globals (Response, Request) needed.
// Unit tests of pure functions (hasPermission, rbac) just need the module to import.

const NextResponse = {
  json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
    status: init?.status ?? 200,
    headers: new Map(Object.entries(init?.headers ?? {})),
    json: async () => body,
    body,
  }),
};

const NextRequest = class {};

module.exports = { NextResponse, NextRequest };
