import { beforeEach, describe, expect, it, vi } from 'vitest'

const { registerSWMock } = vi.hoisted(() => ({
    registerSWMock: vi.fn(),
}))

vi.mock('virtual:pwa-register', () => ({
    registerSW: registerSWMock,
}))

import { enablePwa } from '../pwa'

describe('enablePwa', () => {
    beforeEach(() => {
        registerSWMock.mockReset()
    })

    it('registers the service worker for installability', () => {
        enablePwa()

        expect(registerSWMock).toHaveBeenCalledWith(
            expect.objectContaining({ immediate: true }),
        )
    })
})
