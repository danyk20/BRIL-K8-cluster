export function makeUTCTimestampMSec(date: Date) {
    return date.getTime() - date.getTimezoneOffset() * 60000;
}

export function makeTimestampMSec(date: Date) {
    return date.getTime();
}

export function makeUTCTimestampSec(date: Date) {
    return Math.round((date.getTime() - date.getTimezoneOffset() * 60000)/1000);
}

export function makeTimestampSec(date: Date) {
    return Math.round(date.getTime()/1000);
}

export function makeISOWithoutMilliseconds(date: Date, utc: boolean) {
    if (utc) {
        date = new Date(makeUTCTimestampMSec(date));
    }
    return date.toISOString().split('.')[0] + 'Z';
}
