import { supabaseAdmin } from "../../../lib/supabaseClient";
import { requireAdmin, logAdminAction } from "../../../lib/adminGuard";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Méthode non autorisée" });

  const { adminUserId, targetUserId, revealDocumentId, reason } = req.query;

  if (!(await requireAdmin(adminUserId))) {
    return res.status(403).json({ error: "Accès réservé aux admins." });
  }
  if (!targetUserId) {
    return res.status(400).json({ error: "targetUserId requis." });
  }

  const admin = supabaseAdmin();

  if (revealDocumentId) {
    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({ error: "Une justification est requise pour consulter le contenu d'un document." });
    }
    const { data: doc, error } = await admin
      .from("documents")
      .select("id, type, generated_text, created_at")
      .eq("id", revealDocumentId)
      .eq("user_id", targetUserId)
      .single();
    if (error) return res.status(404).json({ error: "Document introuvable." });

    await logAdminAction({
      adminId: adminUserId,
      targetUserId,
      action: "view_document_content",
      reason,
      metadata: { documentId: revealDocumentId },
    });

    return res.status(200).json(doc);
  }

  const { data: docs, error } = await admin
    .from("documents")
    .select("id, type, scholarship_id, created_at")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  await logAdminAction({ adminId: adminUserId, targetUserId, action: "view_documents_list" });

  return res.status(200).json(docs);
}
