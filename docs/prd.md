# Gamified SRS for Solana Developers - Proof of Discipline Product Requirements Document (PRD)

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
   amount of SOL into a dedicated on-chain vault (Anchor program).
2. **FR2:** The system SHALL record the timestamp of the initialization.
3. **FR3:** The system SHALL allow a user to perform a "check-in" action,
   verifying their engagement with the learning process, by interacting with the
   vault program.
4. **FR4:** The system SHALL enforce a time-based rule for check-ins, requiring
   them to occur within a defined window relative to the last check-in or
   initialization. This will be based on `Clock::unix_timestamp`.
5. **FR5:** The system SHALL track the user's consecutive check-in streak.
6. **FR6:** The system SHALL allow a user to initiate a withdrawal request from
   the vault.
7. **FR7:** The system SHALL validate that the user has completed the required
   number of check-ins (streak target) before allowing withdrawal.
8. **FR8:** The system SHALL transfer the deposited SOL back to the user's
   wallet upon successful withdrawal validation.
9. **FR9:** The system SHALL close the vault account upon successful withdrawal.
10. **FR10:** Upon successful withdrawal and closure of the vault account, the
    system SHALL perform a Cross-Program Invocation (CPI) to the `nft-minter`
    program to generate a verifiable, single-use "Mint Permit" that authorizes
    the user to mint an NFT. This permit SHOULD include a creation timestamp.
11. **FR11:** The system SHALL provide a separate, permissionless program
    (`nft-minter`) for minting a unique NFT credential.
12. **FR12:** The `nft-minter` program SHALL require a valid "Mint Permit" from
    the `vault` program to proceed with minting.
13. **FR13:** The `nft-minter` program SHALL consume and close the "Mint Permit"
    upon successful NFT creation.
14. **FR14:** The "Mint Permit" SHOULD contain metadata linking it to the
    specific commitment, such as the `deck_id` associated with the vault.
15. **FR15:** The minted NFT SHOULD include metadata reflecting the commitment
    details (e.g., streak length, completion date).
16. **FR16:** The system SHALL handle errors gracefully, particularly if the CPI
    to create the Mint Permit fails after the vault is closed.

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
   covering all functional requirements (FR1-FR16) and relevant edge cases.
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
11. **NFR11:** Program testing SHALL be conducted exclusively using `litesvm`
    for accurate simulation of time-based logic and program interactions. Local
    development and testing will rely on `litesvm`.
12. **NFR12:** Final end-to-end validation SHALL be performed using `litesvm`
    for detailed testing and on Devnet for a real network environment.

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

Full Testing Pyramid (for the Anchor Programs) using `litesvm`.

- **Unit Tests:** For individual functions and instruction handlers within the
  Anchor programs, leveraging `litesvm` for accurate time simulation.
- **Integration Tests:** For testing the interaction between program
  instructions, account state changes, and the flow between the `vault` and
  `nft-minter` programs, using `litesvm`.
- **End-to-End Tests:** Scripts demonstrating the full user flow (Initialize ->
  Check-in(s) -> Withdraw -> Mint NFT) will be developed and run locally using
  `litesvm`. Final validation will also occur on Devnet.

### Additional Technical Assumptions and Requests

- **Time-Based Logic:** Daily check-ins will use Solana's
  `Clock::unix_timestamp` for more intuitive time handling compared to slots. A
  "day" is defined as a 24-hour period based on this Unix timestamp. `litesvm`
  supports manipulating this for testing.
- **PDA Structure:** The `vault` program will manage a PDA for each
  user-commitment pair, storing initial deposit amount, timestamps, and streak
  data. The `nft-minter` program will interact with a temporary "Mint Permit"
  PDA generated by the `vault`.
- **Mint Permit Mechanism:** Upon successful completion of the commitment
  (streak target met and withdrawal initiated), the `vault` program will perform
  a Cross-Program Invocation (CPI) to the `nft-minter` program to create a
  single-use `MintPermit` PDA. This `MintPermit` serves as proof of successful
  commitment completion and is required by the `nft-minter` program to mint the
  NFT credential. The `MintPermit` PDA will be closed by the `nft-minter`
  program upon successful NFT minting, preventing its reuse.
- **Metaplex Integration:** The NFT minting will use standard Metaplex libraries
  (like `mpl-token-metadata`) for creating the credential NFTs.
- **Development & Testing Environment:** Development and testing will be
  conducted exclusively using `litesvm` for its superior testing capabilities
  for time-sensitive logic. The final MVP will be deployed to Solana Devnet.

## Section 5: Epics and Stories

### Epic 1: Anchor Program Foundation & Core Logic Implementation

