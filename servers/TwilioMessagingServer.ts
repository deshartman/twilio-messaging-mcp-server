/* NOTE: The Twilio package is a CommonJS module, but we're using ES modules (type: "module" in package.json).
 When importing a CommonJS module in an ES module context, we can't use named imports directly.
 Instead, we import the entire module as a default import and then extract the named exports.
 */
import pkg from 'twilio';
const { Twilio } = pkg;
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message.js";

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
 */
class TwilioMessagingServer {
    accountSid: string;
    apiKey: string;
    apiSecret: string;
    number: string;
    twilioClient: any; // Using 'any' type for the Twilio client since we don't have proper type definitions

    constructor(accountSid: string, apiKey: string, apiSecret: string, number: string) {
        this.accountSid = accountSid;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.number = number;
        this.twilioClient = new Twilio(this.apiKey, this.apiSecret, { accountSid: this.accountSid });
    }

    /**
     * Sends an SMS message using the configured Twilio number.
     * 
     * https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
     * 
     * @param {string} to - The destination phone number in E.164 format
     * @param {string} message - The message content to send
     * @returns {Promise<string|null>} The Twilio message SID if successful, null if sending fails
     */
    async sendSMS(to: string, message: string): Promise<MessageInstance | null> {
        try {
            console.error(`TwilioMessagingService: Sending SMS to: ${to} with message: ${message}`);

            const response = await this.twilioClient.messages.create({
                body: message,
                from: this.number,
                to: to
            });
            return response;
        } catch (error) {
            console.error(`TwilioMessagingService: Error sending SMS: ${error}`);
            return null;
        }
    }

    getStatusCallbackData(callSid: string): StatusCallback | null {
        // This function should return the status callback data for the given call SID
        // You can implement this function to retrieve the data from your database or any other source
        // For now, we will just return a dummy object
        return {    // TODO: Temp dummy data
            CallSid: callSid,
            Status: "completed",
            Duration: 120
        };
    }
}

export { TwilioMessagingServer };
