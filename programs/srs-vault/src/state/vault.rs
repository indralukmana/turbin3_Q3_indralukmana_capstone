use anchor_lang::prelude::*;

pub const MAX_DECK_ID_LENGTH: usize = 32;

#[account]
#[derive(InitSpace)]
pub struct VaultAccount {
    pub user: Pubkey,
    #[max_len(MAX_DECK_ID_LENGTH)]
    pub deck_id: String,
    pub initial_deposit_amount: u64,
    pub start_timestamp: i64,
    pub last_check_in_timestamp: i64,
    pub streak_target: u8,
    pub streak_counter: u8,
}
