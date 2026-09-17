import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, CircleAlert, CloudCog, Copy, Eye, EyeOff, FolderCog, Layers3, Plus, Server, ShieldCheck, TestTube2, Trash2, X, Zap } from "lucide-react";
import { useState } from "react";
import { ConsoleShell } from "@/components/console-shell";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "配置 · jms 本机控制台" },
    { name: "description", content: "配置 JumpServer、Jenkins 与 Java 项目服务器映射。" },
    { property: "og:title", content: "配置 · jms 本机控制台" },
    { property: "og:description", content: "配置 JumpServer、Jenkins 与 Java 项目服务器映射。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ]}),
  component: ConfigPage,
});

type Project = { name: string; alias: string; env: "正式" | "测试"; servers: string; account: string; logs: number; guarded: boolean };
const PROJECTS: Project[] = [
  { name: "data-sync", alias: "费用报销", env: "正式", servers: "10.20.1.81\n10.20.1.82", account: "auto", logs: 1, guarded: true },
  { name: "inventory", alias: "库存中心", env: "正式", servers: "10.20.1.51", account: "auto", logs: 1, guarded: true },
  { name: "mobile-api", alias: "移动端接口", env: "测试", servers: "10.20.2.71", account: "auto", logs: 1, guarded: true },
  { name: "order-service", alias: "订单服务", env: "正式", servers: "3 台集群", account: "auto", logs: 1, guarded: true },
  { name: "payment-gateway", alias: "支付网关", env: "正式", servers: "10.20.1.41", account: "auto", logs: 1, guarded: true },
];

const fieldClass = "h-10 w-full rounded-md border border-input bg-field px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelClass = "mb-1.5 block text-xs font-semibold text-foreground";

