import { web3 } from '@coral-xyz/anchor';
import { describe, expect, it } from 'vitest';
import { airdropSol, setupTest } from '../helpers';

describe('helpers', () => {
  it('should airdrop SOL to a specified public key', async () => {
    const program = setupTest();
    const {provider} = program; // Assuming AnchorProvider
    const testKeypair = web3.Keypair.generate();
    const initialBalance = await provider.connection.getBalance(testKeypair.publicKey);

    const airdropAmount = 10 * web3.LAMPORTS_PER_SOL;
    await airdropSol(provider, testKeypair.publicKey, airdropAmount);

    const newBalance = await provider.connection.getBalance(testKeypair.publicKey);
    expect(newBalance).toBe(initialBalance + airdropAmount);
  });

  it('should setup the test environment correctly', async () => {
    const program = setupTest();
    expect(program).toBeDefined();
    expect(program.programId).toBeDefined();
  });
});