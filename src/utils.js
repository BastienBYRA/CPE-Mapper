import { existsSync } from "fs"

export const isBoolean = (value) => {
    return (/true|false|True|False/).test(value)
}

export const isURL = (url) => {
    return (/http:\/\/|https:\/\//).test(url)
}

export const isFilePath = (filepath) => {
    return existsSync(filepath) 
}