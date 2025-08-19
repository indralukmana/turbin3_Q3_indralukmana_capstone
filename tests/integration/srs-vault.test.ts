/* eslint-disable no-promise-executor-return */
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
  getMintPermitAccount,
  getMintPermitPda,
  mintCredential,
} from '../helpers';

// Helper to pause execution
const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

describe('SRS Vault Integration', () => {
  let connection: Connection;
  let alice: KeyPairSigner;

  beforeAll(async () => {
    const setupResult = await setup();
    connection = setupResult.connection;
    alice = setupResult.alice;
  }, 20_000);

  it('should handle the full lifecycle: initialize -> check-in -> withdraw -> mint', async () => {
    const deckId = 'full_lifecycle_deck';
    const streakTarget = 2;

    // 1. Initialize
    await initializeVault({
      connection,
      feePayer: alice,
      deckId,
      initialDepositAmount: 1_000_000_000n,
      streakTarget,
    });

    // 2. Check-in to meet the streak
    await sleep(1500);
    await checkIn({ connection, user: alice, deckId });

    const vaultPda = await getVaultPda({
      connection,
      authority: alice.address,
      deckId,
    });

    // 3. Withdraw
    await withdraw({
      connection,
      user: alice,
      deckId,
    });

    // 4. Verify vault is closed
    const vaultAccount = await getVaultAccount({ connection, vaultPda });
    expect(vaultAccount).toBeUndefined();

    // 5. Mint the credential
    const { asset, signature } = await mintCredential({
      connection,
      user: alice,
      deckId,
    });

    console.log('asset:', asset);
    console.log('signature:', signature);

    // 6. Verify MintPermit is closed
    const mintPermitPda = await getMintPermitPda({
      connection,
      user: alice.address,
      deckId,
    });

    const mintPermitAccount = await getMintPermitAccount({
      connection,
      mintPermitPda,
    });

    expect(mintPermitAccount).toBeUndefined();
  }, 60_000);
});
