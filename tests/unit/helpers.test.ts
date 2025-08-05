import { describe, it, expect } from 'vitest';
import { web3, BN  } from '@coral-xyz/anchor';
import { setupTest, airdropSol } from '../helpers';

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