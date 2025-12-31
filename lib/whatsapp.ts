
// Mock WhatsApp Service

export const WhatsAppService = {
    sendMessage: async (phone: string, message: string) => {
        // Call WhatsApp API wrapper (e.g. WPPConnect, Twilio, or Z-API)
        console.log(`[WhatsApp] Sending to ${phone}: ${message}`);
        return true;
    },

    sendConfirmation: async (clientName: string, phone: string, date: Date, serviceName: string) => {
        const msg = `Olá ${clientName}, confirmamos seu agendamento de ${serviceName} para ${date.toLocaleString()}.`;
        return WhatsAppService.sendMessage(phone, msg);
    },

    sendPaymentLink: async (clientName: string, phone: string, link: string) => {
        const msg = `Olá ${clientName}, segue o link para pagamento: ${link}`;
        return WhatsAppService.sendMessage(phone, msg);
    }
};
