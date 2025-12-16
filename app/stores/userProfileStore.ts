import { create } from 'zustand';

type userDetails = {
    username: string;
    avatar_url: string | null;
    bio: string | null;
    setUserDetails: (details: Partial<userDetails> | null) => void;
}

export const useProfileStore = create<userDetails>((set) => ({
    username: '',
    avatar_url: null,
    bio: null,
    setUserDetails: (details) => set((state) => ({
        ...state,
        ...details
    })),
}));