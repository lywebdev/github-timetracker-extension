// utils/time.js

/**
 * Форматирует секунды в читаемый вид (5m 30s)
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
}

/**
 * Считает время с указанной даты до текущего момента
 * @param {string|Date} startTime
 * @returns {string}
 */
export function timeStringSince(startTime) {
    const date = new Date(startTime);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    return formatTime(seconds);
}

/**
 * Преобразует секунды в объект {minutes, seconds}
 * @param {number} totalSeconds
 * @returns {object}
 */
export function splitSeconds(totalSeconds) {
    return {
        minutes: Math.floor(totalSeconds / 60),
        seconds: Math.floor(totalSeconds % 60)
    };
}