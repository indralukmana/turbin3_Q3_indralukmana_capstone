use anchor_lang::prelude::*;
use nft_minter::{cpi::create_mint_permit, program::NftMinter};

use crate::state::VaultAccount;

// Define error codes for withdrawal validation
#[error_code]
pub enum WithdrawError {
    #[msg("Streak target not met.")]
    StreakTargetNotMet,
    #[msg("Arithmetic overflow occurred.")]
    Overflow,
}

// Define the accounts required for the withdraw instruction
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref(), vault.deck_id.as_bytes()],
        bump,
        has_one = user,
        close = user  // Close the vault account and return rent to user
    )]
    pub vault: Account<'info, VaultAccount>,

    /// CHECK: This is the account that will be created by the CPI call.
    #[account(mut)]
    pub mint_permit: AccountInfo<'info>,

    pub nft_minter_program: Program<'info, NftMinter>,
}

// Handler function for the withdraw instruction
pub fn withdraw_handler(ctx: Context<Withdraw>) -> Result<()> {
    let vault = &ctx.accounts.vault;

    // Verify that the streak counter meets or exceeds the streak target
    if vault.streak_counter < vault.streak_target {
        return err!(WithdrawError::StreakTargetNotMet);
    }

    // Do CPI call to nft_minter program
    create_mint_permit(
        CpiContext::new(
            ctx.accounts.nft_minter_program.to_account_info(),
            nft_minter::cpi::accounts::CreateMintPermit {
                mint_permit: ctx.accounts.mint_permit.to_account_info(),
                user: ctx.accounts.user.to_account_info(),
            },
        ),
        vault.deck_id.clone(),
    )?;

    Ok(())
}
