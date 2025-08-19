import { beforeAll, describe, expect, it } from 'vitest';
import { type Connection } from 'solana-kite';
import { generateKeyPair, type KeyPairSigner } from '@solana/kit';
import {
  setup,
  getMintPermitPda,
  getMintPermitAccount,
  initializeMintPermit,
  createMintPermit,
} from '../helpers';
import { getMintCredentialInstruction } from '../../dist/nft_minter';

describe('NFT Minter', () => {
  let connection: Connection;
  let alice: KeyPairSigner;

  beforeAll(async () => {
    const setupResult = await setup();
    connection = setupResult.connection;
    alice = setupResult.alice;
  }, 20_000);

  it('should successfully initialize a mint permit', async () => {
    const deckId = 'init_deck';
    await initializeMintPermit({
      connection,
      user: alice,
      deckId,
    });

    const mintPermitPda = await getMintPermitPda({
      connection,
      user: alice.address,
      deckId,
    });
    const mintPermitAccount = await getMintPermitAccount({
      connection,
      mintPermitPda,
    });

    expect(mintPermitAccount).toBeDefined();
  });

  it('should successfully create a mint permit', async () => {
    const deckId = 'create_deck';
    await initializeMintPermit({
      connection,
      user: alice,
      deckId,
    });

    await createMintPermit({
      connection,
      user: alice,
      deckId,
    });

    const mintPermitPda = await getMintPermitPda({
      connection,
      user: alice.address,
      deckId,
    });
    const mintPermitAccount = await getMintPermitAccount({
      connection,
      mintPermitPda,
    });

    expect(mintPermitAccount).toBeDefined();
    expect(mintPermitAccount?.user).toEqual(alice.address);
    expect(mintPermitAccount?.deckId).toEqual(deckId);
    expect(mintPermitAccount?.creationTimestamp).toBeGreaterThan(0n);
  });

  it('should FAIL to mint when the MintPermit account is uninitialized', async () => {
    const uninitializedPermit = await generateKeyPair();
    const asset = await generateKeyPair();
    const deckId = 'uninitialized_deck';

    const mintCredentialInstruction = getMintCredentialInstruction({
      mintPermit: uninitializedPermit.publicKey,
      user: alice,
      asset,
      deckId,
    });

    await expect(
      connection.sendTransactionFromInstructions({
        feePayer: alice,
        instructions: [mintCredentialInstruction],
      })
    ).rejects.toThrow();
  });
});
