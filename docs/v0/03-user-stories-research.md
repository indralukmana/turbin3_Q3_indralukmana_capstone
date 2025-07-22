# Appendix: User Story & On-Chain Requirement Definition Process

This document details the step-by-step process of defining user personas,
stories, and on-chain requirements for the Gamified SRS for Solana Developers
project.

---

## Part A: Initial User & Function Mapping

### 1. Manual User Brainstorming

**Output: Preliminary User List**

* **Direct Users:** New Solana Developers, Experienced Software Engineers,
    Hackathon Participants.
* **Indirect Users/Beneficiaries:** Solana Dev Shops, The Solana Community.
* **Stakeholders:** The Solana Foundation, Potential Investors.

### 2. AI-Assisted User Prioritization

**AI Prompt:**
"My project's value proposition is: 'A gamified SRS that helps developers
master Solana skills, featuring a **trustless, self-custodial commitment
vault** where users stake SOL, perform daily on-chain check-ins to maintain a
streak, and can mint a permissionless NFT credential upon completion.' Based on
this, which 2-3 user types are most critical for a POC?"

#### AI Output

1. **New Solana Developers / Experienced Software Engineers:** **(Primary)** They
    are the core users who validate the entire learning and commitment loop.
    Their willingness to stake SOL and perform daily check-ins is the central
    hypothesis to test.
2. **Hackathon Participants:** **(Primary)** This group is ideal for testing the
    novelty and appeal of the crypto-native mechanism. Their engagement would
    signal that the concept is compelling and understandable to a savvy Web3
    audience.
3. **Solana Dev Shops / Recruiters:** **(Secondary)** They validate the value of
    the NFT credential. If they recognize the on-chain commitment required to
    earn the NFT, it becomes a valuable signal of a candidate's dedication.

#### Manual Action & Output: Final Prioritized List

I agree with the AI's recommendations. The developer personas are essential for
testing the core loop, and the recruiter persona validates the outcome.

* **Final List:** New Solana Developer, Experienced Software Engineer, Hackathon
    Participant, Solana Dev Shop / Recruiter.

### 3. Core Function Mapping

**AI Prompt:**
"For a project with a trustless commitment vault and permissionless NFTs, and
focusing on [New Developer, Experienced Engineer, Hackathon Participant, and
Recruiter], map out the key functions for each."

#### AI Output: Key Functions Mapped to Users

* **Developer / Engineer / Hackathon Participant:**
  * Connect their wallet to the application.
  * Browse available learning decks.
  * Stake SOL in a time-locked vault to start a commitment period.
  * Perform a daily on-chain "check-in" transaction to maintain their
        streak.
  * Withdraw their SOL after the time-lock expires (if the streak was
        maintained).
  * Mint their NFT credential after a successful streak.
* **Solana Dev Shop / Recruiter:**
  * View a developer's public profile.
  * Verify the NFT credential by checking its on-chain history, confirming
        it was minted by the official program after a completed streak.

### 4. Deriving Core POC Requirements

**Manual Task:** The most critical interaction path is the end-to-end, trustless
user journey: Staking -> Daily Check-ins -> Withdrawal -> NFT Mint.

**AI Prompt:**
"Based on the critical user interaction of a developer staking SOL, performing
daily on-chain check-ins for 30 days, withdrawing their SOL, and minting an
NFT, what are the key technical requirements for a POC?"

#### AI Output: Initial Technical Requirements

* A web application with wallet-based authentication.
* A database for off-chain data like deck content and user-facing stats.
* A frontend interface for learning (SRS) and for interacting with the
    on-chain programs.
* An on-chain vault program with functions for:
  * `stake(amount, duration)`: Locks user's SOL in a PDA.
  * `checkIn()`: Allows a user to record a daily transaction.
  * `withdraw()`: Allows a user to reclaim their SOL if conditions are met.
* An on-chain NFT minter program with a function like `mintCredential()` that
    can be called by a user only after the vault program confirms their streak.

---

## Part B: Adversarial Analysis & Granularity Check

**AI Prompt:**
"Review my trustless user functions and requirements. What's missing or
unclear? Are the requirements granular enough?"

#### AI Output (Critique)

This is a much stronger, more decentralized model. Key areas to refine:

