/**
 * Normalizes a repository URL so "the same repo" always compares equal.
 *
 * A duplicate check that compares raw strings is trivially bypassed:
 *   https://github.com/Dev/ph-project
 *   https://github.com/dev/ph-project/
 *   https://github.com/dev/ph-project.git
 * are all the same repository to a human — and must be the same row to us.
 */
export function normalizeRepoUrl(raw: string): string {
  const trimmed = raw.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return trimmed.toLowerCase();
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  // GitHub (like most git hosts) treats owner/repo casing as irrelevant, so
  // the whole URL is lowercased — otherwise "Dev/Project" and "dev/project"
  // would bypass the duplicate check.
  let path = parsed.pathname.toLowerCase().replace(/\/+$/, "");
  path = path.replace(/\.git$/i, "");

  return `https://${host}${path}`;
}
