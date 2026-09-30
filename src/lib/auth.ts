import { hash, verify } from '@node-rs/argon2';

/**
 * @node-rs/argon2's defaults are the auth.md spec: Argon2id, m=19456 (19 MiB),
 * t=2, p=1 — confirmed by the `$argon2id$v=19$m=19456,t=2,p=1$` PHC prefix.
 * The PHC string records its own params, so they can be raised later without a
 * migration.
 */
export async function hashPasscode(passcode: string) {
  return hash(passcode);
}

export async function verifyPasscode(passcodeHash: string, passcode: string) {
  return verify(passcodeHash, passcode);
}
