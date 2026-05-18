import { it, expect, describe } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  parseNdjson,
  groupMemberRowsByWorkgroup,
  buildWorkgroupInput,
  type WorkgroupRow,
  type SubgroupMemberRow,
} from './ndjson'
import { newWorkGroup } from './workgroups'

const fixture = (name: string) =>
  readFileSync(resolve(process.cwd(), 'public', name), 'utf8')

describe('ndjson → DAWG pipeline against mock fixtures', () => {
  const wgRows = parseNdjson<WorkgroupRow>(fixture('mock_workgroups.ndjson'))
  const memberRows = parseNdjson<SubgroupMemberRow>(fixture('mock_subgroup_members.ndjson'))
  const memberRowsByWg = groupMemberRowsByWorkgroup(memberRows)

  const build = (name: string) => {
    const row = wgRows.find((r) => r.workgroup === name)!
    return newWorkGroup(name, 'mockdata', buildWorkgroupInput(row, memberRowsByWg.get(name)))
  }

  it('preserves sponsor, managers, and links on madeup-workgroup-two', () => {
    const dawg = build('madeup-workgroup-two')
    expect(dawg.sponsor).toBe('sponsor@mozilla.com')
    expect(dawg.managers).toContain('manager@mozilla.com')
    expect(dawg.links).toContain('https://mozilla-hub.atlassian.net/browse/DSRE-2')
  })

  it('prefixes raw members with user:/workgroup:', () => {
    const dawg = build('madeup-workgroup-two')
    expect(dawg.members['workgroup:madeup-workgroup-two/admins']).toContain('user:admin1@mozilla.com')
    expect(dawg.members['workgroup:madeup-workgroup-two/developers']).toContain('user:dev1@mozilla.com')
    expect(dawg.members['workgroup:madeup-workgroup-two/developers']).toContain('workgroup:madeup-workgroup/developers')
  })

  it('includes service-account rows from subgroup_members as serviceAccount: members', () => {
    const dawg = build('madeup-workgroup')
    expect(dawg.members['workgroup:madeup-workgroup/developers']).toContain(
      'serviceAccount:task-madeup@madeup-project.iam.gserviceaccount.com',
    )
  })

  it('synthesizes the auto-google-group on every subgroup', () => {
    const dawg = build('madeup-workgroup')
    expect(dawg.google_groups['workgroup:madeup-workgroup/admins']).toContain(
      'group:gcp-wg-madeup-workgroup--admins@firefox.gcp.mozilla.com',
    )
  })

  it('carries member_metadata through to subgroup-prefixed keys', () => {
    const dawg = build('madeup-workgroup-two')
    expect(dawg.member_metadata['workgroup:madeup-workgroup-two/developers']['dev1@mozilla.com'].github_login).toBe('dev1')
  })
})
