# High level Overview

```mermaid
graph TD
    User["Learner"]

    subgraph Platform["Gamified SRS Platform"]
        FE["Frontend (React App)
        - Displays SRS content
        - Constructs transactions"]
        BE["Backend (NestJS API)
        - Serves learning deck content
        - Record learning"]
        
        subgraph SB["Solana Blockchain"]
            Vault["Vault Program"]
        end
    end

    User -- "Uses" --> Platform
    FE -- "Fetches deck content" --> BE
    FE -- "Sends transactions to" -->  SB
```

## Vault Program

### User-to-Vault Relationship

A single user (wallet) can have multiple, independent vaults. Each vault is tied to a specific learning deck, allowing a user to have parallel commitments.

```mermaid
graph TD
    UserWallet([Learner's Wallet])

    subgraph "Manages Multiple Vaults via Vault Program"
        direction LR
        VaultPDA1["Vault PDA (Deck 1)"]
        VaultPDA2["Vault PDA (Deck 2)"]
        VaultPDA_N["..."]
    end

    UserWallet -- "stake(deck_id=1, ...)" --> VaultPDA1
    UserWallet -- "stake(deck_id=2, ...)" --> VaultPDA2
    UserWallet -- "checkIn(deck_id=1)" --> VaultPDA1
    UserWallet -- "checkIn(deck_id=2)" --> VaultPDA2
```

### Lifecycle of a Single Vault

Each vault has a distinct lifecycle, from creation to withdrawal.

```mermaid
graph TD
    subgraph "Vault Program Lifecycle"
        UserWallet([Learner's Wallet])
        VaultProgram["Vault Program"]
        VaultPDA["Vault PDA for Learner
        - stake_amount
        - streak_counter
        - streak_target"]

        UserWallet -- "stake(streak_target, ...)" --> VaultProgram
        VaultProgram -- "Creates & Manages" --> VaultPDA
        
        UserWallet -- "checkIn()" --> VaultProgram
        VaultProgram -- "Updates streak_counter" --> VaultPDA
        
        UserWallet -- "withdraw()" --> VaultProgram
        VaultProgram -- "Verifies streak & Closes PDA" --> VaultPDA
        VaultProgram -- "Returns SOL" --> UserWallet
    end
```

### Vault Account State

The `Vault` account is a PDA that holds the state for a user's commitment. Here is what the Anchor struct looks like:

```rust
use anchor_lang::prelude::*;

#[account]
pub struct Vault {
    // The public key of the user who owns this vault.
    pub user: Pubkey,
    
    // The amount of SOL, in lamports, staked by the user.
    pub stake_amount: u64,
    
    // The Unix timestamp when the vault was created and the streak began.
    pub start_timestamp: i64,
    
    // The timestamp of the user's last successful check-in.
    pub last_check_in_timestamp: i64,
    
    // The target number of consecutive daily check-ins required to unlock the vault.
    pub streak_target: u8,
    
    // The current number of consecutive daily check-ins the user has completed.
    pub streak_counter: u8,
}
```
