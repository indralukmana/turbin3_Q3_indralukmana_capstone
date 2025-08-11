use anchor_lang::prelude::*;

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

    #[account(mut)]
    pub user_wallet: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

// Handler function for the withdraw instruction
pub fn withdraw_handler(ctx: Context<Withdraw>) -> Result<()> {
    let vault = &ctx.accounts.vault;

    // Verify that the streak counter meets or exceeds the streak target
    if vault.streak_counter < vault.streak_target {
        return err!(WithdrawError::StreakTargetNotMet);
    }

    // Transfer the initial deposit amount from the vault to the user's wallet
    let transfer_amount = vault.get_lamports();

    **ctx
        .accounts
        .vault
        .to_account_info()
        .try_borrow_mut_lamports()? -= transfer_amount;
    **ctx
        .accounts
        .user_wallet
        .to_account_info()
        .try_borrow_mut_lamports()? += transfer_amount;

    Ok(())
}