* **On-Chain State:** The requirements don't specify what data needs to be
    stored on-chain in the vault PDA. You need to store `start_date`,
    `end_date`, `last_check_in_date`, and `streak_counter`.
* **Time Zone Issues:** "Daily" check-in is ambiguous. The smart contract must
    rely on Solana's slot or block timestamp, which can be manipulated. You
    need to define a day as a fixed number of slots and acknowledge this is an
    approximation.
* **Slashing Mechanism:** What happens if a user misses a day? The requirements
    don't define the penalty. You need a `slash()` function or similar logic
    to handle broken streaks.
* **NFT Minting Authority:** How does the NFT program know the user completed
    the streak? The vault program needs to grant a "mint token" (a specific
    on-chain receipt or PDA) that the NFT program can verify and consume.

#### Documentation of Refinements

The critique is excellent. The on-chain state and the interaction between the
two programs are critical.

* **Refined Requirement 1 (State):** The vault PDA will store: `user_pubkey`,
    `stake_amount`, `start_timestamp`, `duration`, `last_check_in_timestamp`,
    and `streak_counter`.
* **Refined Requirement 2 (Time):** A "day" will be defined as 86,400 slots
    (an approximation of 24 hours).
* **Refined Requirement 3 (Slashing):** If a user calls `checkIn()` and
    `current_slot > last_check_in_slot + 86400`, the streak is broken. A
    portion of the stake is transferred to a treasury, and the remainder is
    unlocked for withdrawal.
* **Refined Requirement 4 (Mint Token):** Upon successful completion, the
    vault program will create a `MintPermit` PDA, which is owned by the user.
    The NFT program's `mintCredential()` function will require this `MintPermit`
    as an account, verify it, and then close it to prevent reuse.

---

## Part C: Granularity & Clarity Refinement

#### Part C Refinement Log

* **Story 1:**
  * **Before:** "User stakes SOL and starts learning."
  * **After:**
        1. "User selects a learning deck."
        2. "User approves the transaction to stake SOL in a time-locked vault."
  * **Rationale:** Separated user choice from the on-chain action.

* **Story 2:**
  * **Before:** "User claims their unlocked SOL."
  * **After:**
        1. "User performs a daily on-chain check-in."
        2. "After the commitment period ends, the user withdraws their staked
            SOL."
  * **Rationale:** Clarified the two distinct actions: the daily commitment
        and the final withdrawal.

---

## Part D: Defining Potential On-Chain Requirements

**User Story 1: User approves the transaction to stake SOL in a time-locked
vault.**

* **Potential On-Chain Requirements:**
  * A `stake` function that accepts SOL from the user.
  * Creates a vault PDA seeded with the user's key and deck ID.
  * The PDA must store: `user_pubkey`, `stake_amount`, `start_timestamp`,
        `duration`, `last_check_in_timestamp` (initialized to `start_timestamp`),
        and `streak_counter` (initialized to 1).

**User Story 2: User performs a daily on-chain check-in.**

* **Potential On-Chain Requirements:**
  * A `checkIn` function that requires the user's vault PDA.
  * It must verify that `current_timestamp` is within the allowed window
        (e.g., `> last_check_in_timestamp + (24h - buffer)` and `< last_check_in_timestamp + (48h - buffer)`).
  * If the check-in is valid, it updates `last_check_in_timestamp` and
        increments `streak_counter`.
  * If the check-in is late, it triggers a slashing mechanism.

**User Story 3: After the commitment period ends, the user withdraws their
staked SOL.**

* **Potential On-Chain Requirements:**
  * A `withdraw` function that requires the user's vault PDA.
  * It must verify that `current_timestamp > start_timestamp + duration`.
  * It must verify that the `streak_counter` matches the `duration` (in
        days).
  * If conditions are met, it transfers the SOL from the PDA back to the
        user and closes the PDA account.

**User Story 4: User mints their NFT credential.**

* **Potential On-Chain Requirements:**
  * The `withdraw` function, upon success, should also create a `MintPermit`
        PDA for the user.
  * A separate NFT program with a `mintCredential` function.
  * This function requires the user to provide their `MintPermit` PDA.
  * The function verifies the permit, mints a Metaplex NFT to the user, and
        closes the `MintPermit` PDA.
