import { describe, it, test, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { LinkType, testLinkText } from './AutoLinker'
import AutoLinker from './AutoLinker.vue'

const testCases: Map<LinkType, string[]> = new Map([
  [LinkType.PhoneBook, ['whd@mozilla.com', 'fbar@thunderbird.net', 'wbang@mozillafoundation.org']],
  [LinkType.GoogleGroup, ['group:dataops@mozilla.com', 'group:foobar@firefox.gcp.mozilla.com']],
  [LinkType.ServiceAccount, ['serviceAccount:foo-bar-9@some-cool-project.iam.gserviceaccount.com']]
])

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(AutoLinker, { props: { text: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })

  it('should identify link types correctly', () => {
    testCases.forEach(async (tests, exepected) => {
      await tests.forEach(async (test) => {
        const result = testLinkText(test)
        await expect(result.type).toBe(exepected)
      })
    })
  })
})
