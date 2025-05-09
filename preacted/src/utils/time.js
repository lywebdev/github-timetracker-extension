export class TimeService {
    static formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}m ${s < 10 ? '0' : ''}${s}s`;
    }

    static timeStringSince(startTime) {
        const date = new Date(startTime);
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        return this.formatTime(seconds);
    }

    static splitSeconds(totalSeconds) {
        return {
            minutes: Math.floor(totalSeconds / 60),
            seconds: Math.floor(totalSeconds % 60)
        };
    }
}