# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.7] - 2025-04-07

### Added
- Added "bin" field to package.json to make the package executable via npx
- Improved direct execution support with proper shebang line and file permissions
- Enhanced documentation for npx usage

## [0.1.6] - 2025-03-04

### Fixed
- General code improvements and cleanup
- Updated example configurations
- Added template file for environment variables
- Improved documentation for setup and configuration

## [0.1.5] - 2025-03-04

### Added
- Integrated with `@deshartman/mcp-status-callback` package (v0.4.*) for improved callback handling
- Enhanced status callback functionality with better error handling
- Added server readiness checks before sending SMS messages

### Changed
- Refactored callback server initialization process
- Improved logging for callback events

## [0.1.4] - 2025-03-04

### Added
- Added runtime Node.js version check to ensure compatibility
- Improved error messages for Node version mismatches

### Changed
- Enhanced Node.js compatibility checks during initialization
- Updated dependencies to latest versions compatible with Node.js 18+

## [0.1.3] - 2025-04-03

### Changed
- Updated Node.js version requirement from >=16.0.0 to >=18.0.0 to align with dependencies
- Fixed compatibility issues with newer dependency versions that require Node.js 18+

## [0.1.2] - 2025-03-04

### Fixed
- Bug fixes
- Updated Node dependencies

## [0.1.1] - 2025-03-04

### Fixed
- Updated README.md to use the correct scoped package name (@deshartman/twilio-messaging-mcp-server) in all examples
- Fixed installation instructions to properly reference the scoped package name

## [0.1.0] - 2025-03-04

### Added
- Initial release
- Send SMS messages via Twilio API
- Status callback server using ngrok for receiving real-time message status updates
- Resource template for accessing status callback data
- Prompt for guiding LLMs on how to use the SMS sending tool
- Integration with MCP clients like Claude Desktop
- Secure credential handling without environment variables
- Twilio API Key authentication for improved security
