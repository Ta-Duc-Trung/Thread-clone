export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

export const appOrigin = () => `${window.location.origin}${BASE_PATH}`