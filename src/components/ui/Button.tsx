import { Pressable, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary-600 active:bg-primary-700',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-gray-200 active:bg-gray-300',
    text: 'text-gray-800',
  },
  danger: {
    container: 'bg-danger-500 active:bg-danger-600',
    text: 'text-white',
  },
  ghost: {
    container: 'bg-transparent active:bg-gray-100',
    text: 'text-primary-600',
  },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const v = variantClasses[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`rounded-xl px-6 py-3.5 items-center justify-center ${v.container} ${isDisabled ? 'opacity-50' : ''}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' || variant === 'ghost' ? colors.primary[600] : 'white'}
          size="small"
        />
      ) : (
        <Text className={`text-base font-semibold ${v.text}`}>{title}</Text>
      )}
    </Pressable>
  );
}
