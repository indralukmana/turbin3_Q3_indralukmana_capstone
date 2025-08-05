use anchor_lang::prelude::*;

pub const MAX_DECK_ID_LENGTH: usize = 32;

#[account]
#[derive(InitSpace)]
pub struct MintPermit {
    pub user: Pubkey,
    #[max_len(MAX_DECK_ID_LENGTH)]
    pub deck_id: String,
    pub creation_timestamp: i64,
}

impl MintPermit {
    pub const SEED_PREFIX: &'static [u8] = b"mint_permit";
}
