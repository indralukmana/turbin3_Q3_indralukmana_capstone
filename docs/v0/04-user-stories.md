# User Stories & On-Chain Requirements

This document presents the final, refined user personas, core functions, and
on-chain requirements for the Gamified SRS for Solana Developers project.

---

## 1. Core User Personas

- **New Solana Developer:** A recent graduate motivated to learn Solana and
  build a verifiable portfolio in a decentralized way.
- **Experienced Software Engineer:** A professional pivoting to Web3 who values
  transparent, code-enforced rules over centrally-administered systems.
- **Hackathon Participant:** An indie builder drawn to novel, crypto-native
  mechanisms who needs to learn quickly.
- **Solana Dev Shop / Recruiter:** A manager who needs to verify talent and
  values on-chain proof of a candidate's commitment and consistency.

---

## 2. Core Function Mapping

### Primary Users (Developer, Engineer, Hackathon Participant)

- Connect a wallet to the application.
- Browse and select a learning deck.
- Initialize a vault with SOL to begin a commitment period.
- Perform a daily on-chain "check-in" to maintain their study streak.
- Withdraw their deposited SOL after the study streak is complete.
- Mint a permissionless NFT credential as proof of their completed streak.

### Secondary Users (Solana Dev Shop / Recruiter)

- View a developer's public profile.
- Verify an NFT credential by inspecting its on-chain history, confirming it was
  minted via the official program after a successful commitment period.

---

## 3. User Stories & Potential On-Chain Requirements

### User Story 1: User connects their wallet to sign up for an account

- **On-Chain Requirements:** None. This is an off-chain authentication action.

### User Story 2: User approves the transaction to initialize a vault with SOL to begin a study streak

- **Potential On-Chain Requirements:**
  - An `initialize` function on the vault program that accepts a SOL transfer.
  - It must create a vault PDA (Program Derived Address) seeded with the user's
    public key and a deck identifier.
  - The PDA must store the `user_pubkey`, `initial_deposit_amount`,
    `start_timestamp`, a `streak_target` (e.g., 30 days),
    `last_check_in_timestamp`, and a `streak_counter`.

### User Story 3: User performs a daily on-chain check-in

- **Potential On-Chain Requirements:**
  - A `checkIn` function on the vault program.
  - Must verify that the time since `last_check_in_timestamp` is within the
    allowed daily window (e.g., between 20 and 48 hours) to prevent spamming and
    allow for a grace period.
  - If the check-in is valid, it updates `last_check_in_timestamp` and
    increments the `streak_counter`.

### User Story 4: After the study streak is complete, the user withdraws their deposited SOL

- **Potential On-Chain Requirements:**
  - A `withdraw` function on the vault program.
  - Must verify that the `streak_counter` meets the `streak_target`.
  - If successful, it transfers the deposited SOL from the vault PDA back to the
    user's wallet and closes the PDA account.

### User Story 5: User mints their NFT credential

- **Potential On-Chain Requirements:**
  - Upon successful withdrawal, the vault program creates a short-lived
    `MintPermit` PDA for the user.
  - A separate, permissionless NFT Minter program has a `mintCredential`
    function.
  - This function requires the user to provide their `MintPermit` PDA as proof.
  - The function verifies the `MintPermit`, mints the NFT to the user, and
    closes the permit account to ensure it cannot be used again.
