#![allow(deprecated)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("7qHxwJLfkiptAyxqYfoWEBsA9oampfGeGDhq3gpURZMn");

mod instructions;
mod state;

use instructions::*;

#[program]
pub mod srs_vault {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        deck_id: String,
        initial_deposit_amount: u64,
        streak_target: u8,
    ) -> Result<()> {
        initialize_vault_handler(ctx, deck_id, initial_deposit_amount, streak_target)
    }

    pub fn check_in(ctx: Context<CheckIn>) -> Result<()> {
        check_in_handler(ctx)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        withdraw_handler(ctx)
    }
}
