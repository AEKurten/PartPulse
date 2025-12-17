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
            avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80',
        };
    }, [profile, session, loading]);
};