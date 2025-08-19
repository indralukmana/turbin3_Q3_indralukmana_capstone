use anchor_lang::prelude::*;

use crate::state::MintPermit;

// Define the accounts required for the create_mint_permit instruction
#[derive(Accounts)]
#[instruction(deck_id: String)]
pub struct CreateMintPermit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [
            MintPermit::SEED_PREFIX,
            user.key().as_ref(),
            deck_id.as_bytes()
        ],
        bump,
        has_one = user
    )]
    pub mint_permit: Account<'info, MintPermit>,
}

// Handler function for the create_mint_permit instruction
pub fn create_mint_permit_handler(ctx: Context<CreateMintPermit>, deck_id: String) -> Result<()> {
    let mint_permit = &mut ctx.accounts.mint_permit;

    // Set the mint permit fields
    mint_permit.user = ctx.accounts.user.key();
    mint_permit.deck_id = deck_id;
    mint_permit.creation_timestamp = Clock::get()?.unix_timestamp;

    Ok(())
}
