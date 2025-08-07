use anchor_lang::prelude::*;

use crate::state::VaultAccount;

// Define error codes for check-in validation
#[error_code]
pub enum CheckInError {
    #[msg("Check-in is too early. Minimum interval not met.")]
    TooEarly,
    #[msg("Check-in is too late. Maximum interval exceeded.")]
    TooLate,
    #[msg("Invalid time calculation.")]
    InvalidTimeCalculation,
    #[msg("Arithmetic overflow occurred.")]
    Overflow,
}

// Define the accounts required for the check_in instruction
#[derive(Accounts)]
pub struct CheckIn<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref(), vault.deck_id.as_bytes()],
        bump,
        has_one = user
    )]
    pub vault: Account<'info, VaultAccount>,
}

// Constants for check-in intervals (in seconds)
// Minimum interval: 20 hours
const MIN_CHECK_IN_INTERVAL: i64 = 20 * 60 * 60;
// Maximum interval: 48 hours
const MAX_CHECK_IN_INTERVAL: i64 = 48 * 60 * 60;

// Handler function for the check_in instruction
pub fn check_in_handler(ctx: Context<CheckIn>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let current_time = Clock::get()?.unix_timestamp;

    // Calculate time since last check-in
    let time_since_last_check_in = current_time
        .checked_sub(vault.last_check_in_timestamp)
        .ok_or(CheckInError::InvalidTimeCalculation)?;

    // Check if it's too early for a check-in
    if time_since_last_check_in < MIN_CHECK_IN_INTERVAL {
        return err!(CheckInError::TooEarly);
    }

    // Check if it's too late for a check-in
    if time_since_last_check_in > MAX_CHECK_IN_INTERVAL {
        return err!(CheckInError::TooLate);
    }

    // Update the vault state
    vault.last_check_in_timestamp = current_time;
    vault.streak_counter = vault
        .streak_counter
        .checked_add(1)
        .ok_or(CheckInError::Overflow)?;

    Ok(())
}
