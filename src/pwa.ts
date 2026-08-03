import { registerSW } from 'virtual:pwa-register'

export function enablePwa() {
    registerSW({
        immediate: true,
    })
}
