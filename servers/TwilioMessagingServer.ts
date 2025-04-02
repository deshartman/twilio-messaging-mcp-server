/* NOTE: The Twilio package is a CommonJS module, but we're using ES modules (type: "module" in package.json).
 When importing a CommonJS module in an ES module context, we can't use named imports directly.
 Instead, we import the entire module as a default import and then extract the named exports.
 */
import pkg from 'twilio';
const { Twilio } = pkg;
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message.js";
import { EventEmitter } from 'events';
import { CallbackHandler, CallbackEventData, CallbackHandlerOptions } from '@deshartman/mcp-status-callback';

/**
 * Interface for status callback data
 */
interface StatusCallback {
    CallSid: string;
    [key: string]: any;
}

/**
 * Service class for handling Twilio-related message operations. This class is an EventEmitter and can be used to listen for events.
 * 
 * NOTE: For authentication we are using API Key and Secret. This is not recommended for production use. See https://www.twilio.com/docs/usage/requests-to-twilio
 * 
 * @class
 * @property {string} accountSid - Twilio account SID
 * @property {string} apiKey - Twilio API Key
 * @property {string} apiSecret - Twilio API Secret
 * @property {string} number - Twilio phone number to use as the sender
 * @property {twilio.Twilio} twilioClient - Initialized Twilio client instance
 * @property {CallbackHandler} callbackHandler - Handler for status callbacks
 * @property {string} callbackUrl - Public URL for status callbacks
 */
class TwilioMessagingServer extends EventEmitter {
    accountSid: string;
    apiKey: string;
    apiSecret: string;
    number: string;
    twilioClient: any; // Using 'any' type for the Twilio client since we don't have proper type definitions
    private callbackHandler: CallbackHandler | null = null;
    private callbackUrl: string | null = null;
    private isServerReady: boolean = false;

    constructor(accountSid: string, apiKey: string, apiSecret: string, number: string) {
        super(); // Initialize EventEmitter

        this.accountSid = accountSid;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.number = number;
        this.twilioClient = new Twilio(this.apiKey, this.apiSecret, { accountSid: this.accountSid });

        // Initialize the callback handler using environment variables
        const ngrokAuthToken = process.env.NGROK_AUTH_TOKEN;
        const customDomain = process.env.NGROK_CUSTOM_DOMAIN;

        if (ngrokAuthToken) {
            const options: CallbackHandlerOptions = {
                ngrokAuthToken,
                customDomain
            };

            this.callbackHandler = new CallbackHandler(options);

            // Set up the callback event listener
            this.callbackHandler.on('callback', (data: CallbackEventData) => {
                // { level: 'info', queryParameters: queryParameters, body: body }
                // Emit the event to the calling function instead of logging
                this.emit('callback', data.body);
            });

            // Start the server immediately
            this.startCallbackServer().catch(error => {
                console.error('Failed to start callback server:', error);
            });
        } else {
            console.error('NGROK_AUTH_TOKEN not provided. Callback server will not be started.');
        }
    }

    /**
     * Private method to start the callback server
     * @returns {Promise<void>}
     * @private
     */
    private async startCallbackServer(): Promise<void> {
        if (!this.callbackHandler) {
            throw new Error('Callback handler not initialized');
        }

        try {
            this.callbackUrl = await this.callbackHandler.start();
            this.isServerReady = true;
            this.emit('log', { level: 'info', message: `TwilioMessagingService: Callback server started with URL: ${this.callbackUrl}` });
        } catch (error) {
            console.error('Error starting callback server:', error);
            throw error;
        }
    }

    /**
     * Checks if the callback server is ready
     * @returns {boolean} True if the server is ready, false otherwise
     */
    isCallbackServerReady(): boolean {
        return this.isServerReady;
    }

    /**
     * Gets the callback URL
     * @returns {string|null} The callback URL if the server is ready, null otherwise
     */
    getCallbackUrl(): string | null {
        return this.callbackUrl;
    }

    /**
     * Sends an SMS message using the configured Twilio number.
     * 
     * https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
     * 
     * @param {string} to - The destination phone number in E.164 format
     * @param {string} message - The message content to send
     * @returns {Promise<MessageInstance|null>} The Twilio message instance if successful, null if sending fails
     * @throws {Error} If the callback server is not ready
     */
    async sendSMS(to: string, message: string): Promise<MessageInstance | null> {
        // Check if the callback server is ready
        if (!this.isCallbackServerReady() || !this.callbackUrl) {
            const error = new Error("Callback server is not ready. Cannot send SMS without status callback. Please try again.");
            console.error('messageError', error);
            throw error;
        }

        try {
            this.emit('log', { level: 'info', message: `TwilioMessagingService: Sending SMS to: ${to} with message: ${message}` });

            const messageOptions: any = {
                body: message,
                from: this.number,
                to: to,
                statusCallback: this.callbackUrl
            };

            const response: any = await this.twilioClient.messages.create(messageOptions);
            this.emit('log', { level: 'info', message: response });

            return response;
        } catch (error) {
            console.error(`TwilioMessagingService: Error sending SMS: ${error}`);
            return null;
        }
    }

}

export { TwilioMessagingServer };
