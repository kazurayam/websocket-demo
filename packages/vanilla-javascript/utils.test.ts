import { describe, test, expect } from 'bun:test'
import { getServerName } from './utils'

describe("utils", () => {
    test("getServerName", () => {
        const shortName = getServerName(import.meta.url)
        expect(shortName).toEqual('vanilla-javascript/utils.test.ts')
    })
})
