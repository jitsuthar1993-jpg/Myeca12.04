export type ListenConfig = {
  host: string;
  port: number;
};

export function getServerListenConfig(env: NodeJS.ProcessEnv = process.env): ListenConfig {
  const port = Number(env.PORT ?? 5000);
  return {
    host: env.HOST?.trim() || "127.0.0.1",
    port: Number.isFinite(port) && port > 0 ? port : 5000,
  };
}
