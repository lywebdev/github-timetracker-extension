export function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}m ${s < 10 ? "0" : ""}${s}s`
}

export function timeStringSince(startTime) {
    const seconds = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s < 10 ? "0" : ""}${s}s`
}