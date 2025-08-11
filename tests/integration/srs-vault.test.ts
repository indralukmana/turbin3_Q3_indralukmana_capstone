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

  it.skip('[placeholder] should handle the full lifecycle: initialize -> check-in -> withdraw -> mint', async () => {
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

    // 5. Verify MintPermit was created and is now closed (or check for NFT mint)
    // In a real scenario, we would query for the NFT. For this test, we check if the permit account is closed.
    // const mintPermitAccountInfo =
    //   await connection.rpc.getAccountInfo(mintPermit);
    // Depending on program logic, the permit might be closed immediately after minting.
    // If so, this check is valid. If not, we'd check its data.
    // expect(mintPermitAccountInfo).toBeNull();

    // Further tests would involve a full NFT client to verify the minted NFT's metadata.
  });

  it.skip('[placeholder] should fail to reuse a mint permit', async () => {
    // This would be part of a more complex test where we try to call the nft-minter
    // program again with the same closed permit account.
    // For now, this is a conceptual placeholder.
    expect(true).toBe(true);
  });

  it.skip('[placeholder] should rollback transaction if CPI to nft-minter fails', async () => {
    // This test is complex and requires mocking the CPI call to fail.
    // This is beyond the scope of this unit test and would be handled in
    // a more advanced integration testing environment.
    expect(true).toBe(true);
  });
});
