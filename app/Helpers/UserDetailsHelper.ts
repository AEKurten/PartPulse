import { useMemo } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useProfileStore } from "../stores/userProfileStore";

export const useUserData = () => {
    const { profile, loading } = useProfileStore();
    const session = useAuthStore((state) => state.session);

    return useMemo(() => {
        if (loading) {
            return null;
        }

        return {
            name: profile?.username || 'User',
            email: session?.user.email || 'add email',
            avatar: profile?.avatar_url || null, // Return null instead of Unsplash image
        };
    }, [profile, session, loading]);
};