// utils.ts

export function getServerName(tsFilePath: string) {
    const delimiter = 'packages/'
    return tsFilePath.substring(tsFilePath.indexOf(delimiter) + delimiter.length)
}
