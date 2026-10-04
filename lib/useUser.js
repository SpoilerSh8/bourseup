import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// Hook simple : renvoie l'utilisateur connecté (ou null) et se met à jour en temps réel.
export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, loading };
}
