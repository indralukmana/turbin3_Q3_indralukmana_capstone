use anchor_lang::prelude::*;

use crate::state::MintPermit;

// Define the accounts required for the create_mint_permit instruction
#[derive(Accounts)]
#[instruction(deck_id: String)]
pub struct CreateMintPermit<'info> {
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

// Handler function for the create_mint_permit instruction
pub fn create_mint_permit_handler(
    ctx: Context<CreateMintPermit>,
    deck_id: String,
) -> Result<()> {
    let mint_permit = &mut ctx.accounts.mint_permit;
    
    // Set the mint permit fields
    mint_permit.user = ctx.accounts.user.key();
    mint_permit.deck_id = deck_id;
    mint_permit.creation_timestamp = Clock::get()?.unix_timestamp;
    
    Ok(())
}