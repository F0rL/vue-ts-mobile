declare module 'nprogress' {
  const NProgress: {
    start(): void
    done(force?: boolean): void
    configure(options: Record<string, unknown>): void
    set(n: number): void
    inc(): void
    remove(): void
    isStarted(): boolean
    settings: Record<string, unknown>
  }
  export default NProgress
}
