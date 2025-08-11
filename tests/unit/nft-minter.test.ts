import { beforeAll, describe, expect, it } from 'vitest';
import { type Connection } from 'solana-kite';
import { generateKeyPair, type KeyPairSigner } from '@solana/kit';
import { setup } from '../helpers';
import { getMintCredentialInstruction } from '../../dist/nft_minter';

describe('NFT Minter', () => {
  let connection: Connection;
  let alice: KeyPairSigner;

  beforeAll(async () => {
    const setupResult = await setup();
    connection = setupResult.connection;
    alice = setupResult.alice;
  }, 20_000);

  it('should FAIL to mint when the MintPermit account is uninitialized', async () => {
    const uninitializedPermit = await generateKeyPair();
    const asset = await generateKeyPair();
    const collection = await generateKeyPair();

    const mintCredentialInstruction = getMintCredentialInstruction({
      mintPermit: uninitializedPermit.publicKey,
      user: alice,
      asset,
      collection,
    });

    await expect(
      connection.sendTransactionFromInstructions({
        feePayer: alice,
        instructions: [mintCredentialInstruction],
      })
    ).rejects.toThrow();
  });
});
