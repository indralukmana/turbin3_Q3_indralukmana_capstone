import {Buffer} from 'node:buffer'
import { describe, it, expect, assert } from 'vitest';
import {
  AnchorProvider,
  type Program,
  setProvider,
  workspace,
  web3,
  BN,
} from '@coral-xyz/anchor';
import {  type SrsVault as Vault } from '../target/types/srs_vault';

describe('vault', () => {
  // Configure the client to use the local cluster.
  setProvider(AnchorProvider.env());
  const provider = AnchorProvider.env();

  const program = workspace.srs_vault as Program<Vault>;
  const vaultAuthority = web3.Keypair.generate();

  // Helper function to initialize a vault
  const initializeVault = async (
    deckId: string,
    initialDepositAmount: BN,
    streakTarget: number,
    authority: web3.Keypair,
  ) => {
    const [vaultPda] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('vault'),
        authority.publicKey.toBuffer(),
        Buffer.from(deckId),
      ],
      program.programId,
    );

    await program.methods
      .initialize(deckId, initialDepositAmount, streakTarget)
      .accountsPartial({
        vaultAuthority: authority.publicKey,
        vault: vaultPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    return program.account.vault.fetch(vaultPda);
  };

  it('Initializes the vault account correctly', async () => {
    // Airdrop SOL to the vault authority to pay for transactions
    const tx = await provider.connection.requestAirdrop(
      vaultAuthority.publicKey,
      10 * web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction({ signature: tx, ...(await provider.connection.getLatestBlockhash()) });

    // Define test parameters
    const deckId = 'my_first_deck';
    const initialDepositAmount = new BN(2 * web3.LAMPORTS_PER_SOL);
    const streakTarget = 5;

    // Initialize the vault
    const vaultAccount = await initializeVault(
      deckId,
      initialDepositAmount,
      streakTarget,
      vaultAuthority,
    );

    // Perform assertions to verify the state
    assert.ok(
      vaultAccount.user.equals(vaultAuthority.publicKey),
      'User public key does not match',
    );
    assert.strictEqual(
      vaultAccount.deckId,
      deckId,
      'Deck ID does not match',
    );
    assert.ok(
      vaultAccount.initialDepositAmount.eq(initialDepositAmount),
      'Initial deposit amount does not match',
    );
    assert.strictEqual(
      vaultAccount.streakTarget,
      streakTarget,
      'Streak target does not match',
    );
    assert.strictEqual(
      vaultAccount.streakCounter,
      1,
      'Streak counter should be 1',
    );
    assert.ok(
      vaultAccount.startTimestamp.toNumber() > 0,
      'Start timestamp should be set',
    );
    assert.ok(
      vaultAccount.lastCheckInTimestamp.eq(vaultAccount.startTimestamp),
      'Last check-in timestamp should equal start timestamp',
    );

    // Verify the SOL balance of the vault PDA
    const [vaultPda] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('vault'),
        vaultAuthority.publicKey.toBuffer(),
        Buffer.from(deckId),
      ],
      program.programId,
    );
    const vaultBalance = await provider.connection.getBalance(vaultPda);
    expect(vaultBalance).to.be.gte(
      initialDepositAmount.toNumber(),
      'Vault balance is less than the initial deposit',
    );
  });

  it('Initializes with a zero deposit', async () => {
    const deckId = 'zero_deposit_deck';
    const initialDepositAmount = new BN(0);
    const streakTarget = 10;

    const vaultAccount = await initializeVault(
      deckId,
      initialDepositAmount,
      streakTarget,
      vaultAuthority,
    );

    assert.ok(
      vaultAccount.initialDepositAmount.eq(initialDepositAmount),
      'Initial deposit amount should be 0',
    );

    const [vaultPda] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('vault'),
        vaultAuthority.publicKey.toBuffer(),
        Buffer.from(deckId),
      ],
      program.programId,
    );
    const vaultBalance = await provider.connection.getBalance(vaultPda);
    // Rent exemption is still required
    expect(vaultBalance).to.be.greaterThan(0);
  });

  it('Initializes with a large deposit', async () => {
    const deckId = 'large_deposit_deck';
    // Use a large number, but not so large it will break the bank
    const initialDepositAmount = new BN(100 * web3.LAMPORTS_PER_SOL);
    const streakTarget = 20;

    // Airdrop more SOL to handle the large deposit
    const tx = await provider.connection.requestAirdrop(
      vaultAuthority.publicKey,
      101 * web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction({ signature: tx, ...(await provider.connection.getLatestBlockhash()) });

    const vaultAccount = await initializeVault(
      deckId,
      initialDepositAmount,
      streakTarget,
      vaultAuthority,
    );

    assert.ok(
      vaultAccount.initialDepositAmount.eq(initialDepositAmount),
      'Initial deposit amount does not match for large deposit',
    );

    const [vaultPda] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('vault'),
        vaultAuthority.publicKey.toBuffer(),
        Buffer.from(deckId),
      ],
      program.programId,
    );
    const vaultBalance = await provider.connection.getBalance(vaultPda);
    expect(vaultBalance).to.be.gte(initialDepositAmount.toNumber());
  });
});
