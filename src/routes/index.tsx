import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kestrel Ops 控制台 · 线上 Java 日志实时排查" },
      {
        name: "description",
        content:
          "跨平台 AI Skill 管理界面：堡垒机凭据、项目服务器切换、滚动式在线日志、AI 命令流与操作记录留存。",
      },
      { property: "og:title", content: "Kestrel Ops 控制台 · 线上 Java 日志实时排查" },
      {
        property: "og:description",
        content: "通过堡垒机连接内网 Java 服务，在一个界面里看完日志、AI 命令与操作审计。",
      },
    ],
  }),
  component: Console,
});

type Level = "INFO" | "WARN" | "ERROR" | "TRACE";

type LogLine = {
  id: number;
  time: string;
  level: Level;
  text: string;
};

const SEED_LOGS: Omit<LogLine, "id">[] = [
  {
    time: "2024-11-08 14:32:01.224",
    level: "INFO",
    text: "[http-nio-8080-exec-4] c.k.gateway.filter.AuthFilter - 请求鉴权通过 userId=100233",
  },
  {
    time: "2024-11-08 14:32:01.310",
    level: "INFO",
    text: "[scheduling-1] c.k.gateway.job.SettleJob - 定时结算任务启动 batch=20241108",
  },
  {
    time: "2024-11-08 14:32:02.055",
    level: "WARN",
    text: "[http-nio-8080-exec-9] c.k.gateway.client.PayClient - 支付回调超时 retry=1/3 url=/pay/callback",
  },
  {
    time: "2024-11-08 14:32:03.881",
    level: "ERROR",
    text: "[http-nio-8080-exec-9] o.a.c.c.C.[.[.[/] - Exception processing request",
  },
  {
    time: "14:32:03.881",
    level: "TRACE",
    text: "java.util.concurrent.TimeoutException: Request timed out",
  },
  {
    time: "14:32:03.882",
    level: "TRACE",
    text: "  at org.apache.http.impl.nio.client.CloseableHttpAsyncClient...",
  },
  {
    time: "14:32:03.882",
    level: "TRACE",
    text: "  at com.kestra.gateway.client.PayClient.invoke(PayClient.java:142)",
  },
  {
    time: "2024-11-08 14:32:04.102",
    level: "INFO",
    text: "[scheduling-1] c.k.gateway.job.SettleJob - 结算完成 count=1284 amount=￥3,902,118.40",
  },
  {
    time: "2024-11-08 14:32:05.440",
    level: "INFO",
    text: "[http-nio-8080-exec-2] c.k.gateway.controller.OrderApi - 订单查询 orderId=SO202411088821",
  },
  {
    time: "2024-11-08 14:32:06.001",
    level: "INFO",
    text: "[main] o.s.b.a.l.ConditionEvaluationReport - Started GatewayApp in 42.11s",
  },
];

const STREAM_POOL: Omit<LogLine, "id" | "time">[] = [
  {
    level: "INFO",
    text: "[http-nio-8080-exec-6] c.k.gateway.controller.OrderApi - 订单创建成功 orderId=SO202411088{n}",
  },
  {
    level: "INFO",
    text: "[lettuce-nioEventLoop-4] c.k.gateway.cache.RedisTemplate - 缓存命中 key=order:detail:{n}",
  },
  {
    level: "WARN",
    text: "[http-nio-8080-exec-3] c.k.gateway.client.PayClient - 连接池占用 {n}% 接近上限",
  },
  {
    level: "ERROR",
    text: "[http-nio-8080-exec-9] c.k.gateway.client.PayClient - 支付回调失败 code=GW_TIMEOUT attempt={n}",
  },
  {
    level: "INFO",
    text: "[scheduling-2] c.k.gateway.job.HealthJob - 健康检查通过 latency={n}ms",
  },
];

const PROJECTS = [
  { name: "交易网关 prod-gateway", host: "10.20.4.17:22", active: true },
  { name: "支付核心 pay-core", host: "10.20.5.11:22", active: false },
  { name: "风控引擎 risk-engine", host: "10.20.6.4:22", active: false },
  { name: "消息中心 msg-center", host: "10.20.7.9:22", active: false },
];

const CREDENTIALS = [
  { label: "堡垒机 ID", value: "jms-8821" },
  { label: "Secret", value: "••••••••" },
  { label: "账号", value: "ops.lin" },
  { label: "域名", value: "bastion.kst" },
];

