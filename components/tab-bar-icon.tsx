import { View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

type TabBarIconProps = {
  Icon: LucideIcon;
  focused: boolean;
  size?: number;
};

export function TabBarIcon({ Icon, focused, size = 22 }: TabBarIconProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
      {focused ? (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#EC4899',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={size} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      ) : (
        <Icon size={size} color="#9CA3AF" strokeWidth={2} />
      )}
    </View>
  );
}

