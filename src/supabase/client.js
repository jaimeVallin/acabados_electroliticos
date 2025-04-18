import { createClient } from "@supabase/supabase-js";

const projectURL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const projectKey = import.meta.env.VITE_SUPABASE_PROJECT_KEY;

export const supabase = createClient(projectURL, projectKey, {
  auth: {
    persistSession: false,       // Desactiva el almacenamiento persistente
    autoRefreshToken: false,     // Evita la renovación automática
    detectSessionInUrl: false    // Mejor seguridad
  }
});