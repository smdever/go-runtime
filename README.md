# go-runtime scaffold

Executable-first Node.js host for GO / LOKIPAI flows.

This scaffold preserves the agreed architecture:
- one host runtime product
- sibling execution engines
- shared outward commands, events, and snapshots
- separate inward memory models
- one worker process per active run

## Current state

This scaffold is intentionally low-level and stubbed.

Implemented in structure:
- contracts
- canonical runtime event and snapshot surface
- executable engine loading and runtime stubs
- worker/IPC skeleton
- operator/orchestrator shell
- route wiring

Not yet implemented:
- real connector integrations
- full executable runtime hooks
- interpretive engine behavior
- persistence
- SSE/websocket streaming

## Commands

```bash
npm install
npm run dev
npm run build
npm start
```