const AI_COMMANDS = [
  {
    cmd: "tail -f app.log",
    result: "实时跟随日志流，已识别 3 条 ERROR",
    highlight: false,
  },
  {
    cmd: 'grep -n "TimeoutException" app.log',
    result: "命中 14 处，集中在 PayClient.invoke",
    highlight: false,
  },
  {
    cmd: "jstack 21431",
    result: "线程 http-nio-8080-exec-9 处于 TIMED_WAITING，疑似连接池耗尽",
    highlight: true,
  },
];

const AUDIT = [
  { time: "14:31", who: "ops.lin", cmd: "grep -n Timeout", status: "成功" },
  { time: "14:28", who: "AI 助手", cmd: "jstack 21431", status: "成功" },
  { time: "14:25", who: "AI 助手", cmd: "tail -f app.log", status: "成功" },
  { time: "14:20", who: "ops.lin", cmd: "cat config.yml", status: "超时" },
  { time: "14:12", who: "ops.lin", cmd: "ps -ef | grep java", status: "成功" },
];

const LEVELS: Array<Level | "ALL"> = ["ALL", "INFO", "WARN", "ERROR"];

function levelClass(level: Level) {
  if (level === "WARN") return "text-warn";
  if (level === "ERROR") return "text-err";
  if (level === "TRACE") return "text-muted-foreground/60";
  return "text-accent";
}

function bodyClass(level: Level) {
  if (level === "WARN") return "text-warn/85";
  if (level === "ERROR") return "text-err/85";
  if (level === "TRACE") return "text-err/60";
  return "text-fg/90";
}

function statusClass(status: string) {
  if (status === "成功") return "bg-ok/15 text-ok";
  if (status === "超时") return "bg-warn/15 text-warn";
  return "bg-err/15 text-err";
}

