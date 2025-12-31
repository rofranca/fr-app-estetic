
const ASAAS_URL = process.env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3";
const ASAAS_KEY = process.env.ASAAS_API_KEY || "";

async function fetchAsaas(endpoint: string, method: string, body?: any) {
    if (!ASAAS_KEY) {
        console.warn("ASAAS_API_KEY nao configurada.");
        return null;
    }

    const response = await fetch(`${ASAAS_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "access_token": ASAAS_KEY
        },
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("Erro Asaas:", data);
        throw new Error(data.errors?.[0]?.description || "Erro na API Asaas");
    }
    return data;
}

export const AsaasService = {
    createCustomer: async (customerData: { name: string; cpf: string; email: string; phone?: string }) => {
        // Check if exists first (simple check by email - in prod check by CPF)
        const existing = await fetchAsaas(`/customers?email=${customerData.email}`, "GET");
        if (existing && existing.data && existing.data.length > 0) {
            return existing.data[0];
        }

        return await fetchAsaas("/customers", "POST", {
            name: customerData.name,
            cpfCnpj: customerData.cpf,
            email: customerData.email,
            mobilePhone: customerData.phone,
            notificationDisabled: false
        });
    },

    createCharge: async (data: { customerId: string; value: number; dueDate: string; description: string }) => {
        return await fetchAsaas("/payments", "POST", {
            customer: data.customerId,
            billingType: "BOLETO", // Default to Boleto for now
            value: data.value,
            dueDate: data.dueDate,
            description: data.description,
            postalService: false
        });
    },

    checkPaymentStatus: async (paymentId: string) => {
        const data = await fetchAsaas(`/payments/${paymentId}`, "GET");
        return data?.status;
    }
};
