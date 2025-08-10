use anchor_lang::prelude::*;

use crate::state::VaultAccount;

// Define error codes for vault initialization
#[error_code]
pub enum InitializeVaultError {
    #[msg("Invalid deck ID.")]
    InvalidDeckId,
    #[msg("Invalid initial deposit amount.")]
    InvalidInitialDepositAmount,
    #[msg("Invalid streak target.")]
    InvalidStreakTarget,
    #[msg("Insufficient funds.")]
    InsufficientFunds,
}

#[derive(Accounts)]
#[instruction(deck_id: String)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
        init,
        payer = vault_authority,
        space = 8 + VaultAccount::INIT_SPACE,
        seeds = [b"vault", vault_authority.key().as_ref(), deck_id.as_bytes()],
        bump
    )]
    pub vault: Account<'info, VaultAccount>,

    pub system_program: Program<'info, System>,
}
pub fn initialize_vault_handler(
    ctx: Context<InitializeVault>,
    deck_id: String,
    initial_deposit_amount: u64,
    streak_target: u8,
) -> Result<()> {
    // balance is insufficient
    if ctx.accounts.vault_authority.lamports() < initial_deposit_amount {
        return err!(InitializeVaultError::InsufficientFunds);
    }

    if deck_id.is_empty() {
        return err!(InitializeVaultError::InvalidDeckId);
    }

    if initial_deposit_amount == 0 {
        return err!(InitializeVaultError::InvalidInitialDepositAmount);
    }

    if streak_target == 0 {
        return err!(InitializeVaultError::InvalidStreakTarget);
    }

    // Transfer SOL from user to the vault
    let transfer_instruction = anchor_lang::system_program::Transfer {
        from: ctx.accounts.vault_authority.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
    };
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        transfer_instruction,
    );
    anchor_lang::system_program::transfer(cpi_context, initial_deposit_amount)?;

    // Initialize the vault account
    let vault = &mut ctx.accounts.vault;
    vault.user = ctx.accounts.vault_authority.key();
    vault.deck_id = deck_id;
    vault.initial_deposit_amount = initial_deposit_amount;
    vault.start_timestamp = Clock::get()?.unix_timestamp;
    vault.last_check_in_timestamp = vault.start_timestamp;
    vault.streak_target = streak_target;
    vault.streak_counter = 1;

    Ok(())
}
