# Gamified SRS for Solana Developers - Proof of Discipline

Product Requirement Document (PRD)

## Section 1: Goals and Background Context

### Goals

- Define the functional and non-functional requirements for the Gamified SRS
  platform, focusing on the initial "Proof of Discipline" mechanism.
- Specify the core features for the Anchor Program MVP (2-week scope).
- Establish a clear understanding of the user interface design goals for the
  future mobile application.
- Document the technical assumptions and constraints for the initial development
  phase.
- Create a high-level plan (epics and stories) for the initial Anchor Program
  development.

### Background Context

This PRD outlines the requirements for a Gamified Spaced Repetition System (SRS)
tailored for Solana developers. The platform's unique value proposition is the
integration of a "Proof of Discipline" mechanism. Users initialize a vault with
SOL into an on-chain vault managed by Solana Anchor programs. They must perform
daily actions (e.g., SRS check-ins) to maintain their commitment streak. Upon
successful completion, they can withdraw their deposit and mint a verifiable NFT
credential.

The initial development phase (MVP) focuses exclusively on building and testing
the core Solana Anchor programs that implement this mechanism. This includes the
logic for initialization, daily check-ins, withdrawal conditions, and the
interaction with the NFT minting program. A subsequent phase will integrate
these proven programs with a user-facing mobile application and backend
services.

### Change Log

| Date       | Version | Description                          | Author |
| ---------- | ------- | ------------------------------------ | ------ |
| 2025-07-31 | 1.0.0   | Initial draft based on Project Brief | Indra  |

## Section 2: Requirements

### Functional Requirements (FR)

Functional Requirements (FRs) define _what_ the system must do. They describe
the specific behaviors, features, and functionalities that the software must
provide to the user. These are typically expressed as "The system SHALL..."
statements. For this project, FRs focus on the core actions and rules of the
"Proof of Discipline" mechanism implemented in the Solana Anchor programs.

1. **FR1:** The system SHALL allow a user to initialize a vault with a specified
   amount of SOL, **which must be greater than zero**, into a dedicated on-chain
   vault (Anchor program).
2. **FR2:** The `streak_target` provided during initialization **MUST be greater
   than zero**.
3. **FR3:** The system SHALL record the timestamp of the initialization.
4. **FR4:** The system SHALL allow a user to perform a "check-in" action,
   verifying their engagement with the learning process, by interacting with the
   vault program.
5. **FR5:** The system SHALL enforce a time-based rule for check-ins, requiring
   them to occur within a defined window relative to the last check-in or
   initialization. This will be based on `Clock::unix_timestamp`.
6. **FR6:** The system SHALL track the user's consecutive check-in streak.
7. **FR7:** The system SHALL allow a user to initiate a withdrawal request from
   the vault.
8. **FR8:** The system SHALL validate that the user has completed the required
   number of check-ins (streak target) before allowing withdrawal.
9. **FR9:** The system SHALL transfer the deposited SOL back to the user's
   wallet upon successful withdrawal validation.
10. **FR10:** The system SHALL close the vault account upon successful
    withdrawal.
11. **FR11:** The system SHALL require a user's client to send an instruction to
    the `nft-minter` program to initialize a `MintPermit` account _before_
    attempting to withdraw from the `srs-vault`.
12. **FR12:** Upon successful withdrawal and closure of the vault account, the
    `srs-vault` program SHALL perform a Cross-Program Invocation (CPI) to the
    `nft-minter` program to _populate_ the verifiable, single-use `MintPermit`
    with a creation timestamp, authorizing the user to mint an NFT.
13. **FR13:** The system SHALL provide a separate, permissionless program
    (`nft-minter`) for minting a unique NFT credential.
14. **FR14:** The `nft-minter` program SHALL require a valid, populated "Mint
    Permit" to proceed with minting.
15. **FR15:** The `nft-minter` program SHALL consume and close the "Mint Permit"
    upon successful NFT creation.
16. **FR16:** The "Mint Permit" SHOULD contain metadata linking it to the
    specific commitment, such as the `deck_id` associated with the vault.
