# High Level Overview

1. **User Commits SOL to a Time-Lock Vault**
    * The user connects their wallet and selects a learning commitment (e.g., "Master Anchor Basics in 30 days").
    * An on-chain 'Vault' account (a Program Derived Address) is created specifically for the user.
    * The user's committed SOL is transferred from their wallet into this new on-chain vault.
    * The vault stores the user's identity, the amount of SOL staked, and the final unlock date.

2. **The Commitment Period Begins**
    * The user studies the SRS flashcards on the project's website (this is an off-chain activity).
    * The staked SOL remains locked in the on-chain vault, secured by the program's rules.
    * The frontend application can track the user's study progress and streak off-chain for gamification.

3. **User Withdraws SOL After Commitment Ends**
    * Once the unlock date stored in the vault has passed, the user becomes eligible to withdraw.
    * The on-chain program verifies that the current date is past the required unlock date.
    * The program transfers the full amount of staked SOL from the vault back to the user's wallet.
    * The on-chain vault account is closed, and the rent SOL is returned to the user.


```mermaid
sequenceDiagram
    actor Learner
    participant FE as Frontend
    participant VP as Vault Program

    Learner->>+FE: Connect Wallet and select deck
    FE-->>-Learner: Show staking options

    Learner->>+FE: Click "Stake"
    FE->>+VP: stake(amount, duration)
    VP-->>-FE: Transaction Success
    FE-->>-Learner: Staking Confirmed

    Note over Learner,FE: User studies SRS content off-chain

    Learner->>+FE: Click "Withdraw"
    FE->>+VP: withdraw()
    Note right of VP: Verifies time lock has passed
    VP-->>-FE: Returns SOL to user
    FE-->>-Learner: Withdrawal Complete!
```