The objective of this epic is to deliver the functional core of the "Proof of
Discipline" mechanism by building and deploying the two primary Solana Anchor
programs: `vault` and `nft-minter`. This involves implementing the logic for
initializing vaults with SOL, tracking user check-ins, enforcing commitment
rules, and enabling the secure minting of NFT credentials upon successful
completion.

**Story 1.1: Implement Vault Program Initialization Logic** As a developer, I
want to implement the initialization logic in the `vault` Anchor program, so
that users can securely lock their SOL as a commitment.

- **AC 1.1.1:** The program SHALL define a `Vault` account struct with fields
  for `user`, `initial_deposit_amount`, `start_timestamp`,
  `last_check_in_timestamp`, `streak_target`, and `streak_counter`.
- **AC 1.1.2:** The program SHALL have an `initialize` instruction that takes
  `initial_deposit_amount` and `streak_target` (and implicitly, a `deck_id`) as
  parameters.
- **AC 1.1.3:** The `initialize` instruction SHALL initialize a new `Vault` PDA
  account, seeded by the user's public key and the `deck_id`.
- **AC 1.1.4:** The `initialize` instruction SHALL transfer the specified
  `initial_deposit_amount` of SOL from the user's wallet to the newly created
  `Vault` PDA.
- **AC 1.1.5:** The `initialize` instruction SHALL correctly initialize the
  `Vault` account fields: `user` to the signer, `initial_deposit_amount`,
  `start_timestamp` to the current `Clock::unix_timestamp`,
  `last_check_in_timestamp` to `start_timestamp`, `streak_target` as provided,
  and `streak_counter` to 1.
- **AC 1.1.6:** The program SHALL correctly calculate the required rent for the
  `Vault` PDA and ensure it is funded.

**Story 1.2: Implement Vault Program Check-In Logic** As a developer, I want to
implement the daily check-in logic in the `vault` Anchor program, so that the
program can track and enforce user commitment.

- **AC 1.2.1:** The program SHALL have a `check_in` instruction.
- **AC 1.2.2:** The `check_in` instruction SHALL require the user's `Vault` PDA
  account as a parameter.
- **AC 1.2.3:** The `check_in` instruction SHALL verify that the current time
  (from `Clock::unix_timestamp`) is within the acceptable window for a check-in,
  relative to `last_check_in_timestamp`.
- **AC 1.2.4:** The acceptable window SHALL be defined as _after_ a minimum
  interval (e.g., 20 hours) and _before_ a maximum interval (e.g., 48 hours)
  from the last check-in.
- **AC 1.2.5:** If the check-in is valid, the `check_in` instruction SHALL
  update the `last_check_in_timestamp` field in the `Vault` PDA to the current
  time.
- **AC 1.2.6:** If the check-in is valid, the `check_in` instruction SHALL
  increment the `streak_counter` field in the `Vault` PDA by 1.
- **AC 1.2.7:** If the check-in is invalid (too early or too late), the
  instruction SHALL return an appropriate error.

**Story 1.3: Implement Vault Program Withdrawal Logic** As a developer, I want
to implement the withdrawal logic in the `vault` Anchor program, so that users
can reclaim their SOL after fulfilling their commitment.

- **AC 1.3.1:** The program SHALL have a `withdraw` instruction.
- **AC 1.3.2:** The `withdraw` instruction SHALL require the user's `Vault` PDA
  account and the user's wallet account as parameters.
- **AC 1.3.3:** The `withdraw` instruction SHALL verify that the
  `streak_counter` in the `Vault` PDA is greater than or equal to the
  `streak_target`.
- **AC 1.3.4:** If the streak requirement is met, the `withdraw` instruction
  SHALL transfer the `initial_deposit_amount` of SOL from the `Vault` PDA back
  to the user's wallet.
- **AC 1.3.5:** If the streak requirement is met, the `withdraw` instruction
  SHALL close the `Vault` PDA account, returning its rent lamports to the user.
- **AC 1.3.6:** If the streak requirement is NOT met, the instruction SHALL
  return an appropriate error.
- **AC 1.3.7:** Upon successful withdrawal and closure of the vault account, the
  `withdraw` instruction SHALL perform a Cross-Program Invocation (CPI) to the
  `nft-minter` program to create a "Mint Permit" PDA for the user. This permit
  SHALL include the `deck_id` and a creation timestamp.

**Story 1.4: Implement NFT Minter Program & Mint Permit Logic** As a developer,
I want to create the `nft-minter` Anchor program and the logic for generating
and consuming Mint Permits, so that NFT credential minting is permissioned by
successful commitment completion.

- **AC 1.4.1:** The `nft-minter` program SHALL define a `MintPermit` account
  struct, linking it to a specific user and the `deck_id` associated with the
  completed commitment. It SHOULD include a `created_at` timestamp.
