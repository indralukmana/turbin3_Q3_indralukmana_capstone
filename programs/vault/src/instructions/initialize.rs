use anchor_lang::prelude::*;

use crate::state::Vault;

#[derive(Accounts)]
#[instruction(deck_id: String)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
        init,
        payer = vault_authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", vault_authority.key().as_ref(), deck_id.as_bytes()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}
pub fn initialize_vault(
    ctx: Context<InitializeVault>,
    deck_id: String,
    initial_deposit_amount: u64,
    streak_target: u8,
) -> Result<()> {
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
