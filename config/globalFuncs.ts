export function toTitleCase(str: string): string {
    return str.replace(/\b\w/g, (char: string) => char.toUpperCase());
}

export function toCamelCase(str: string): string {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
            return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
        })
        .replace(/\s+/g, "");
}
