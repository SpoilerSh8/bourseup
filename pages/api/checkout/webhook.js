import qs from "qs";
import { confirmInvoice } from "../../../lib/paydunya";
import { supabaseAdmin } from "../../../lib/supabaseClient";

// PayDunya poste en application/x-www-form-urlencoded avec des clés imbriquées
// (data[invoice][token]=...) — on désactive le bodyParser JSON par défaut de Next.js
// pour lire et décoder le corps brut nous-mêmes.
export const config = {
  api: { bodyParser: false },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const raw = await getRawBody(req);
  const parsed = qs.parse(raw);
  const payload = parsed.data || parsed;

  const token = payload?.invoice?.token;
  if (!token) return res.status(400).json({ error: "token manquant" });

  // On ne fait JAMAIS confiance à l'IPN brut : on reconfirme directement auprès de PayDunya.
  const confirmation = await confirmInvoice(token);

  if (confirmation.status === "completed") {
    const userId = confirmation.custom_data?.userId;
    if (userId) {
      const admin = supabaseAdmin();
      await admin.from("subscriptions").update({ plan: "pro" }).eq("user_id", userId);
      await admin.from("payments").upsert(
        {
          invoice_token: token,
          user_id: userId,
          amount: confirmation.invoice?.total_amount,
          status: "completed",
        },
        { onConflict: "invoice_token" }
      );
    }
  }

  return res.status(200).send("OK");
}