17. **FR17:** The minted NFT SHOULD include metadata reflecting the commitment
    details (e.g., streak length, completion date).
18. **FR18:** The system SHALL handle errors gracefully, particularly if the CPI
    to populate the Mint Permit fails after the vault is closed.

### Non-Functional Requirements (NFR)

Non-Functional Requirements (NFRs) define _how_ the system should behave or
perform. They describe quality attributes, constraints, and characteristics of
the system, such as security, performance, usability, and reliability. These are
often constraints on the implementation or operational environment. For this
project, NFRs focus on the technical standards, testing, and security practices
for the Anchor programs.

1. **NFR1:** The Anchor programs MUST be implemented using the Anchor framework
   for Solana.
2. **NFR2:** All on-chain programs MUST be written in Rust.
3. **NFR3:** The programs MUST handle standard Solana account and transaction
   errors gracefully.
4. **NFR4:** The programs MUST include comprehensive unit and integration tests
   covering all functional requirements (FR1-FR17) and relevant edge cases.
5. **NFR5:** Test coverage MUST aim for a minimum of 85% line coverage.
6. **NFR6:** The programs MUST be designed with security best practices,
   including checks for account ownership, data validation, and protection
   against common vulnerabilities (e.g., reentrancy).
7. **NFR7:** Program documentation MUST be generated from code comments and
   include clear explanations of program flow, account structures (PDAs), and
   instruction parameters.
8. **NFR8:** The time window logic for check-ins MUST be implemented using
   Solana's `Clock::unix_timestamp`.
9. **NFR9:** The build and deployment process for the Anchor programs MUST be
   clearly defined and reproducible.
10. **NFR10:** The Anchor programs MUST be deployed to the Solana Devnet for the
    POC MVP.
