import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, PressableProps, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

const ReducedMotion = createContext(false);
const NativePressable = Animated.createAnimatedComponent(Pressable);
const nativeDriver = Platform.OS !== 'web';

export function useReducedMotion() {
  return useContext(ReducedMotion);
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive) setReduced(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { alive = false; subscription.remove(); };
  }, []);
  return <ReducedMotion.Provider value={reduced}>{children}</ReducedMotion.Provider>;
}

export function AnimatedPressable({ style, onPressIn, onPressOut, ...props }: PressableProps) {
  const reduced = useContext(ReducedMotion);
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);
  useEffect(() => () => scale.stopAnimation(), [scale]);
  function animate(value: number) {
    scale.stopAnimation();
    if (reduced) scale.setValue(1);
    else Animated.timing(scale, { toValue: value, duration: value === 1 ? 160 : 90, easing: Easing.out(Easing.quad), useNativeDriver: nativeDriver }).start();
  }
  return <NativePressable {...props}
    onPressIn={event => { setPressed(true); animate(.97); onPressIn?.(event); }}
    onPressOut={event => { setPressed(false); animate(1); onPressOut?.(event); }}
    style={[typeof style === 'function' ? style({ pressed }) : style, { transform: [{ scale }] }]}
  />;
}

// Animate transforms only; measuring layout during a transition must stay stable.
export function PageTransition({ children, distance = 10 }: { children: React.ReactNode; distance?: number }) {
  const reduced = useContext(ReducedMotion);
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) progress.setValue(1);
    else Animated.spring(progress, { toValue: 1, damping: 26, stiffness: 220, mass: 0.9, useNativeDriver: nativeDriver }).start();
    return () => progress.stopAnimation();
  }, [progress, reduced]);
  return <Animated.View pointerEvents="box-none" style={{ flex: 1, opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] }}>{children}</Animated.View>;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 220,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}) {
  const reduced = useContext(ReducedMotion);
  const opacity = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      return;
    }
    const animation = Animated.timing(opacity, {
      toValue: 1,
      delay,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => {
      animation.stop();
      opacity.stopAnimation();
    };
  }, [delay, duration, opacity, reduced]);
  return <Animated.View style={[{ opacity }, style]}>{children}</Animated.View>;
}

export function SpringIn({
  children,
  delay = 0,
  from = 0.94,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  from?: number;
  style?: ViewStyle;
}) {
  const reduced = useContext(ReducedMotion);
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.spring(progress, {
        toValue: 1,
        damping: 18,
        stiffness: 260,
        mass: 0.8,
        useNativeDriver: nativeDriver,
      }),
    ]);
    animation.start();
    return () => {
      animation.stop();
      progress.stopAnimation();
    };
  }, [delay, progress, reduced]);
  return (
    <Animated.View
      style={[
        {
          opacity: progress,
          transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [from, 1] }) }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Soft shimmer bar for skeleton placeholders. Static when reduced motion is on. */
export function Shimmer({
  height = 14,
  width = '100%',
  radius = 8,
  style,
}: {
  height?: number;
  width?: number | `${number}%`;
  radius?: number;
  style?: ViewStyle;
}) {
  const t = useTheme();
  const reduced = useContext(ReducedMotion);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      progress.setValue(0.35);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver }),
        Animated.timing(progress, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      progress.stopAnimation();
    };
  }, [progress, reduced]);
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.55] });
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          height,
          width: width as number | `${number}%`,
          borderRadius: radius,
          backgroundColor: t.hover,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Three pulsing dots used for thinking / busy states. */
export function PulsingDots({
  color,
  size = 6,
  gap = 6,
}: {
  color?: string;
  size?: number;
  gap?: number;
}) {
  const t = useTheme();
  const reduced = useContext(ReducedMotion);
  const dots = useMemo(() => [0, 1, 2].map(() => new Animated.Value(reduced ? 0.55 : 0.25)), [reduced]);
  useEffect(() => {
    if (reduced) {
      dots.forEach(dot => dot.setValue(0.55));
      return;
    }
    const loops = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 140),
          Animated.timing(dot, { toValue: 1, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: nativeDriver }),
          Animated.timing(dot, { toValue: 0.25, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: nativeDriver }),
          Animated.delay(220),
        ]),
      ),
    );
    loops.forEach(loop => loop.start());
    return () => {
      loops.forEach(loop => loop.stop());
      dots.forEach(dot => dot.stopAnimation());
    };
  }, [dots, reduced]);
  return (
    <View
      accessibilityRole="progressbar"
      style={{ flexDirection: 'row', alignItems: 'center', gap, height: Math.max(20, size * 2), paddingVertical: 2 }}
    >
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color || t.muted,
            opacity: dot,
            transform: [{ scale: dot.interpolate({ inputRange: [0.25, 1], outputRange: [0.85, 1] }) }],
          }}
        />
      ))}
    </View>
  );
}
