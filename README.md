# Gamified SRS for Solana Developers - Proof of Discipline

This project is a Gamified Spaced Repetition System (SRS) for Solana developers,
featuring a unique "Proof of Discipline" mechanism built on the Solana
blockchain with Anchor.

## 📜 Executive Summary

This project initiates the development of a Gamified Spaced Repetition System
(SRS) specifically tailored for Solana developers. The platform aims to enhance
learning efficiency for complex Solana technologies (Rust, Anchor, SPL,
Metaplex) by combining proven SRS techniques with light gamification. The key
innovation is the integration of a unique, trustless "Proof of Discipline"
mechanism, where users initialize a vault with SOL as a commitment to their
learning goals. Daily on-chain actions are required to maintain the streak;
successful completion unlocks the deposit and grants a verifiable,
permissionless NFT credential, serving as a blockchain-based proof of dedication
and mastery.

## 📚 Project Documentation

For a deeper dive into the project's planning and design, please refer to the
following documents:

- **[Project Brief](./docs/brief.md):** A high-level overview of the project,
  outlining the problem, proposed solution, target users, and MVP scope. It's
  the "why" and "what" of the project at a glance.

- **[Product Requirements Document (PRD)](./docs/prd.md):** Details the specific
  functional and non-functional requirements, user stories, and technical
  specifications for the initial Anchor Program development.

- **[Technical Architecture](./docs/architecture.md):** The technical blueprint
  for developers, describing the architecture of the Solana Anchor programs,
  data models (PDAs), program components, core workflows, and testing
  strategies.

## 🎯 Project Overview

### The Problem

Mastering the Solana development stack is challenging. Existing resources often
lack structured methods for long-term knowledge retention (like SRS) and fail to
provide compelling motivation for consistent study, leading to high drop-off
rates for aspiring developers.

### The Solution

We are building a Gamified SRS platform that combines:

1. **Spaced Repetition:** To optimize long-term retention of complex Solana
   concepts.
2. **Trustless Commitment Vault:** A core feature where users lock SOL in an
   on-chain vault to commit to a learning streak. Daily on-chain "check-ins" are
   required. The smart contract enforces the rules, returning the SOL only upon
   successful completion.
3. **Permissionless NFT Credentials:** Upon completing a streak, users can mint
   a unique NFT as a verifiable proof of their achievement and dedication.

## ✨ Core Features

The core of this project is built around two Solana Anchor programs:

- **`srs-vault` Program:**
  - Allows users to initialize a vault, depositing SOL as a commitment.
  - Tracks a user's daily "check-in" streak using on-chain timestamps.
  - Enforces the rules of the commitment (e.g., daily check-in window).
  - Upon successful completion of the streak, returns the user's SOL.
  - Issues a secure, single-use "Mint Permit" via a Cross-Program Invocation
    (CPI) to the `nft-minter` program.

- **`nft-minter` Program:**
  - A permissionless program that mints a verifiable NFT credential.
  - Requires a valid "Mint Permit" from the `srs-vault` program to authorize the
    mint.
  - Consumes the permit after minting to ensure it cannot be reused.
  - The NFT metadata reflects the details of the user's achievement (e.g.,
    streak length, completion date).

## 🛠️ Tech Stack

- **Language**: Rust 1.89.0+
- **Framework**: Anchor 0.31.1
- **NFT Standard**: Metaplex
- **Testing**: `vitest` with `@solana/kit` and `solana-kite`
- **Client Generation**: Codama for type-safe TypeScript clients from Anchor
  IDLs.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/)
- [Anchor](https://www.anchor-lang.com/)

### Installation

1. Install NPM packages

   ```sh
   pnpm install
   ```

## ⚙️ Solana

### Build

```sh
anchor build
```

### Devnet

The programs have been deployed to Solana's devnet.

- **`srs_vault` Program ID:** `BFuf7XCHjRwX8Y8i7ZGu9NarbhAzLVMV1GykooSF67Aq`
- **`nft_minter` Program ID:** `6NHGoEbEbq4ePyCsSHVr6rViFzL3EJ2DpMdfngpPkwKa`

## 🧪 Running Tests

To run the tests, run the following command:

```sh
pnpm test
```
