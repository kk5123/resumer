// shared/hooks/useAsyncEffect.ts
import { useEffect, useRef } from 'react';

/**
 * 非同期処理を安全に実行するuseEffect
 * アンマウント時のキャンセルを自動処理
 */
export function useAsyncEffect(
  effect: () => Promise<void>,
  deps: React.DependencyList
) {
  const cancelledRef = useRef(false);
  
  useEffect(() => {
    cancelledRef.current = false;
    
    effect().catch((e) => {
      if (!cancelledRef.current) {
        console.error('[useAsyncEffect]', e);
      }
    });
    
    return () => {
      cancelledRef.current = true;
    };
  }, deps);
}

/**
 * mounted状態を管理するref
 */
export function useMountedRef() {
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  return mountedRef;
}
