import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FloatingActionButtonProps = {
  onPress?: () => void;
};

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/sell/step1');
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.fab,
        {
          bottom: insets.bottom , // Closer to tab bar
          right: 24,
        },
      ]}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={['#EC4899', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            {
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

