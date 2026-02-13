import { useEffect, useRef } from 'react';
import { Animated, type ViewProps } from 'react-native';

interface FadeInProps extends ViewProps {
  delay?: number;
  duration?: number;
  from?: { opacity?: number; translateY?: number; translateX?: number; scale?: number };
  children: React.ReactNode;
}

export function FadeIn({
  delay = 0,
  duration = 500,
  from = { opacity: 0, translateY: 20 },
  children,
  style,
  ...props
}: FadeInProps) {
  const opacity = useRef(new Animated.Value(from.opacity ?? 0)).current;
  const translateY = useRef(new Animated.Value(from.translateY ?? 0)).current;
  const translateX = useRef(new Animated.Value(from.translateX ?? 0)).current;
  const scale = useRef(new Animated.Value(from.scale ?? 1)).current;

  useEffect(() => {
    const animations = [
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ];
    if (from.translateY !== undefined) {
      animations.push(
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        }),
      );
    }
    if (from.translateX !== undefined) {
      animations.push(
        Animated.timing(translateX, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        }),
      );
    }
    if (from.scale !== undefined) {
      animations.push(
        Animated.timing(scale, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        }),
      );
    }
    Animated.parallel(animations).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
