import {Buffer} from 'node:buffer'
import { AnchorProvider, type Program, setProvider, workspace, web3, type BN, type Provider  } from '@coral-xyz/anchor';
import { type SrsVault } from '../target/types/srs_vault';

/**
 * Sets up the Anchor provider and program instance using the built-in testing framework.
 * @returns The program instance.
 */
export function setupTest(): Program<SrsVault> {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  setProvider(provider);

  // Return the program instance.
  return workspace.srs_vault as Program<SrsVault>;
}

/**
 * Airdrops SOL to a specified public key.
 * @param provider The Anchor provider.
 * @param publicKey The public key to airdrop SOL to.
 * @param amount The amount of SOL to airdrop (in lamports).
 */
export async function airdropSol(
  provider: Provider,
  publicKey: web3.PublicKey,
  amount: number,
): Promise<void> {
  const tx = await provider.connection.requestAirdrop(publicKey, amount);
  await provider.connection.confirmTransaction({ signature: tx, ...(await provider.connection.getLatestBlockhash()) });
}

/**
 * Initializes a vault.
 * @param program The Anchor program instance.
 * @param deckId The deck ID.
 * @param initialDepositAmount The initial deposit amount.
 * @param streakTarget The streak target.
 * @param authority The authority keypair.
 * @returns The vault account.
 */
export async function initializeVault(
  program: Program<SrsVault>,
  deckId: string,
  values: {
    initialDepositAmount: BN,
    streakTarget: number,
    vaultAuthority: web3.Keypair,
  }
) {
  const {initialDepositAmount, streakTarget, vaultAuthority} = values
  const [vaultPda] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('vault'),
      vaultAuthority.publicKey.toBuffer(),
      Buffer.from(deckId),
    ],
    program.programId,
  );

  await program.methods
    .initialize(deckId, initialDepositAmount, streakTarget)
    .accountsPartial({
      vaultAuthority: vaultAuthority.publicKey,
      vault: vaultPda,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([vaultAuthority])
    .rpc();

  return program.account.vault.fetch(vaultPda);
}

/**
 * Performs a check-in for a vault.
 * @param program The Anchor program instance.
 * @param vaultAuthority The authority keypair.
 * @param deckId The deck ID.
 * @returns The transaction signature.
 */
export async function checkIn(
  program: Program<SrsVault>,
  vaultAuthority: web3.Keypair,
  deckId: string,
) {
  const [vaultPda] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('vault'),
      vaultAuthority.publicKey.toBuffer(),
      Buffer.from(deckId),
    ],
    program.programId,
  );

  return program.methods
    .checkIn()
    .accounts({
      user: vaultAuthority.publicKey,
      vault: vaultPda,
    })
    .signers([vaultAuthority])
    .rpc();
}