function ConfigPage() {
  const [editing, setEditing] = useState<Project | null>(null);
  const [secretVisible, setSecretVisible] = useState(false);
  const [tested, setTested] = useState(false);
  const [saved, setSaved] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);

  return <ConsoleShell><main className="mx-auto max-w-[1220px] px-4 py-7 md:px-8 md:py-9">
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="mb-2 font-mono text-[11px] font-semibold text-primary">WORKSPACE / CONFIG</p><h1 className="font-display text-2xl font-semibold">{editing ? "编辑项目映射" : "配置工作台"}</h1><p className="mt-2 text-sm text-muted-foreground">{editing ? `正在编辑 ${editing.name} 的服务器与日志规则` : "管理连接凭据、构建实例和项目服务器映射"}</p></div>
      <div className="flex items-center gap-2"><span className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-[11px] text-muted-foreground">~/.jms/config.toml</span>{!editing && <button onClick={() => setSaved(true)} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">{saved ? "已保存" : "保存配置"}</button>}</div>
    </div>
    {editing ? <ProjectEditor project={editing} onBack={() => setEditing(null)} /> : <>
      <section className="mb-5 overflow-hidden rounded-lg border border-primary/25 bg-surface">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4"><div className="grid size-9 place-items-center rounded-md bg-primary/15 text-primary"><Zap className="size-4" /></div><div><h2 className="font-display text-sm font-semibold">首次配置 · 约 2 分钟</h2><p className="mt-0.5 text-xs text-muted-foreground">完成下面三步，即可让 AI 开始排查线上日志</p></div><span className="ml-auto rounded-md bg-warning/12 px-2 py-1 text-[10px] font-semibold text-warning">2 项待完成</span></div>
        <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {[{n:"01",t:"填写 JumpServer 凭据",d:"个人信息 → API Key",s:"必填"},{n:"02",t:"配置 Jenkins",d:"需要构建部署时填写",s:"建议"},{n:"03",t:"保存并测试连接",d:"确认资产与终端通道",s:"必做"}].map((step) => <div key={step.n} className="flex gap-3 p-4"><span className="font-mono text-xs font-bold text-primary">{step.n}</span><div><div className="text-sm font-semibold">{step.t}<span className="ml-2 text-[10px] text-danger">{step.s}</span></div><p className="mt-1 text-xs text-muted-foreground">{step.d}</p></div></div>)}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <section className="panel"><PanelTitle icon={CloudCog} title="JumpServer 连接" subtitle="堡垒机认证与 Web 终端会话" actions={<><button onClick={() => setTested(true)} className="btn-secondary"><TestTube2 className="size-3.5" />测试连接</button><button onClick={() => setSaved(true)} className="btn-primary">保存</button></>} />
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <Field label="API 地址" value="https://jump.example.com" mono /><Field label="Web 终端域名" value="jump.example.com" mono /><Field label="AccessKey ID" value="AKID-DEMO-0000-DEMO" mono />
              <label><span className={labelClass}>AccessKey Secret</span><div className="relative"><input className={`${fieldClass} pr-10 font-mono`} value={secretVisible ? "jms-demo-secret" : "••••••••••••••"} readOnly /><button onClick={() => setSecretVisible((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground" aria-label="显示或隐藏 Secret">{secretVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
              <Field label="会话 Cookie" value="未配置（macOS 可留空）" mono /><Field label="组织 ID" value="00000000-0000-0000-0000-000000000002" mono />
            </div>
            {tested && <div className="mx-5 mb-5 flex items-start gap-3 rounded-md border border-success/25 bg-success/8 p-3 text-sm"><Check className="mt-0.5 size-4 text-success" /><div><strong className="text-success">连接自检通过</strong><p className="mt-1 text-xs text-muted-foreground">API 认证、可用资产、终端通道和日志权限均正常。</p></div></div>}
          </section>
          <section className="panel"><PanelTitle icon={Server} title="Jenkins 实例" subtitle="构建部署服务，可选配置" actions={<button className="btn-secondary"><Plus className="size-3.5" />新增实例</button>} /><div className="divide-y divide-border">{[{n:"dev",u:"https://jenkins-dev.example.com",ok:true},{n:"prod",u:"https://jenkins.example.com",ok:false},{n:"hk",u:"http://10.0.100.111:8890",ok:false}].map((j) => <div key={j.n} className="grid items-center gap-2 px-5 py-3 text-sm sm:grid-cols-[70px_1fr_110px_100px_auto]"><strong className="font-mono">{j.n}</strong><span className="truncate font-mono text-xs text-muted-foreground">{j.u}</span><span className="text-xs text-muted-foreground">your-name</span><span className={`text-xs font-medium ${j.ok ? "text-success" : "text-warning"}`}>{j.ok ? "Token 已配置" : "Token 未配置"}</span><button className="btn-icon" aria-label={`编辑 ${j.n}`}>编辑</button></div>)}</div></section>
        </div>
        <aside className="space-y-5">
          <section className="panel p-5"><div className="mb-4 flex items-center gap-2"><ShieldCheck className="size-4 text-success" /><h2 className="font-display text-sm font-semibold">连接状态</h2></div><div className="space-y-3">{["本地依赖","API 认证","可用资产","终端通道","日志可读"].map((x,i) => <div key={x} className="flex items-center text-xs"><span className="text-muted-foreground">{x}</span><span className="mx-3 h-px flex-1 bg-border"/><Check className={`size-3.5 ${i < 3 ? "text-success" : "text-muted-foreground"}`} /></div>)}</div><div className="mt-5 border-t border-border pt-4"><div className="flex justify-between text-xs"><span className="text-muted-foreground">配置完成度</span><strong>72%</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-[72%] bg-primary" /></div></div></section>
          <section className="panel p-5"><div className="mb-3 flex items-center gap-2"><CircleAlert className="size-4 text-warning" /><h2 className="font-display text-sm font-semibold">安全提示</h2></div><p className="text-xs leading-5 text-muted-foreground">凭据仅保存在本机配置文件。分享 Skill 时不会包含 Secret 与会话 Cookie。</p></section>
        </aside>
      </div>

      <section className="panel mt-5"><PanelTitle icon={FolderCog} title="项目映射" subtitle="点击项目行进入编辑" actions={<div className="flex gap-2"><button className="btn-secondary">拉取资产列表</button><button className="btn-primary"><Plus className="size-3.5" />新增项目</button></div>} />
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-border bg-field/70 text-[11px] text-muted-foreground"><th className="px-5 py-3 font-semibold">项目</th><th className="px-4 py-3 font-semibold">环境</th><th className="px-4 py-3 font-semibold">服务器</th><th className="px-4 py-3 font-semibold">登录账号</th><th className="px-4 py-3 font-semibold">危险命令</th><th className="px-4 py-3 font-semibold">日志</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-border">{PROJECTS.map((p) => <tr key={p.name} onClick={() => setEditing(p)} className="cursor-pointer transition-colors hover:bg-primary/5"><td className="px-5 py-3"><strong className="font-mono text-xs">{p.name}</strong><div className="mt-1 text-xs text-muted-foreground">{p.alias}</div></td><td className="px-4 py-3"><EnvBadge env={p.env} /></td><td className="whitespace-pre-line px-4 py-3 font-mono text-xs text-muted-foreground">{p.servers}</td><td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.account}</td><td className="px-4 py-3"><span className="text-xs font-medium text-success">已开启</span></td><td className="px-4 py-3 font-mono text-xs">{p.logs}</td><td className="px-5 py-3 text-right text-xs font-semibold text-primary">编辑</td></tr>)}</tbody></table></div>
      </section>
      <section className="panel mt-5"><button onClick={() => setAssetsOpen((v) => !v)} className="flex w-full items-center gap-3 px-5 py-4 text-left"><Layers3 className="size-4 text-primary"/><span className="font-display text-sm font-semibold">资产清单</span><span className="text-xs text-muted-foreground">共 12 台可用服务器</span><ChevronDown className={`ml-auto size-4 text-muted-foreground transition-transform ${assetsOpen ? "rotate-180" : ""}`} /></button>{assetsOpen && <div className="grid gap-2 border-t border-border p-5 sm:grid-cols-3">{["10.20.1.11 · order-prod-01","10.20.1.12 · order-prod-02","10.20.1.41 · payment-prod"].map((a) => <button key={a} className="flex items-center justify-between rounded-md border border-border bg-field p-3 font-mono text-xs text-muted-foreground hover:border-primary/40">{a}<Copy className="size-3.5" /></button>)}</div>}</section>
    </>}
  </main></ConsoleShell>;
}

function PanelTitle({ icon: Icon, title, subtitle, actions }: { icon: typeof Server; title: string; subtitle: string; actions?: React.ReactNode }) { return <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><div className="grid size-8 place-items-center rounded-md bg-primary/12 text-primary"><Icon className="size-4" /></div><div><h2 className="font-display text-sm font-semibold">{title}</h2><p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p></div></div>{actions && <div className="flex gap-2 sm:ml-auto">{actions}</div>}</div>; }
function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <label><span className={labelClass}>{label}</span><input className={`${fieldClass} ${mono ? "font-mono text-xs" : ""}`} defaultValue={value} /></label>; }
function EnvBadge({ env }: { env: "正式" | "测试" }) { return <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-semibold ${env === "正式" ? "bg-danger/10 text-danger" : "bg-info/10 text-info"}`}>{env}</span>; }
function ProjectEditor({ project, onBack }: { project: Project; onBack: () => void }) { const [advanced,setAdvanced]=useState(false); return <section className="panel max-w-4xl"><div className="flex items-center justify-between border-b border-border px-5 py-4"><button onClick={onBack} className="text-sm font-medium text-muted-foreground hover:text-foreground">← 返回项目列表</button><span className="font-mono text-xs text-muted-foreground">EDIT / {project.name}</span></div><div className="space-y-6 p-5 md:p-7"><div><h2 className="section-label">基础信息</h2><div className="mt-3 grid gap-4 md:grid-cols-3"><Field label="项目名" value={project.name} mono/><Field label="中文名（备注）" value={project.alias}/><label><span className={labelClass}>环境</span><select className={fieldClass} defaultValue={project.env}><option>正式</option><option>测试</option></select></label></div></div><div><h2 className="section-label">服务器与日志</h2><div className="mt-3 space-y-4"><label><span className={labelClass}>服务器 IP（每行一台）</span><textarea className="textarea" defaultValue={project.servers.replace("3 台集群","10.20.1.11\n10.20.1.12\n10.20.1.13")} /></label><label><span className={labelClass}>日志文件路径（每行一个）</span><textarea className="textarea" defaultValue="/apps/jar/log/application.out" /></label><Field label="关注关键词（可选）" value="ERROR|Exception|Timeout" mono /></div></div><div className="rounded-md border border-border"><button onClick={() => setAdvanced(v=>!v)} className="flex w-full items-center px-4 py-3 text-sm font-semibold">高级选项 <ChevronDown className={`ml-auto size-4 transition-transform ${advanced?"rotate-180":""}`}/></button>{advanced && <div className="grid gap-4 border-t border-border p-4 md:grid-cols-2"><Field label="允许命令" value="grep, tail, cat, jstack" mono/><Field label="拒绝命令" value="rm, reboot, shutdown" mono/><label className="flex items-center gap-3 md:col-span-2"><input type="checkbox" defaultChecked className="size-4 accent-[var(--primary)]"/><span className="text-sm">启用危险命令拦截</span></label></div>}</div></div><div className="flex items-center border-t border-border bg-field/60 px-5 py-4"><button className="btn-primary">保存项目</button><button onClick={onBack} className="btn-secondary ml-2"><X className="size-3.5"/>取消</button><button className="ml-auto inline-flex h-9 items-center gap-2 rounded-md border border-danger/30 px-3 text-xs font-semibold text-danger hover:bg-danger/10"><Trash2 className="size-3.5"/>删除此项目</button></div></section>; }
