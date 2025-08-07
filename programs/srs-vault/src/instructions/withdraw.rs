use anchor_lang::prelude::*;
use anchor_lang::system_program;
use nft_minter::program::NftMinter;
use nft_minter::state::mint_permit::MintPermit;

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
    
    // Mint permit account for CPI to nft-minter
    #[account(
        init,
        payer = user,
        space = 8 + MintPermit::INIT_SPACE,
        seeds = [
            b"mint_permit",
            user.key().as_ref(),
            vault.deck_id.as_bytes()
        ],
        bump
    )]
    pub mint_permit: Account<'info, MintPermit>,
    
    pub nft_minter_program: Program<'info, NftMinter>,
    
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
    let transfer_amount = vault.initial_deposit_amount;
    
    // Create a CPI context for the transfer
    let transfer_accounts = system_program::Transfer {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.user_wallet.to_account_info(),
    };
    
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        transfer_accounts,
    );
    
    // Perform the transfer
    system_program::transfer(cpi_context, transfer_amount)?;
    
    // Perform CPI to nft-minter program to create mint permit
    let cpi_ctx = CpiContext::new(
        ctx.accounts.nft_minter_program.to_account_info(),
        nft_minter::cpi::accounts::CreateMintPermit {
            payer: ctx.accounts.user.to_account_info(),
            mint_permit: ctx.accounts.mint_permit.to_account_info(),
            user: ctx.accounts.user.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        },
    );
    
    nft_minter::cpi::create_mint_permit(cpi_ctx, vault.deck_id.clone())?;
    
    Ok(())
}