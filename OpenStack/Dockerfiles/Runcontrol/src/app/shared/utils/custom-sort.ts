export function customConfigSortFn(a: string, b: string) {
    let aGroup = a.split('/')[2];
    let bGroup = b.split('/')[2];
    // 'central' goes first against others
    if (aGroup === 'central' && bGroup !== 'central') {
        return -1;
    } else if (bGroup === 'central' && aGroup !== 'central') {
        return 1;
    // 'dip' goes first against others except 'central'
    } else if (aGroup === 'dip' && bGroup !== 'dip') {
        return -1;
    } else if (bGroup === 'dip' && aGroup !== 'dip') {
        return 1;
    // otherwise sort alphabetically (case sensitive is OK - doesn't matter)
    } else if (a < b) {
        return -1;
    } else if (b < a) {
        return 1;
    }
    return 0;
}
