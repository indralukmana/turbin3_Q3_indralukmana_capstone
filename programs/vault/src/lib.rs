#![allow(deprecated)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("BzHRkdoBSd48wPBDUE4wXDJn7vgiLmBqBmrFJzsC26ME");

mod instructions;
mod state;

use instructions::*;

#[program]
pub mod srs_vault {
    use super::*;

    pub fn initialize(
        ctx: Context<InitializeVault>,
        deck_id: String,
        initial_deposit_amount: u64,
        streak_target: u8,
    ) -> Result<()> {
        initialize_vault(ctx, deck_id, initial_deposit_amount, streak_target)
    }
}
