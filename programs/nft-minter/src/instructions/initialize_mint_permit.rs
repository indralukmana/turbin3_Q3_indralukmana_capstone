use anchor_lang::prelude::*;

use crate::state::MintPermit;

// Define the accounts required for the initialize_mint_permit instruction
#[derive(Accounts)]
#[instruction(deck_id: String)]
pub struct InitializeMintPermit<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + MintPermit::INIT_SPACE,
        seeds = [
            MintPermit::SEED_PREFIX,
            user.key().as_ref(),
            deck_id.as_bytes()
        ],
        bump
    )]
    pub mint_permit: Account<'info, MintPermit>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub user: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

// Handler function for the initialize_mint_permit instruction
pub fn initialize_mint_permit_handler(ctx: Context<InitializeMintPermit>, _deck_id: String) -> Result<()> {
    let mint_permit = &mut ctx.accounts.mint_permit;
    mint_permit.user = ctx.accounts.user.key();
    Ok(())
}