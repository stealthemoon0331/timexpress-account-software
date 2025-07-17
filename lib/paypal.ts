import { PAYPAL_BASE } from "@/app/config/setting"

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET!
// const PAYPAL_BASE = process.env.NODE_ENV === "production"
//   ? "https://api-m.paypal.com"
//   : "https://api-m.sandbox.paypal.com"

// const PAYPAL_BASE = "https://api-m.sandbox.paypal.com";

export async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64")
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
  const data = await res.json()
  
  if (!res.ok) throw new Error("Failed to get PayPal access token")
  return data.access_token
}

export async function createPayPalProduct(name: string, token: string) {
  const res = await fetch(`${PAYPAL_BASE}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  })
  const data = await res.json()
  
  if (!res.ok) throw new Error("Failed to create product")
  return data
}

export async function createPayPalPlan({
  productId,
  name,
  description,
  price,
}: {
  productId: string
  name: string
  description: string
  price: number
}, token: string) {
  const res = await fetch(`${PAYPAL_BASE}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
      name,
      description,
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // infinite
          pricing_scheme: {
            fixed_price: {
              value: price.toFixed(2),
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 1,
      },
    }),
  })
  const data = await res.json()

  if (!res.ok) throw new Error("Failed to create billing plan")
  return data
}
