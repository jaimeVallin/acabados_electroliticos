// src/hooks/useAuthLifecycle.js
import { useEffect } from 'react';
import { supabase } from '../client';

export const useAuthLifecycle = () => {
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await supabase.auth.signOut();
        // Limpieza adicional si es necesaria
        localStorage.removeItem(`sb-${supabase.supabaseUrl}-auth-token`);
        sessionStorage.clear();
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};