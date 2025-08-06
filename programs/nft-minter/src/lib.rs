#![allow(deprecated)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("CbXhmEqsEVNbC5vuyeTAURW8Ho8TjP4WbXkXimBiyXXA");

pub mod instructions;
pub mod state;

use instructions::*;

#[program]
pub mod nft_minter {
    use super::*;

    pub fn create_mint_permit(
        ctx: Context<CreateMintPermit>,
        deck_id: String,
    ) -> Result<()> {
        create_mint_permit_handler(ctx, deck_id)
    }
    
    pub fn mint_credential(
        ctx: Context<MintCredential>,
    ) -> Result<()> {
        mint_credential_handler(ctx)
    }
}
