import { create } from "zustand"

interface AuthUIStore {
  redirectAfterLogin?: string
  setRedirectAfterLogin: (redirectAfterLogin: string) => void
  clearRedirectAfterLogin: () => void
}

export const useAuthUIStore = create<AuthUIStore>((set) => ({
  redirectAfterLogin: undefined,
  setRedirectAfterLogin: (redirectAfterLogin: string) =>
    set({ redirectAfterLogin }),
  clearRedirectAfterLogin: () => set({ redirectAfterLogin: undefined }),
}))
