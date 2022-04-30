export default function machineFriendlyName(name: string) {
    return name
            .replace(/[^A-Za-z0-9 ]/g,'') // Remove unwanted characters, only accept alphanumeric and space
            .replace(/\s{2,}/g,' ') // Replace multi spaces with a single space
            .trim().toLowerCase() // Make it lowercase (this line is not in the original package, I added it)
            .replace(/\s/g, "-") // Replace space with a '-' symbol)
}
// These four lines are from https://github.com/mrded/machine-name/blob/master/index.js.
// The package wasn't TS-compatible, so I had to copy the code.