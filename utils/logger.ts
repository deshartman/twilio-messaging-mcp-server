// Check if running in an MCP environment
const isMcpEnvironment = process.argv.length >= 2 && process.argv[2].startsWith('AC');

// Disable colors when running in MCP environment to avoid JSON parsing issues
const colors = isMcpEnvironment ? {
    reset: '',
    green: '',
    red: ''
} : {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m'
};

/**
 * Gets the current timestamp in Sydney timezone
 * @returns {string} Formatted timestamp string
 */
const getSydneyTimestamp = (): string => {
    return new Date().toLocaleString('en-AU', {
        timeZone: 'Australia/Sydney',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

/**
 * Logs a standard message to the console
 * @param {string} identifier - The component or service identifier
 * @param {string} message - The message to log
 */
const logOut = (identifier: string, message: string): void => {
    console.log(`${colors.green}[${getSydneyTimestamp()}] [${identifier}] ${message}${colors.reset}`);
};

/**
 * Logs an error message to the console
 * @param {string} identifier - The component or service identifier
 * @param {string} message - The error message to log
 */
const logError = (identifier: string, message: string): void => {
    console.error(`${colors.red}[${getSydneyTimestamp()}] [${identifier}] ${message}${colors.reset}`);
};

export {
    logOut,
    logError
};
