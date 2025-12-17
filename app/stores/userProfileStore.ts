import { create } from 'zustand';

type UserDetails = {
    username: string;
    avatar_url: string | null;
    bio: string | null;
};

type ProfileStore = {
    profile: UserDetails | null;
    loading: boolean;
    setUserDetails: (details: UserDetails | null) => void;
    setLoading: (loading: boolean) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
    profile: null,
    loading: true,

    setUserDetails: (details) =>
        set({
            profile: details,
            loading: false,
        }),

    setLoading: (loading) =>
        set({
            loading,
        }),
}));
