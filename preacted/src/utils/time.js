export class TimeService {
    static formatTime(seconds, offsetSeconds = 0) {
        const totalSeconds = Math.floor(seconds + offsetSeconds);
        const m = Math.floor(totalSeconds / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${m}m ${s < 10 ? '0' : ''}${s}s`;
    }

    static timeStringSince(startTime, offsetSeconds = 0) {
        const date = new Date(startTime);
        if (isNaN(date.getTime())) {
            return this.formatTime(0, offsetSeconds);
        }
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        return this.formatTime(seconds, offsetSeconds);
    }

    static splitSeconds(totalSeconds) {
        return {
            minutes: Math.floor(totalSeconds / 60),
            seconds: Math.floor(totalSeconds % 60),
        };
    }
}