- **AC 1.4.2:** The `vault` program SHALL perform a CPI to the `nft-minter`
  program during the `withdraw` instruction (upon successful validation and
  account closure) to create the `MintPermit` PDA.
- **AC 1.4.3:** The `nft-minter` program SHALL have a `mint_credential`
  instruction.
- **AC 1.4.4:** The `mint_credential` instruction SHALL require the user's
  `MintPermit` PDA, the user's wallet, and necessary Metaplex accounts as
  parameters.
- **AC 1.4.5:** The `mint_credential` instruction SHALL verify the validity of
  the provided `MintPermit` PDA (e.g., correct seeds, ownership).
- **AC 1.4.6:** The `mint_credential` instruction SHALL use the Metaplex
  `mpl-token-metadata` library to mint a new NFT to the user's wallet. The NFT
  metadata SHALL reflect commitment details (e.g., `deck_id`, streak length,
  completion date).
- **AC 1.4.7:** The `mint_credential` instruction SHALL close the `MintPermit`
  PDA account upon successful NFT minting, preventing reuse.

### Epic 2: Anchor Program Testing & Documentation

The objective of this epic is to ensure the reliability, correctness, and
maintainability of the Anchor programs developed in Epic 1. This involves
writing extensive tests using `litesvm` and creating clear, comprehensive
documentation.

**Story 2.1: Develop Unit Tests for Vault Program** As a developer, I want to
write unit tests for the `vault` Anchor program, so that the individual
components and logic paths are verified for correctness.

- **AC 2.1.1:** Unit tests SHALL cover the `initialize` instruction, verifying
  account initialization, SOL transfer, and state setup under normal conditions.
- **AC 2.1.2:** Unit tests SHALL cover the `check_in` instruction, verifying the
  time window logic for valid and invalid check-ins using `litesvm`.
- **AC 2.1.3:** Unit tests SHALL cover the `withdraw` instruction, verifying the
  streak validation logic for both successful and failed withdrawal attempts.
- **AC 2.1.4:** Unit tests SHALL aim for high line coverage (e.g., >90%) for the
  `vault` program logic.
- **AC 2.1.5:** Unit tests SHALL include negative test cases to ensure
  appropriate errors are returned for invalid inputs or states.
- **AC 2.1.6:** Unit tests SHALL cover the error handling path where the CPI to
  create the Mint Permit fails after the vault is closed.

**Story 2.2: Develop Integration Tests for Anchor Programs** As a developer, I
want to write integration tests for the `vault` and `nft-minter` Anchor
programs, so that the interaction between programs and the end-to-end flow are
verified.

- **AC 2.2.1:** Integration tests SHALL simulate the full user journey:
  `initialize` -> `check_in`(s) -> `withdraw`, using `litesvm` for accurate time
  simulation.
- **AC 2.2.2:** Integration tests SHALL verify that the `MintPermit` PDA is
  correctly created by the `vault` program during a successful withdrawal,
  including the `deck_id` and timestamp.
- **AC 2.2.3:** Integration tests SHALL verify that the `nft-minter` program can
  successfully consume the `MintPermit` to mint an NFT with correct metadata.
- **AC 2.2.4:** Integration tests SHALL verify that the `MintPermit` PDA is
  closed after successful NFT minting.
- **AC 2.2.5:** Integration tests SHALL cover scenarios where the flow is
  interrupted (e.g., insufficient check-ins) and the correct state is
  maintained.
- **AC 2.2.6:** Integration tests SHALL cover the error handling path where the
  CPI to create the Mint Permit fails after the vault is closed.

**Story 2.3: Generate and Refine Program Documentation** As a developer, I want
to generate and refine documentation for the Anchor programs, so that the
architecture, usage, and deployment are clear for future development and users.

- **AC 2.3.1:** Documentation SHALL include a detailed explanation of the
  `Vault` and `MintPermit` PDA structures and their fields.
- **AC 2.3.2:** Documentation SHALL describe each instruction (`initialize`,
  `check_in`, `withdraw`, `mint_credential`) available in the programs,
  including parameters and expected outcomes.
- **AC 2.3.3:** Documentation SHALL explain the inter-program communication
  mechanism (CPI for Mint Permit creation).
- **AC 2.3.4:** Documentation SHALL provide clear instructions for building,
  testing (exclusively with `litesvm`), and deploying the programs to Devnet.
- **AC 2.3.5:** Documentation SHALL include example code snippets or scripts
  demonstrating how to interact with the programs.
- **AC 2.3.6:** Documentation SHALL discuss potential future improvements like
  `MintPermit` expiration and detailed error handling strategies.

## Section 6: Potential Improvements and Considerations

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
