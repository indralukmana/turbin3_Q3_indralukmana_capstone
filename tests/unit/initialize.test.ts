import { beforeAll, describe, expect, it } from 'vitest';
import { type Connection } from 'solana-kite';
import { type KeyPairSigner } from '@solana/kit';
import {
  setup,
  initializeVault,
  getVaultAccount,
  getVaultPda,
  getVaults,
} from '../helpers';

const INVALID_DECK_ID_ERROR = 'custom program error: #6000';
const INVALID_INITIAL_DEPOSIT_ERROR = 'custom program error: #6001';
const INVALID_STREAK_TARGET_ERROR = 'custom program error: #6002';
const INSUFFICIENT_FUNDS_ERROR = 'custom program error: #6003';

describe('Vault Initialization', () => {
  let connection: Connection;
  let alice: KeyPairSigner;
  let bob: KeyPairSigner;

  beforeAll(async () => {
    const setupResult = await setup();
    connection = setupResult.connection;
    alice = setupResult.alice;
    bob = setupResult.bob;
  }, 20_000);

  it('should initialize the vault account correctly with standard inputs', async () => {
    const deckId = 'standard_deck';
    const initialDepositAmount = 1_000_000_000n; // 1 SOL
    const streakTarget = 7;

    await initializeVault({
      connection,
      feePayer: alice,
      deckId,
      initialDepositAmount,
      streakTarget,
    });

    const vaultPda = await getVaultPda({
      connection,
      authority: alice.address,
      deckId,
    });
    const vaultAccount = await getVaultAccount({ connection, vaultPda });

    if (!vaultAccount) {
      throw new Error('Vault account not found after initialization');
    }

    const {
      user,
      deckId: vaultDeckId,
      initialDepositAmount: vaultInitialDeposit,
      startTimestamp,
      lastCheckInTimestamp,
      streakTarget: vaultStreakTarget,
      streakCounter,
    } = vaultAccount;

    expect(user).toEqual(alice.address);
    expect(vaultDeckId).toBe(deckId);
    expect(vaultInitialDeposit).toBe(initialDepositAmount);
    expect(vaultStreakTarget).toBe(streakTarget);
    expect(streakCounter).toBe(1);
    expect(startTimestamp).toBeGreaterThan(0n);
    expect(lastCheckInTimestamp).toBe(startTimestamp);
  });

  it('should initialize with a large deposit', async () => {
    const deckId = 'large_deposit_deck';
    const initialDepositAmount = 50_000_000_000n; // 50 SOL
    const streakTarget = 10;

    await initializeVault({
      connection,
      feePayer: alice,
      deckId,
      initialDepositAmount,
      streakTarget,
    });

    const vaultPda = await getVaultPda({
      connection,
      authority: alice.address,
      deckId,
    });
    const vaultAccount = await getVaultAccount({ connection, vaultPda });

    if (vaultAccount) {
      expect(vaultAccount.initialDepositAmount).toBe(initialDepositAmount);
    }
  });

  it('should FAIL when initial_deposit_amount is zero', async () => {
    const deckId = 'zero_deposit_deck';
    await expect(
      initializeVault({
        connection,
        feePayer: alice,
        deckId,
        initialDepositAmount: 0n,
        streakTarget: 5,
      })
    ).rejects.toThrow(INVALID_INITIAL_DEPOSIT_ERROR);
  });

  it('should FAIL when streak_target is zero', async () => {
    const deckId = 'zero_streak_deck';
    await expect(
      initializeVault({
        connection,
        feePayer: alice,
        deckId,
        initialDepositAmount: 1_000_000_000n,
        streakTarget: 0,
      })
    ).rejects.toThrow(INVALID_STREAK_TARGET_ERROR);
  });

  it('should FAIL when deck_id is empty', async () => {
    const deckId = '';
    await expect(
      initializeVault({
        connection,
        feePayer: alice,
        deckId,
        initialDepositAmount: 1_000_000_000n,
        streakTarget: 5,
      })
    ).rejects.toThrow(INVALID_DECK_ID_ERROR);
  });

  it('should FAIL to initialize an already existing vault', async () => {
    const deckId = 'duplicate_deck';
    await initializeVault({
      connection,
      feePayer: alice,
      deckId,
      initialDepositAmount: 1_000_000_000n,
      streakTarget: 5,
    });
    await expect(
      initializeVault({
        connection,
        feePayer: alice,
        deckId,
        initialDepositAmount: 1_000_000_000n,
        streakTarget: 5,
      })
    ).rejects.toThrow();
  });

  it('should allow a single user to create multiple vaults', async () => {
    const deckId1 = 'multi_deck_1';
    const deckId2 = 'multi_deck_2';

    await initializeVault({
      connection,
      feePayer: alice,
      deckId: deckId1,
      initialDepositAmount: 1_000_000_000n,
      streakTarget: 5,
    });
    await initializeVault({
      connection,
      feePayer: alice,
      deckId: deckId2,
      initialDepositAmount: 1_000_000_000n,
      streakTarget: 5,
    });

    const vaults = await getVaults({ connection });

    expect(vaults[0].exists).toBe(true);
    expect(vaults[1].exists).toBe(true);
  });

  it('should allow multiple users to create their own vaults', async () => {
    const deckAlice = 'deck_alice';
    const deckBob = 'deck_bob';

    await initializeVault({
      connection,
      feePayer: alice,
      deckId: deckAlice,
      initialDepositAmount: 1_000_000n,
      streakTarget: 5,
    });
    await initializeVault({
      connection,
      feePayer: bob,
      deckId: deckBob,
      initialDepositAmount: 1_000_000n,
      streakTarget: 5,
    });

    const aliceVault = await getVaultAccount({
      connection,
      vaultPda: await getVaultPda({
        connection,
        authority: alice.address,
        deckId: deckAlice,
      }),
    });
    const bobVault = await getVaultAccount({
      connection,
      vaultPda: await getVaultPda({
        connection,
        authority: bob.address,
        deckId: deckBob,
      }),
    });

    expect(aliceVault?.user).toBe(alice.address);
    expect(bobVault?.user).toBe(bob.address);
    expect(aliceVault?.deckId).toBe(deckAlice);
    expect(bobVault?.deckId).toBe(deckBob);
  });

  it('should FAIL when the deck_id string is too long', async () => {
    const longDeckId = 'a'.repeat(100);
    await expect(
      initializeVault({
        connection,
        feePayer: alice,
        deckId: longDeckId,
        initialDepositAmount: 1_000_000n,
        streakTarget: 5,
      })
    ).rejects.toThrow();
  });

  it('should FAIL when the user has insufficient SOL for the deposit', async () => {
    const deckId = 'insufficient_sol_deck';

    await expect(
      initializeVault({
        connection,
        feePayer: alice,
        deckId,
        initialDepositAmount: 1_000_000_000_000n,
        streakTarget: 5,
      })
    ).rejects.toThrow(INSUFFICIENT_FUNDS_ERROR);
  }, 20_000);
});
