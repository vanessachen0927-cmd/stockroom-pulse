# Stockroom Pulse

A real-time inventory exception investigation workspace built with React, TypeScript, DeepSpace, and Cloudflare Workers.

Live application: https://stockroom-pulse.app.space/stockroom

## Problem

Inventory records can disagree with physical counts, identifiers can be missing, and stock quantities can become negative. Detecting these problems is only part of the solution: teams also need a reliable way to investigate and resolve them.

Stockroom Pulse combines deterministic discrepancy detection with a collaborative investigation workflow.

## Features

- CSV inventory ingestion and validation
- Missing-SKU, negative-stock, and quantity-mismatch detection
- Stable exception fingerprints and duplicate prevention
- Searchable investigation dashboard
- Investigation notes and resolution summaries
- Authenticated server-side resolution validation
- Shared real-time records and operations messaging

## Architecture

The React and TypeScript frontend handles user interaction.

A separate reconciliation module parses inventory CSV data, validates inputs, and generates deterministic exception records.

DeepSpace manages authentication, synchronized records, messaging, and collection permissions.

A Cloudflare Worker exposes the updateInvestigation server action. It checks application membership, validates status transitions, and rejects resolution attempts without a nonempty summary.

DeepSpace Durable Objects provide the underlying record infrastructure.

## DeepSpace Integrations

1. Authentication protects access to the workspace.
2. Real-time records synchronize inventory exceptions and investigation notes.
3. Messaging provides a shared operations discussion channel.

## Technical Decisions

The reconciliation engine is independent of React so its behavior can be tested without rendering the interface.

Stable fingerprints identify recurring exceptions across imports. Server-side uniqueness constraints provide an additional duplicate-prevention boundary.

Resolution validation runs in a server action rather than relying on client-side checks alone.

The implementation uses DeepSpace's platform primitives instead of introducing another database, authentication service, or WebSocket server.

## Tradeoffs and Limitations

CSV import was chosen over live inventory integrations to keep the evaluation self-contained and avoid external credentials.

The sample inventory data is synthetic.

The current investigation action reads the existing record before updating it. This does not guarantee atomic conflict resolution for simultaneous edits.

The current scope does not include automatic inventory adjustments, external ERP writes, or multi-organization isolation.

Potential next improvements include transactional state transitions, stronger audit events, and concurrency-safe mutation handling.

## Verification

The reconciliation engine has eight passing unit tests covering CSV parsing, invalid inputs, duplicate identifiers, anomaly detection, and stable fingerprints.

Three scaffold tests also pass.

Production verification completed on November 17, 2026:

- Authenticated access to the deployed application
- Successful import of six synthetic inventory exceptions with zero rejected rows and zero failed writes
- Cross-device inventory status synchronization between Mac and Windows without refreshing
- Cross-device operations messaging without refreshing

Both computers demonstrated synchronization. Separate-account authorization has not yet been independently verified.

## Local Development

npm install
npx deepspace auth login
npx deepspace dev start

## Deployment

npx deepspace deploy

## Ownership

Built as an independent DeepSpace engineering exercise using synthetic data and original application logic.
