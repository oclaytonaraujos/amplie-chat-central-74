
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Não tentar novamente em erros de autenticação
        if (error?.message?.includes('JWT')) return false;
        return failureCount < 2;
      },
    },
  },
});
