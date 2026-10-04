import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MILESTONES = [7, 3, 1, 0];

serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: rows, error } = await admin
    .from("user_scholarships")
    .select("id, user_id, status, scholarships(name, deadline, official_link)")
    .not("status", "in", '("accepted","rejected")');

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const { data: authList } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = Object.fromEntries(authList.users.map((u) => [u.id, u.email]));

  let sent = 0;

  for (const row of rows) {
    const deadline = row.scholarships?.deadline;
    if (!deadline) continue;

    const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (!MILESTONES.includes(daysLeft)) continue;

    const { error: logError } = await admin
      .from("reminder_log")
      .insert({ user_scholarship_id: row.id, days_before: daysLeft });
    if (logError) continue; // déjà envoyé pour ce cap

    const email = emailById[row.user_id];
    if (!email) continue;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "BourseUp <onboarding@resend.com>",
        to: email,
        subject:
          daysLeft === 0
            ? `Aujourd'hui : deadline pour ${row.scholarships.name}`
            : `Plus que ${daysLeft} jour(s) pour ${row.scholarships.name}`,
        html: `<p>Bonjour,</p>
               <p>La deadline pour <strong>${row.scholarships.name}</strong> approche : il reste ${daysLeft} jour(s).</p>
               <p><a href="${row.scholarships.official_link}">Voir la bourse</a></p>
               <p>— BourseUp</p>`,
      }),
    });

    if (emailRes.ok) sent++;
    else console.error("Resend error:", emailRes.status, await emailRes.text());
  }

  return new Response(JSON.stringify({ sent }), { status: 200 });
});
