export function createPorts<T>(name: string) {
  let ports: T | undefined;
  return {
    set(value: T) {
      ports = value;
      if (__DEV__) console.log(`[${name}] initialized`)
    },
    get(): T {
      if (!ports) throw new Error(`${name} が初期化されていません。bootstrapを確認してください。`);
      return ports;
    }
  }
}
