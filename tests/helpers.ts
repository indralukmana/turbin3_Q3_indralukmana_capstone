import { Buffer } from 'node:buffer';
import {
  type Address,
  getBase58Encoder,
  type KeyPairSigner,
  lamports,
} from '@solana/kit';
import { connect, type Connection } from 'solana-kite';
import {
  MINT_PERMIT_DISCRIMINATOR,
  NFT_MINTER_PROGRAM_ADDRESS,
  getMintPermitDecoder,
  getInitializeMintPermitInstruction,
  getCreateMintPermitInstruction,
  getMintCredentialInstruction,
} from '../dist/nft_minter';
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
 * Derives the Program Derived Address (PDA) for a mint permit.
 */
export async function getMintPermitPda({
  connection,
  user,
  deckId,
}: {
  connection: Connection;
  user: Address;
  deckId: string;
}) {
  const { pda } = await connection.getPDAAndBump(NFT_MINTER_PROGRAM_ADDRESS, [
    Buffer.from('mint_permit'),
    user,
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
  const { value } = await connection.rpc.getAccountInfo(vaultPda).send();

  if (!value?.data) {
    return;
  }

  const valueBytes = getBase58Encoder().encode(value.data);

  const vaultAccount = getVaultAccountDecoder().decode(valueBytes);

  console.log({ vaultAccount });

  return vaultAccount;
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
 * High-level wrapper to initialize a mint permit.
 */
export async function initializeMintPermit({
  connection,
  user,
  deckId,
}: {
  connection: Connection;
  user: KeyPairSigner;
  deckId: string;
}) {
  const mintPermitPda = await getMintPermitPda({
    connection,
    user: user.address,
    deckId,
  });

  const initializeMintPermitInstruction = getInitializeMintPermitInstruction({
    deckId,
    mintPermit: mintPermitPda,
    payer: user,
    user: user.address,
  });

  return connection.sendTransactionFromInstructions({
    feePayer: user,
    instructions: [initializeMintPermitInstruction],
  });
}

/**
 * High-level wrapper to create a mint permit.
 */
export async function createMintPermit({
  connection,
  user,
  deckId,
}: {
  connection: Connection;
  user: KeyPairSigner;
  deckId: string;
}) {
  const mintPermitPda = await getMintPermitPda({
    connection,
    user: user.address,
    deckId,
  });

  const createMintPermitInstruction = getCreateMintPermitInstruction({
    deckId,
    mintPermit: mintPermitPda,
    user,
  });

  return connection.sendTransactionFromInstructions({
    feePayer: user,
    instructions: [createMintPermitInstruction],
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

  const mintPermitPda = await getMintPermitPda({
    connection,
    user: user.address,
    deckId,
  });

  const initializeMintPermitInstruction = getInitializeMintPermitInstruction({
    deckId,
    mintPermit: mintPermitPda,
    payer: user,
    user: user.address,
  });

  const withdrawInstruction = getWithdrawInstruction({
    user,
    vault: vaultPda,
    mintPermit: mintPermitPda,
    nftMinterProgram: NFT_MINTER_PROGRAM_ADDRESS,
  });

  return connection.sendTransactionFromInstructions({
    feePayer: user,
    instructions: [initializeMintPermitInstruction, withdrawInstruction],
  });
}

/**
 * Fetches mint permits
 */
export async function getMintPermits({
  connection,
}: {
  connection: Connection;
}) {
  const getMintPermitAccounts = connection.getAccountsFactory(
    NFT_MINTER_PROGRAM_ADDRESS,
    MINT_PERMIT_DISCRIMINATOR,
    getMintPermitDecoder()
  );

  const mintPermits = await getMintPermitAccounts();

  return mintPermits;
}

/**
 * Fetches and decodes a specific mint permit account.
 */
export async function getMintPermitAccount({
  connection,
  mintPermitPda,
}: {
  connection: Connection;
  mintPermitPda: Address;
}) {
  const mintPermits = await getMintPermits({ connection });

  for (const mintPermit of mintPermits) {
    if (mintPermit.exists && mintPermit.address === mintPermitPda) {
      return mintPermit.data;
    }
  }
}

/**
 * High-level wrapper to mint a credential.
 */
export async function mintCredential({
  connection,
  user,
  deckId,
}: {
  connection: Connection;
  user: KeyPairSigner;
  deckId: string;
}) {
  const { pda: asset } = await connection.getPDAAndBump(
    NFT_MINTER_PROGRAM_ADDRESS,
    [Buffer.from('asset'), user.address, Buffer.from(deckId)]
  );

  const mintPermitPda = await getMintPermitPda({
    connection,
    user: user.address,
    deckId,
  });

  const mintCredentialInstruction = getMintCredentialInstruction({
    mintPermit: mintPermitPda,
    user,
    asset,
    deckId,
  });
  const signature = await connection.sendTransactionFromInstructions({
    feePayer: user,
    instructions: [mintCredentialInstruction],
  });

  return { asset, signature };
}
