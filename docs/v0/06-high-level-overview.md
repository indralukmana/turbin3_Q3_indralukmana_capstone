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

```mermaid
graph TD
    subgraph "On-Chain Logic"
        direction TB
        
        P1[Vault Program]
        
      

        subgraph  Multiple Vaults
            PDA_1["Vault PDA (Deck 1)
            user: LearnerX
            deck_id: 1"]
            PDA_2["Vault PDA (Deck 2)
            user: LearnerX
            deck_id: 2"]
        end
    end

    UserWallet([Learner's Wallet])

    UserWallet -- "Calls stake(deck_id, streak_target, ...)" --> P1
    P1 -- "Creates/Manages a specific Vault PDA" --> PDA_1
    
    UserWallet -- "Calls checkIn(deck_id)" --> P1

    UserWallet -- "Calls withdraw(deck_id)" --> P1
    P1 -- "Returns SOL & Closes a specific Vault PDA" --> PDA_2
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
