import { it, expect, describe } from 'vitest'

import { mount } from '@vue/test-utils'
import { formatHref, LinkType, testLinkText, type LinkInfo } from './AutoLinker'
import AutoLinker from './AutoLinker.vue'

describe('should identify link types correctly', () => {
  const testCases: Map<LinkType, string[]> = new Map([
    [
      LinkType.PhoneBook,
      ['whd@mozilla.com', 'fbar@thunderbird.net', 'wbang@mozillafoundation.org']
    ],
    [LinkType.GoogleGroup, ['group:dataops@mozilla.com', 'group:foobar@firefox.gcp.mozilla.com']],
    [
      LinkType.ServiceAccount,
      ['serviceAccount:foo-bar-9@some-cool-project.iam.gserviceaccount.com']
    ],
    [LinkType.WorkGroup, ['workgroup:madeup-workgroup-two', 'workgroup:madeup-workgroup-42']],
    [
      LinkType.SubGroup,
      [
        'workgroup:madeup-workgroup-two/redash',
        'workgroup:madeup-workgroup-two/external-outerbounds-task-madeup2'
      ]
    ]
  ])
  testCases.forEach((tests, exepected) => {
    tests.forEach((test) => {
      it(`${test} should be a ${exepected}`, () => {
        expect(testLinkText(test).type).toBe(exepected)
      })
    })
  })
})

describe('should format links correctly', () => {
  const testCases: Map<string, LinkInfo> = new Map([
    [
      'https://people.mozilla.org/s?who=staff&query=whd',
      {
        type: LinkType.PhoneBook,
        matches: ['whd@mozilla.com', 'whd']
      }
    ]
  ])
  testCases.forEach((test, exepected) => {
    it(`${test.matches[0]} should format to ${exepected}`, () => {
      expect(formatHref(test)).toBe(exepected)
    })
  })
})

describe('renders hrefs properly', () => {
  const testCases: Map<string, string> = new Map([
    ['https://people.mozilla.org/s?who=staff&query=whd%40mozilla.com', 'whd@mozilla.com']
  ])

  testCases.forEach((input, exepected) => {
    it(`${input} should have an href of ${exepected}`, () => {
      const wrapper = mount(AutoLinker, { props: { text: input } })
      const link = wrapper.find('[href]').attributes()['href']
      expect(link).toBe(exepected)
    })
  })
})
