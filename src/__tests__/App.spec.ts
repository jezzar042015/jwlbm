import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { hydrationMessage, hydrationProgress, isHydrating } from '../bootstrap'

describe('App', () => {
  it('shows the hydration loading screen while persisted state is restoring', () => {
    isHydrating.value = true
    hydrationMessage.value = 'Preparing application...'
    hydrationProgress.value = null

    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Restoring Session')
    expect(wrapper.text()).toContain('Loading your library data')
    expect(wrapper.text()).toContain('Preparing application...')
  })
})
