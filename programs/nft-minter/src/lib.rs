#![allow(deprecated)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("GgsbB7i8ruSheL5A5FkDf6upCbNgaXFURDiRdVtg2X6G");

pub mod instructions;
pub mod state;

use instructions::*;

#[program]
pub mod nft_minter {
    use super::*;

    pub fn initialize_mint_permit(
        ctx: Context<InitializeMintPermit>,
        deck_id: String,
    ) -> Result<()> {
        initialize_mint_permit_handler(ctx, deck_id)
    }

    pub fn create_mint_permit(ctx: Context<CreateMintPermit>, deck_id: String) -> Result<()> {
        create_mint_permit_handler(ctx, deck_id)
    }

    pub fn mint_credential(ctx: Context<MintCredential>, deck_id: String) -> Result<()> {
        mint_credential_handler(ctx, deck_id)
    }
}