function Console() {
  const [logs, setLogs] = useState<LogLine[]>(() =>
    SEED_LOGS.map((line, i) => ({ ...line, id: i })),
  );
  const [following, setFollowing] = useState(true);
  const [activeLevel, setActiveLevel] = useState<Level | "ALL">("ALL");
  const [activeProject, setActiveProject] = useState(0);
  const [copied, setCopied] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);
  const counter = useRef(SEED_LOGS.length);

  useEffect(() => {
    if (!following) return;
    const timer = window.setInterval(() => {
      const pick = STREAM_POOL[Math.floor(Math.random() * STREAM_POOL.length)];
      const now = new Date();
      const stamp = `${now.toLocaleDateString("sv-SE")} ${now.toLocaleTimeString("en-GB")}.${String(
        now.getMilliseconds(),
      ).padStart(3, "0")}`;
      counter.current += 1;
      const line: LogLine = {
        id: counter.current,
        time: stamp,
        level: pick!.level,
        text: pick!.text.replace("{n}", String(20 + Math.floor(Math.random() * 79))),

      };
      setLogs((prev) => [...prev.slice(-200), line]);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [following]);

  useEffect(() => {
    if (!following) return;
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs, following]);

  const visible =
    activeLevel === "ALL" ? logs : logs.filter((l) => l.level === activeLevel || l.level === "TRACE");

  return (
    <div className="min-h-screen bg-ink text-fg text-sm antialiased">
      <header className="sticky top-0 z-20 border-b border-line bg-panel/95">
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-brand text-base font-bold text-ink">
              K
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold">
                Kestrel<span className="font-normal text-muted-foreground"> Ops</span>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">skill · v0.4.1</div>
            </div>
          </div>
          <div className="mx-1 h-7 w-px bg-line" />
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="ops-pulse-dot absolute inline-flex size-full rounded-full bg-brand" />
              <span className="relative inline-flex size-2.5 rounded-full bg-brand" />
            </span>
            <span className="font-mono text-xs text-fg">
              {PROJECTS[activeProject]!.name.split(" ")[1]}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {PROJECTS[activeProject]!.host}
            </span>

          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-line bg-panel-2 px-2.5 py-1 font-mono text-[11px] text-muted-foreground md:inline-flex">
              <span className="size-1.5 rounded-full bg-accent" />
              堡垒机已连接
            </span>
            <button
              onClick={() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              }}
              className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-brand-hover"
            >
              {copied ? "链接已复制" : "分享技能配置"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        <aside className="w-60 shrink-0 overflow-y-auto border-r border-line bg-panel-2/60">
          <div className="border-b border-line p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              连接凭据
            </div>
            <div className="space-y-2 font-mono text-xs">
              {CREDENTIALS.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center justify-between rounded-md bg-ink/60 px-2.5 py-1.5 ring-1 ring-line"
                >
                  <span className="text-muted-foreground">{c.label}</span>
                  <span className="text-fg">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              项目 / 服务器
            </div>
            <div className="space-y-1">
              {PROJECTS.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => setActiveProject(i)}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                    i === activeProject
                      ? "bg-brand/15 text-brand ring-1 ring-brand/30"
                      : "text-muted-foreground hover:bg-panel-2"
                  }`}
                >
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${
                      i === activeProject ? "bg-brand" : "bg-line"
                    }`}
                  />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-line bg-panel px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">tail -f app.log</span>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => setFollowing(true)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  following
                    ? "bg-brand text-ink"
                    : "border border-line bg-panel-2 text-muted-foreground hover:text-fg"
                }`}
              >
                跟随
              </button>
              <button
                onClick={() => setFollowing(false)}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                  following
                    ? "border border-line bg-panel-2 text-muted-foreground hover:text-fg"
                    : "bg-brand text-ink font-semibold"
                }`}
              >
                暂停
              </button>
              <div className="mx-1 h-5 w-px bg-line" />
              <span className="font-mono text-[11px] text-muted-foreground">级别</span>
              {LEVELS.map((lv) => (
                <button
                  key={lv}
                  onClick={() => setActiveLevel(lv)}
                  className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                    activeLevel === lv
                      ? lv === "ERROR"
                        ? "border-err/30 bg-panel-2 text-err ring-1 ring-err/30"
                        : "border-line bg-panel-2 text-fg"
                      : "border-line bg-panel-2 text-muted-foreground hover:text-fg"
                  }`}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={streamRef}
            className="relative min-h-0 flex-1 overflow-y-auto bg-ink px-4 py-3 font-mono text-[13px] leading-[1.7]"
          >
            <div className="space-y-0.5">
              {visible.map((l) => (
                <div
                  key={l.id}
                  className="ops-log-in -mx-1 flex gap-3 rounded px-1 transition-colors hover:bg-panel-2/60"
                >
                  <span
                    className={`shrink-0 ${
                      l.level === "TRACE" ? "text-muted-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {l.time}
                  </span>
                  <span className={`w-12 shrink-0 ${levelClass(l.level)}`}>
                    {l.level === "TRACE" ? "" : l.level}
                  </span>
                  <span className={`text-pretty ${bodyClass(l.level)}`}>{l.text}</span>
                </div>
              ))}
              <div className="flex gap-3">
                <span className="text-brand">❯</span>
                <span className="ops-blink inline-block h-4 w-2 bg-brand" />
              </div>
            </div>
          </div>

          {!following && (
            <button
              onClick={() => setFollowing(true)}
              className="absolute bottom-6 right-[22rem] flex items-center gap-2 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-ink shadow-lg"
            >
              <span className="size-1.5 rounded-full bg-ink" />
              跳至最新
            </button>
          )}
        </main>

        <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-line bg-panel-2/60">
          <div className="border-b border-line p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              AI 命令流
            </div>
            <div className="space-y-2">
              {AI_COMMANDS.map((c) => (
                <div
                  key={c.cmd}
                  className={`rounded-lg bg-ink/60 p-2.5 ring-1 ${
                    c.highlight ? "ring-brand/20" : "ring-line"
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${
                        c.highlight ? "bg-brand" : "bg-accent"
                      }`}
                    />
                    <span
                      className={`font-mono text-[11px] ${c.highlight ? "text-brand" : "text-accent"}`}
                    >
                      {c.cmd}
                    </span>
                  </div>
                  <div className="text-pretty font-mono text-[11px] text-muted-foreground">
                    {c.result}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              操作记录
            </div>
            <div className="space-y-1.5">
              {AUDIT.map((a) => (
                <div key={a.time} className="flex items-center gap-2 text-xs">
                  <span className="shrink-0 font-mono text-muted-foreground">{a.time}</span>
                  <span className="shrink-0 text-fg/90">{a.who}</span>
                  <span className="truncate font-mono text-muted-foreground">{a.cmd}</span>
                  <span
                    className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClass(a.status)}`}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
