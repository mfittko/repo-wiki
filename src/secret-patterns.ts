/** Shared patterns for detecting credential-like content in generated or published wiki markdown. */
export const SECRET_PATTERNS: readonly RegExp[] = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/,
  /ghp_[A-Za-z0-9_]{30,}/,
  /xox[baprs]-[A-Za-z0-9-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /authorization:\s*bearer\s+[^\s"']{8,}/i,
  /(?:token|password|api[_-]?key|secret)=[^\s&]{8,}/i
];

export function containsSecretLikeContent(content: string): boolean {
  return SECRET_PATTERNS.some((pattern) => pattern.test(content));
}
