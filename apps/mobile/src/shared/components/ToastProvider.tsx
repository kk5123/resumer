import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'info' | 'success' | 'error';
type ToastOptions = { type?: ToastType; duration?: number };

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
};

type ToastContextValue = {
  showToast: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    const id = ++idRef.current;
    const item: ToastItem = {
      id,
      message,
      type: options?.type ?? 'info',
      duration: options?.duration ?? 2200,
    };
    setToasts((prev) => [...prev, item]);
  }, []);

  const handleRemove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastOverlay toasts={toasts} onRemove={handleRemove} />
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('ToastProviderがツリーにありません');
  return ctx;
}

const ToastOverlay: React.FC<{ toasts: ToastItem[]; onRemove: (id: number) => void }> = ({ toasts, onRemove }) => {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="none" style={[styles.overlay, { paddingBottom: insets.bottom + 12 }]}>
      {toasts.map((toast) => (
        <ToastBubble key={toast.id} item={toast} onDone={() => onRemove(toast.id)} />
      ))}
    </View>
  );
};

const ToastBubble: React.FC<{ item: ToastItem; onDone: () => void }> = ({ item, onDone }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(8)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 160, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(translate, { toValue: 0, duration: 160, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
      Animated.delay(item.duration),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(translate, { toValue: 8, duration: 180, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]),
    ]).start(onDone);
  }, [item, onDone, opacity, translate]);

  const bg = useMemo(() => {
    if (item.type === 'success') return '#e0f7eb';
    if (item.type === 'error') return '#fee2e2';
    return '#111827e6';
  }, [item.type]);

  const fg = useMemo(() => {
    if (item.type === 'success') return '#065f46';
    if (item.type === 'error') return '#991b1b';
    return '#f9fafb';
  }, [item.type]);

  return (
    <Animated.View style={[styles.toast, { backgroundColor: bg, transform: [{ translateY: translate }], opacity }]}>
      <Text style={[styles.toastText, { color: fg }]}>{item.message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
  toast: {
    maxWidth: '92%',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  toastText: { fontSize: 14, fontWeight: '600' },
});