use anchor_lang::prelude::*;

use crate::state::MintPermit;

// Define error codes for mint credential validation
#[error_code]
pub enum MintCredentialError {
    #[msg("Invalid mint permit.")]
    InvalidMintPermit,
}

// Define the accounts required for the mint_credential instruction
#[derive(Accounts)]
#[instruction(deck_id: String)]
pub struct MintCredential<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"mint_permit",
            mint_permit.user.as_ref(),
            mint_permit.deck_id.as_bytes()
        ],
        bump,
        has_one = user @ MintCredentialError::InvalidMintPermit,
        close = user
    )]
    pub mint_permit: Account<'info, MintPermit>,

    /// CHECK: PDA for the asset that will be created
    #[account(
        mut,
        seeds = [
            b"asset",
            user.key().as_ref(),
            deck_id.as_bytes(),
        ],
        bump
    )]
    pub asset: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,

    /// The MPL Core program.
    /// CHECK: Checked in mpl-core.
    #[account(address = mpl_core::ID)]
    pub mpl_core_program: AccountInfo<'info>,
}

// Handler function for the mint_credential instruction
pub fn mint_credential_handler(ctx: Context<MintCredential>, deck_id: String) -> Result<()> {
    let deck_id_bytes_vec = deck_id.as_bytes().to_vec();
    let deck_id_bytes_ref = deck_id_bytes_vec.as_ref();
    let user_key = ctx.accounts.user.key();
    let user_key_ref = user_key.as_ref();
    let asset_bump_byte = ctx.bumps.asset;
    let asset_bump_ref = &[asset_bump_byte];
    let asset_seed = b"asset";
    let signer_seeds = &[&[
        asset_seed,
        user_key_ref,
        deck_id_bytes_ref,
        asset_bump_ref,
    ][..]];

    mpl_core::instructions::CreateV1Cpi {
        asset: &ctx.accounts.asset.to_account_info(),
        collection: None,
        authority: None,
        payer: &ctx.accounts.user.to_account_info(),
        owner: Some(&ctx.accounts.user.to_account_info()),
        update_authority: Some(&ctx.accounts.user.to_account_info()),
        system_program: &ctx.accounts.system_program.to_account_info(),
        log_wrapper: None,
        __program: &ctx.accounts.mpl_core_program,
        __args: mpl_core::instructions::CreateV1InstructionArgs {
            data_state: mpl_core::types::DataState::AccountState,
            name: format!("SRS Credential: {}", deck_id),
            uri: "https://example.com/metadata".to_string(),
            plugins: None,
        },
    }
    .invoke_signed(signer_seeds)?;
    Ok(())
}
