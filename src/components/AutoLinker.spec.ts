import { it, expect, describe } from 'vitest'

import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { formatHref, LinkType, testLinkText, type LinkInfo } from './AutoLinker'
import AutoLinker from './AutoLinker.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/user/:email', component: { template: '<div/>' } },
    { path: '/workgroup/:id', component: { template: '<div/>' } },
  ],
})

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
  testCases.forEach((tests, expected) => {
    tests.forEach((test) => {
      it(`${test} should be a ${expected}`, () => {
        expect(testLinkText(test).type).toBe(expected)
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
  testCases.forEach((test, expected) => {
    it(`${test.matches[0]} should format to ${expected}`, () => {
      expect(formatHref(test)).toBe(expected)
    })
  })
})

describe('renders hrefs properly', () => {
  it('renders an email as an internal /user/:email link', async () => {
    const wrapper = mount(AutoLinker, {
      props: { text: 'whd@mozilla.com' },
      global: { plugins: [router] },
    })
    await router.isReady()
    const link = wrapper.find('a').attributes()['href']
    expect(link).toContain('/user/whd%40mozilla.com')
  })
})
