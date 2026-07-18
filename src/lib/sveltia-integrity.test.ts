import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// public/admin/sveltia-cms.js is a vendored copy of the Sveltia CMS bundle.
// It executes on the admin page, which handles a GitHub PAT, so its integrity
// matters more than any other file in the repo. This test pins the expected
// version and sha256 so an upgrade (or an accidental/malicious edit) that
// changes the bytes fails CI instead of shipping unnoticed.
//
// To upgrade: download the new pinned version, verify it against npm, then
// update both constants below:
//   curl -sL https://unpkg.com/@sveltia/cms@<version>/dist/sveltia-cms.js \
//     -o public/admin/sveltia-cms.js
//   shasum -a 256 public/admin/sveltia-cms.js
// Also bump the version in public/admin/index.html's upgrade comment.

const PINNED_VERSION = '0.170.9'
const EXPECTED_SHA256 =
  '6d7d823510f7bf6f5fcb2a2e130968ba0b5bc7c15aa5e53c4556bb69d8369d0d'

const bundleUrl = new URL('../../public/admin/sveltia-cms.js', import.meta.url)
const indexUrl = new URL('../../public/admin/index.html', import.meta.url)

describe('vendored Sveltia CMS bundle integrity', () => {
  it('matches the pinned sha256 of @sveltia/cms', () => {
    const bytes = readFileSync(bundleUrl)
    const digest = createHash('sha256').update(bytes).digest('hex')
    expect(digest).toBe(EXPECTED_SHA256)
  })

  it('admin page references the pinned version so the hash cannot silently drift', () => {
    const html = readFileSync(indexUrl, 'utf8')
    expect(html).toContain(`@sveltia/cms@${PINNED_VERSION}`)
  })
})