11. **NFR11:** Program testing SHALL be conducted using `vitest` with
    `@solana/kit` and `solana-kite` for a modern, type-safe testing experience.
    While the testing framework has limitations in advancing blockchain time, a
    workaround (temporarily modifying the program's check-in interval) will be
    used to test time-sensitive logic where possible.
12. **NFR12:** Final validation SHALL be performed using the `vitest` test suite
    on Devnet for a real network environment.

## Section 3: User Interface Design Goals

For the initial MVP (Anchor programs), there is no user interface. Interaction
with the programs will be via scripts or command-line tools for demonstration
and testing purposes.

For the subsequent phase (Full Product), the UX vision is a mobile-first
application that provides an intuitive and engaging learning experience. The app
should make it easy for users to review flashcards, track their progress, and
participate in the "Proof of Discipline" commitment seamlessly. The gamification
elements (streaks, NFTs) should feel rewarding and motivating without being
overwhelming.

- **Simple Onboarding:** Streamlined process for connecting a Solana wallet.
- **Effortless SRS Review:** Quick, focused flashcard review sessions.
- **Clear Commitment Path:** Transparent process for initializing, tracking
  check-ins, and viewing rewards.
- **Seamless Wallet Integration:** Minimize friction for signing transactions
  related to initialization, check-ins, withdrawal, and NFT minting.

**Core Screens and Views (Future Product):**

- Wallet Connection Screen
- Dashboard/Overview Screen (showing streak, next review, NFTs)
- SRS Flashcard Review Screen
- Commitment/Vault Management Screen (initialize, check-in history, withdraw)
- NFT Gallery/Collection Screen

**Accessibility:** None (for the Anchor MVP). Future product: WCAG AA.

**Branding:** The platform's identity should reflect the intersection of
learning and blockchain technology. A clean, modern aesthetic with potential
visual elements hinting at "growth" or "chains" could be suitable. Specific
branding details will be developed for the frontend phase.

**Target Device and Platforms:** MVP (Anchor Programs): N/A (Backend/On-chain
logic). Future Product: Mobile First (React Native targeting Android/iOS).

## Section 4: Technical Assumptions

### Repository Structure

Monorepo. This structure will house the Anchor programs, future frontend code,
and backend services in a single repository for easier management and shared
configurations.

### Service Architecture

Microservices (within Monorepo). The Anchor programs on Solana act as the core
commitment service. Future backend services (e.g., user accounts, SRS content
delivery via Convex) will be separate logical services, potentially deployable
independently, even within the monorepo structure.

### Testing & Development Environment

Full Testing Pyramid (for the Anchor Programs) using modern Solana tooling with
`vitest`, `@solana/kit`, and `solana-kite`.

- **Unit Tests:** For individual functions and instruction handlers within the
  Anchor programs, leveraging modern testing frameworks for core functionality
  testing. Note that precise time simulation for check-in windows will be
  deferred.
- **Integration Tests:** For testing the interaction between program
  instructions, account state changes, and the flow between the `srs-vault` and
  `nft-minter` programs. These tests will cover the full user flow from
  Initialize to Withdraw to Mint NFT, using modern tooling. Time-based logic
  testing will be deferred. Final validation will also occur on Devnet.

### Additional Technical Assumptions and Requests

- **Time-Based Logic:** Daily check-ins will use Solana's
  `Clock::unix_timestamp` for more intuitive time handling compared to slots. A
  "day" is defined as a 24-hour period based on this Unix timestamp.
- **PDA Structure:** The `srs-vault` program will manage a PDA for each
  user-commitment pair, storing initial deposit amount, timestamps, and streak
  data. The `nft-minter` program will interact with a temporary "Mint Permit"
  PDA generated by the `srs-vault`.
- **Mint Permit Mechanism:** The process of issuing an NFT credential requires
  two separate programs and a client-side step. First, before a user can
  withdraw, the client must call the `initialize_mint_permit` instruction on the
  `nft-minter` program to create an empty `MintPermit` PDA. Then, upon
  successful completion of the commitment (streak target met and withdrawal
  initiated), the `srs-vault` program will perform a Cross-Program Invocation
  (CPI) to the `nft-minter` program's `create_mint_permit` instruction. This CPI
  _populates_ the existing `MintPermit` PDA with a creation timestamp. This
  populated `MintPermit` serves as proof of successful commitment completion and
  is required by the `nft-minter` program to mint the NFT credential. The
  `MintPermit` PDA will be closed by the `nft-minter` program upon successful
  NFT minting, preventing its reuse.
- **Metaplex Integration:** The NFT minting will use standard Metaplex libraries
  for creating the credential NFTs.
- **Development & Testing Environment:** Development and testing will be
  conducted using modern Solana tooling including `vitest` with `@solana/kit`
  and `solana-kite` for a modern, type-safe testing experience. Comprehensive
  testing of time-sensitive logic (e.g., precise check-in window validation)
  will be deferred to a future phase when we implement more advanced simulation
  tools. The final MVP will be deployed to Solana Devnet.

## Section 5: Potential Improvements and Considerations

This section outlines potential enhancements and important considerations for
future iterations or if time permits during the MVP phase.

- **MintPermit Expiration:** Add a timestamp to MintPermit PDAs with an
  expiration window (e.g., 30 days) to prevent indefinite unused permits. This
  would require the `nft-minter` program to check the permit's age before
  allowing minting. This will be considered for future iterations.
- **Vault Reference in MintPermit:** The `MintPermit` PDA will store a reference
  to the commitment it originated from, likely the `deck_id`. Since the `Vault`
  PDA is closed upon withdrawal, storing the full vault account pubkey is
  unnecessary. The `deck_id` is sufficient for context and linking the NFT to
  the specific learning content.
- **NFT Metadata:** Ensure the NFT metadata includes meaningful information
  about the commitment (streak length, completion date, `deck_id`, etc.). This
  makes the NFT a richer proof of achievement.
- **Error Handling:** Consider what happens if the CPI to create MintPermit
  fails after the vault is already closed and SOL transferred. This is a
  critical failure scenario.
  - **Atomicity:** Investigate if the withdrawal and CPI can be made part of a
    single atomic transaction or if a compensating transaction mechanism is
    needed.
  - **State:** If the CPI fails, the user has fulfilled their commitment but
    cannot mint the NFT. The system should provide a clear path for the user to
    resolve this (e.g., a manual admin function, or a retry mechanism if the
    failure was transient).
