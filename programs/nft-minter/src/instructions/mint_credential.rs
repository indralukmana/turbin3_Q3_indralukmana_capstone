use anchor_lang::prelude::*;
use mpl_core::{
    instructions::CreateV1Builder,
    types::{Plugin, PluginAuthorityPair, PluginAuthority, Attributes, Attribute},
};

use crate::state::MintPermit;

// Define error codes for mint credential validation
#[error_code]
pub enum MintCredentialError {
    #[msg("Invalid mint permit.")]
    InvalidMintPermit,
}

// Define the accounts required for the mint_credential instruction
#[derive(Accounts)]
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
        close = user  // Close the mint permit account after use
    )]
    pub mint_permit: Account<'info, MintPermit>,
    
    /// CHECK: This account is checked by the Metaplex Core program
    #[account(mut)]
    pub asset: AccountInfo<'info>,
    
    /// CHECK: This account is checked by the Metaplex Core program
    pub collection: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
    
    /// CHECK: This account is checked by the Metaplex Core program
    #[account(address = mpl_core::ID)]
    pub mpl_core_program: AccountInfo<'info>,
}

// Handler function for the mint_credential instruction
pub fn mint_credential_handler(ctx: Context<MintCredential>) -> Result<()> {
    let mint_permit = &ctx.accounts.mint_permit;
    
    // Create attributes for the NFT
    let attributes = Attributes {
        attribute_list: vec![
            Attribute {
                key: "Deck ID".to_string(),
                value: mint_permit.deck_id.clone(),
            },
            Attribute {
                key: "Creation Timestamp".to_string(),
                value: mint_permit.creation_timestamp.to_string(),
            },
        ],
    };
    
    // Create the asset using Metaplex Core
    let create_ix = CreateV1Builder::new()
        .asset(ctx.accounts.asset.key())
        .collection(Some(ctx.accounts.collection.key()))
        .authority(Some(ctx.accounts.user.key()))
        .payer(ctx.accounts.user.key())
        .owner(Some(ctx.accounts.user.key()))
        .system_program(ctx.accounts.system_program.key())
        .name(format!("SRS Credential: {}", mint_permit.deck_id))
        .uri("https://example.com/metadata".to_string())
        .plugins(vec![
            PluginAuthorityPair {
                plugin: Plugin::Attributes(attributes),
                authority: Some(PluginAuthority::UpdateAuthority),
            }
        ])
        .instruction();
    
    // Execute the create instruction
    anchor_lang::solana_program::program::invoke(
        &create_ix,
        &[
            ctx.accounts.asset.to_account_info(),
            ctx.accounts.collection.to_account_info(),
            ctx.accounts.user.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.mpl_core_program.to_account_info(),
        ],
    )?;
    
    Ok(())
}