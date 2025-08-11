/* eslint-disable no-await-in-loop */
import { beforeAll, describe, expect, it } from 'vitest';
import { type Connection } from 'solana-kite';
import { type KeyPairSigner } from '@solana/kit';
import {
  setup,
  initializeVault,
  checkIn,
  withdraw,
  getVaultAccount,
  getVaultPda,
} from '../helpers';

const STREAK_TARGET_NOT_MET_ERROR = 'custom program error: #6000';

// Helper to pause execution
const sleep = async (ms: number) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise((resolve) => setTimeout(resolve, ms));

describe('Vault Withdrawal', () => {
  let connection: Connection;
  let alice: KeyPairSigner;
  let bob: KeyPairSigner;

  beforeAll(async () => {
    const setupResult = await setup();
    connection = setupResult.connection;
    alice = setupResult.alice;
    bob = setupResult.bob;
  }, 20_000);

  it('should allow a successful withdrawal after the streak target is met', async () => {
    const deckId = 'successful_withdrawal_deck';
    const streakTarget = 3;

    await initializeVault({
      connection,
      feePayer: alice,
      deckId,
      initialDepositAmount: 1_000_000_000n,
      streakTarget,
    });

    for (let i = 0; i < streakTarget - 1; i++) {
      await sleep(1500);
      await checkIn({ connection, user: alice, deckId });
    }

    const vaultPda = await getVaultPda({
      connection,
      authority: alice.address,
      deckId,
    });
    const initialBalance = await connection.rpc
      .getBalance(alice.address)
      .send();

    await withdraw({
      connection,
      user: alice,
      deckId,
    });

    const finalBalance = await connection.rpc.getBalance(alice.address).send();
    const vaultAccount = await getVaultAccount({ connection, vaultPda });

    expect(vaultAccount).toBeUndefined(); // Account should be closed
    expect(finalBalance.value).toBeGreaterThan(initialBalance.value); // User should receive lamports back
  });

  it('should FAIL with a StreakTargetNotMet error if withdrawal is attempted early', async () => {
    const deckId = 'early_withdrawal_deck';
    await initializeVault({
      connection,
      feePayer: alice,
      deckId,
      initialDepositAmount: 1_000_000_000n,
      streakTarget: 5,
    });

    await expect(
      withdraw({
        connection,
        user: alice,
        deckId,
      })
    ).rejects.toThrow(STREAK_TARGET_NOT_MET_ERROR);
  });

  it('should FAIL when an unauthorized user attempts to withdraw', async () => {
    const deckId = 'unauthorized_withdrawal_deck';
    await initializeVault({
      connection,
      feePayer: alice,
      deckId,
      initialDepositAmount: 1_000_000_000n,
      streakTarget: 2,
    });

    await sleep(1500);
    await checkIn({ connection, user: alice, deckId });

    // Attempt withdrawal with Bob on Alice's vault
    await expect(
      withdraw({
        connection,
        user: bob,
        deckId,
      })
    ).rejects.toThrow();
  });

  it.skip('[placeholder] should FAIL if the streak was broken by a TooLate event', () => {
    // This test is skipped because we cannot manipulate the blockchain's clock
    // to simulate the passage of time required to trigger the TooLate error.
    expect(true).toBe(true);
  });
});
