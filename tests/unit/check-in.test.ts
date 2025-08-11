import { beforeAll, describe, expect, it } from 'vitest';
import { type Connection } from 'solana-kite';
import { type KeyPairSigner } from '@solana/kit';
import {
  setup,
  initializeVault,
  checkIn,
  getVaultAccount,
  getVaultPda,
} from '../helpers';

const TOO_EARLY_ERROR = 'custom program error: #6004';

// Helper to pause execution
const sleep = async (ms: number) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise((resolve) => setTimeout(resolve, ms));

describe('Vault Check-In', () => {
  let connection: Connection;
  let alice: KeyPairSigner;
  let bob: KeyPairSigner;

  beforeAll(async () => {
    const setupResult = await setup();
    connection = setupResult.connection;
    alice = setupResult.alice;
    bob = setupResult.bob;
  }, 20_000);

  it('should perform a successful check-in after the minimum interval', async () => {
    const deckId = 'successful_check_in_deck';
    await initializeVault({
      connection,
      feePayer: alice,
      deckId,
      initialDepositAmount: 1_000_000_000n,
      streakTarget: 5,
    });

    // Wait for more than the 1-second minimum interval
    await sleep(1500);

    await checkIn({ connection, user: alice, deckId });

    const vaultPda = await getVaultPda({
      connection,
      authority: alice.address,
      deckId,
    });
    const vaultAccount = await getVaultAccount({ connection, vaultPda });

    if (!vaultAccount) {
      throw new Error('Vault not found');
    }

    expect(vaultAccount.streakCounter).toBe(2);
    expect(vaultAccount.lastCheckInTimestamp).toBeGreaterThan(
      vaultAccount.startTimestamp
    );
  });

  it('should FAIL when an unauthorized user attempts to check in', async () => {
    const deckId = 'unauthorized_check_in_deck';
    await initializeVault({
      connection,
      feePayer: alice,
      deckId,
      initialDepositAmount: 1_000_000_000n,
      streakTarget: 5,
    });

    // Attempt check-in with Bob on Alice's vault
    await expect(checkIn({ connection, user: bob, deckId })).rejects.toThrow();
  });

  it.skip('[placeholder] should FAIL with a TooEarly error if check-in is attempted immediately', async () => {
    const deckId = 'too_early_deck';
    await initializeVault({
      connection,
      feePayer: alice,
      deckId,
      initialDepositAmount: 1_000_000_000n,
      streakTarget: 5,
    });

    // Attempt to check in immediately
    await expect(checkIn({ connection, user: alice, deckId })).rejects.toThrow(
      TOO_EARLY_ERROR
    );
  });
  it.skip('[placeholder] should FAIL with a TooLate error', () => {
    // This test is skipped because we cannot manipulate the blockchain's clock
    // in the current test environment to simulate the passage of time required
    // to trigger the TooLate error (e.g., > 48 hours).
    // This functionality will be tested in a dedicated integration environment
    // with time manipulation capabilities.
    expect(true).toBe(true);
  });
});
