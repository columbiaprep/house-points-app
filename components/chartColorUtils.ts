// Utility functions for generating dynamic chart colors based on house colors

// Map house colorName to RGB values for consistent color generation
const colorMap: { [key: string]: { r: number; g: number; b: number } } = {
    blue: { r: 59, g: 130, b: 246 }, // blue-500
    green: { r: 34, g: 197, b: 94 }, // green-500
    red: { r: 239, g: 68, b: 68 }, // red-500
    yellow: { r: 234, g: 179, b: 8 }, // yellow-500
    purple: { r: 168, g: 85, b: 247 }, // purple-500
    pink: { r: 236, g: 72, b: 153 }, // pink-500
    orange: { r: 249, g: 115, b: 22 }, // orange-500
    gray: { r: 107, g: 114, b: 128 }, // gray-500
    silver: { r: 156, g: 163, b: 175 }, // gray-400 (for silver)
    gold: { r: 245, g: 158, b: 11 }, // amber-500 (for gold)
    cyan: { r: 6, g: 182, b: 212 }, // cyan-500
};

/**
 * Generate an array of color variants based on a house colorName
 * Creates gradual opacity variations for chart segments
 */
export function generateHouseColors(
    colorName: string,
    count: number = 5,
    baseOpacity: number = 0.8,
): string[] {
    const baseColor = colorMap[colorName.toLowerCase()] || colorMap.blue;
    const colors: string[] = [];

    for (let i = 0; i < count; i++) {
        // Create opacity gradient from light to dark
        const opacity = baseOpacity - i * 0.15;
        const finalOpacity = Math.max(opacity, 0.3); // Ensure minimum visibility

        colors.push(
            `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${finalOpacity})`,
        );
    }

    return colors;
}

/**
 * Generate border colors that complement the background colors
 */
export function generateBorderColors(
    colorName: string,
    count: number = 5,
): string[] {
    const baseColor = colorMap[colorName.toLowerCase()] || colorMap.blue;
    const colors: string[] = [];

    for (let i = 0; i < count; i++) {
        // Use full opacity for borders to make them more defined
        colors.push(`rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 1)`);
    }

    return colors;
}

/**
 * Generate a single accent color for highlights
 */
export function generateAccentColor(colorName: string): string {
    const baseColor = colorMap[colorName.toLowerCase()] || colorMap.blue;

    return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.9)`;
}
