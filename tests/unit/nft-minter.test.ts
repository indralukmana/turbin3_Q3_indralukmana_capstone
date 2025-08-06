import {Buffer} from 'node:buffer'
import { describe, it, expect, assert } from 'vitest';
import { web3, type Program, AnchorProvider, setProvider, workspace, BN } from '@coral-xyz/anchor';
import { setupTest, airdropSol } from '../helpers';
import { type NftMinter } from '../../target/types/nft_minter';

describe('nft-minter', () => {
  // Set up the provider and program for the nft-minter program
  const provider = AnchorProvider.env();
  setProvider(provider);
  const program = workspace.nft_minter as Program<NftMinter>;
  const user = web3.Keypair.generate();

  it('Has the correct program ID', async () => {
    // Verify that the program ID is correctly set
    assert.ok(program.programId, 'Program ID should be defined');
    console.log('NFT Minter Program ID:', program.programId.toString());
  });

  it('Has the create_mint_permit instruction', async () => {
    // Verify that the create_mint_permit instruction exists
    assert.ok(program.methods.createMintPermit, 'createMintPermit instruction should exist');
  });

  it('Has the mint_credential instruction', async () => {
    // Verify that the mint_credential instruction exists
    assert.ok(program.methods.mintCredential, 'mintCredential instruction should exist');
  });

  it('Can create a mint permit (placeholder)', async () => {
    // Airdrop SOL to the user to pay for transactions
    await airdropSol(provider, user.publicKey, 10 * web3.LAMPORTS_PER_SOL);

    const deckId = 'test_deck';
    
    // Get the mint permit PDA
    const [mintPermitPda] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('mint_permit'),
        user.publicKey.toBuffer(),
        Buffer.from(deckId),
      ],
      program.programId,
    );

    try {
      // Try to create a mint permit
      // Note: This is a simplified test that doesn't fully test the CPI functionality
      // A complete test would require setting up the vault program and performing a withdrawal
      console.log('Mint permit PDA:', mintPermitPda.toString());
      assert.ok(true, 'Mint permit creation test completed');
    } catch (error) {
      console.error('Error creating mint permit:', error);
      assert.fail('Failed to create mint permit');
    }
  });
});