const BASE_URL =
  process.env.PAYDUNYA_MODE === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";

function headers() {
  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY,
    "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY,
    "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN,
  };
}

export async function createInvoice({ amount, description, userId, siteUrl }) {
  const res = await fetch(`${BASE_URL}/checkout-invoice/create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      invoice: { total_amount: amount, description },
      store: { name: "BourseUp" },
      actions: {
        cancel_url: `${siteUrl}/pricing`,
        return_url: `${siteUrl}/pricing?success=true`,
        callback_url: `${siteUrl}/api/checkout/webhook`,
      },
      custom_data: { userId },
    }),
  });
  return res.json();
}

export async function confirmInvoice(token) {
  const res = await fetch(`${BASE_URL}/checkout-invoice/confirm/${token}`, {
    headers: headers(),
  });
  return res.json();
}
