// Un abonnement sans date de fin (ex: accordé manuellement par un admin) est
// considéré actif indéfiniment. Avec une date, il doit être dans le futur.
export function isProActive(sub) {
  if (!sub || sub.plan !== "pro") return false;
  if (!sub.current_period_end) return true;
  return new Date(sub.current_period_end) > new Date();
}

export function isProExpired(sub) {
  return sub?.plan === "pro" && !isProActive(sub);
}
