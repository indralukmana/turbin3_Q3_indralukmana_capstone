import { Buffer } from 'node:buffer';
import { type Address, type KeyPairSigner, lamports } from '@solana/kit';
import { connect, type Connection } from 'solana-kite';
import {
  SRS_VAULT_PROGRAM_ADDRESS,
  getVaultAccountDecoder,
  getInitializeVaultInstruction,
  getCheckInInstruction,
  getWithdrawInstruction,
  VAULT_ACCOUNT_DISCRIMINATOR,
} from '../dist/srs_vault';

/**
 * Sets up the test environment by connecting to the Solana cluster
 * and creating pre-funded wallets.
 * @returns An object containing the connection and wallet signers.
 */
export async function setup() {
  const connection = connect();
  const [alice, bob] = await connection.createWallets(2, {
    airdropAmount: lamports(55_000_000_000n),
  });
  return { connection, alice, bob };
}

/**
 * Derives the Program Derived Address (PDA) for a vault account.
 */
export async function getVaultPda({
  connection,
  authority,
  deckId,
}: {
  connection: Connection;
  authority: Address;
  deckId: string;
}) {
  const { pda } = await connection.getPDAAndBump(SRS_VAULT_PROGRAM_ADDRESS, [
    Buffer.from('vault'),
    authority,
    Buffer.from(deckId),
  ]);
  return pda;
}

/**
 * Fetches and decodes a specific vault account.
 */
export async function getVaultAccount({
  connection,
  vaultPda,
}: {
  connection: Connection;
  vaultPda: Address;
}) {
  const vaults = await getVaults({ connection });

  for (const vault of vaults) {
    if (vault.exists && vault.address === vaultPda) {
      return vault.data;
    }
  }
}

export async function getVaults({ connection }: { connection: Connection }) {
  const getSrsVaults = connection.getAccountsFactory(
    SRS_VAULT_PROGRAM_ADDRESS,
    VAULT_ACCOUNT_DISCRIMINATOR,
    getVaultAccountDecoder()
  );

  const srsVaults = await getSrsVaults();

  return srsVaults;
}

/**
 * High-level wrapper to initialize a vault.
 */
export async function initializeVault({
  connection,
  feePayer,
  deckId,
  initialDepositAmount,
  streakTarget,
}: {
  connection: Connection;
  feePayer: KeyPairSigner;
  deckId: string;
  initialDepositAmount: bigint;
  streakTarget: number;
}) {
  const vaultPda = await getVaultPda({
    connection,
    authority: feePayer.address,
    deckId,
  });

  const initializeVaultInstruction = getInitializeVaultInstruction({
    deckId,
    initialDepositAmount,
    streakTarget,
    vault: vaultPda,
    vaultAuthority: feePayer,
  });

  return connection.sendTransactionFromInstructions({
    feePayer,
    instructions: [initializeVaultInstruction],
  });
}

/**
 * High-level wrapper to perform a check-in.
 */
export async function checkIn({
  connection,
  user,
  deckId,
}: {
  connection: Connection;
  user: KeyPairSigner;
  deckId: string;
}) {
  const vaultPda = await getVaultPda({
    connection,
    authority: user.address,
    deckId,
  });
  const checkInInstruction = getCheckInInstruction({
    user,
    vault: vaultPda,
  });

  return connection.sendTransactionFromInstructions({
    feePayer: user,
    instructions: [checkInInstruction],
  });
}

/**
 * High-level wrapper to withdraw from a vault.
 */
export async function withdraw({
  connection,
  user,
  deckId,
}: {
  connection: Connection;
  user: KeyPairSigner;
  deckId: string;
}) {
  const vaultPda = await getVaultPda({
    connection,
    authority: user.address,
    deckId,
  });
  const withdrawInstruction = getWithdrawInstruction({
    user,
    vault: vaultPda,
    userWallet: user.address,
  });

  return connection.sendTransactionFromInstructions({
    feePayer: user,
    instructions: [withdrawInstruction],
  });
}
