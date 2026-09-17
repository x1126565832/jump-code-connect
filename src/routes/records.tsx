import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, Download, RefreshCw, Search, Terminal, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { ConsoleShell } from "@/components/console-shell";

export const Route = createFileRoute("/records")({
  head: () => ({ meta: [
    { title: "操作记录 · jms 本机控制台" },
    { name: "description", content: "查看 AI 经堡垒机执行的命令、返回结果与项目操作记录。" },
    { property: "og:title", content: "操作记录 · jms 本机控制台" },
    { property: "og:description", content: "查看 AI 经堡垒机执行的命令、返回结果与项目操作记录。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ]}), component: RecordsPage,
});

type RecordItem = { id:number; project:string; env:"正式"|"测试"; ip:string; command:string; output:string; time:string; code:number; lines:number };
const RECORDS: RecordItem[] = [
  {id:9,project:"inventory",env:"正式",ip:"10.20.1.51",command:"grep '日报' /apps/jar/log/report.out | tail -5",output:"日报任务 14:00 正常触发并发送完成",time:"2026-09-17 14:50:40",code:0,lines:1},
  {id:8,project:"order-service",env:"正式",ip:"10.20.1.11",command:"df -h /apps",output:"磁盘使用 62%，余量充足",time:"2026-09-17 14:37:40",code:0,lines:1},
  {id:7,project:"payment-gateway",env:"正式",ip:"10.20.1.41",command:"jms ci status 'PAY/payment-gateway-prod' --server prod",output:"最近构建 #238 成功 · 耗时 41s",time:"2026-09-17 14:24:40",code:0,lines:1},
  {id:6,project:"user-center",env:"正式",ip:"10.20.1.61",command:"grep -E 'ERROR' /apps/jar/log/user-center.out | tail -10",output:"无 ERROR 命中",time:"2026-09-17 14:11:40",code:0,lines:1},
  {id:5,project:"user-center",env:"正式",ip:"10.20.1.61",command:"ls -lt /apps/jar/log/ | head -5",output:"最新日志 user-center.out（今日 14:22 更新）",time:"2026-09-17 13:58:40",code:0,lines:5},
  {id:4,project:"order-service",env:"正式",ip:"10.20.1.11",command:"grep -c 'Started OrderApplication' /apps/jar/log/order.out",output:"输出 1：服务于 09:12:33 完成启动",time:"2026-09-17 13:45:40",code:0,lines:1},
  {id:3,project:"order-service",env:"正式",ip:"10.20.1.11",command:"tail -n 500 /apps/jar/log/order.out | grep -E 'ERROR|Exception' | head -20",output:"命中 3 条 ERROR：Connection pool exhausted ×2；Read timed out ×1",time:"2026-09-17 13:32:40",code:1,lines:3},
];
const PROJECTS = ["全部","inventory","order-service","payment-gateway","user-center"];

function RecordsPage(){
 const [project,setProject]=useState("全部"); const [query,setQuery]=useState(""); const [open,setOpen]=useState<number[]>([9,8,7,6,5,4,3]); const [refreshed,setRefreshed]=useState(false);
 const shown=useMemo(()=>RECORDS.filter(r=>(project==="全部"||r.project===project)&&r.command.toLowerCase().includes(query.toLowerCase())),[project,query]);
 const toggle=(id:number)=>setOpen(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
 return <ConsoleShell><main className="mx-auto max-w-[1320px] px-4 py-7 md:px-8 md:py-9">
   <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-2 flex items-center gap-2"><span className="status-pulse size-2 rounded-full bg-success"/><span className="font-mono text-[11px] font-semibold text-success">LIVE · 3S POLLING</span></div><h1 className="font-display text-2xl font-semibold">操作记录</h1><p className="mt-2 text-sm text-muted-foreground">实时查看 AI 执行的命令与服务器返回结果</p></div><div className="flex flex-wrap gap-2"><label className="relative min-w-[230px] flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索命令或输出…" className="h-9 w-full rounded-md border border-input bg-field pl-9 pr-3 text-sm outline-none focus:border-primary"/></label><button onClick={()=>{setRefreshed(true);setTimeout(()=>setRefreshed(false),1200)}} className="btn-secondary"><RefreshCw className={`size-3.5 ${refreshed?"animate-spin":""}`}/>{refreshed?"已刷新":"刷新"}</button><button onClick={()=>window.alert("演示：记录已导出为文本文件")} className="btn-secondary"><Download className="size-3.5"/>导出</button></div></div>
   <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
    <aside className="panel h-fit overflow-hidden"><div className="border-b border-border px-4 py-3"><span className="section-label">项目筛选</span></div><div className="p-2">{PROJECTS.map(name=>{const count=name==="全部"?RECORDS.length:RECORDS.filter(r=>r.project===name).length;const sample=RECORDS.find(r=>r.project===name);return <button key={name} onClick={()=>setProject(name)} className={`mb-1 w-full rounded-md px-3 py-2.5 text-left transition-colors ${project===name?"bg-primary/12 text-foreground":"text-muted-foreground hover:bg-field"}`}><div className="flex items-center gap-2"><span className="truncate text-xs font-semibold">{name}</span>{sample&&<span className={`rounded px-1.5 py-0.5 text-[9px] ${sample.env==="正式"?"bg-danger/10 text-danger":"bg-info/10 text-info"}`}>{sample.env}</span>}<span className="ml-auto font-mono text-[10px]">{count}</span></div>{sample&&<div className="mt-1 font-mono text-[10px] text-muted-foreground">{sample.ip}</div>}</button>})}</div><div className="border-t border-border p-4"><div className="flex justify-between text-xs"><span className="text-muted-foreground">命令总数</span><strong className="font-mono">{RECORDS.length}</strong></div><div className="mt-2 flex justify-between text-xs"><span className="text-muted-foreground">异常记录</span><strong className="font-mono text-danger">1</strong></div></div></aside>
    <section><div className="mb-3 flex items-center justify-between"><p className="text-xs text-muted-foreground">当前显示 <strong className="text-foreground">{shown.length}</strong> 条命令</p><p className="font-mono text-[10px] text-muted-foreground">LATEST FIRST</p></div><div className="space-y-2">{shown.map(r=>{const expanded=open.includes(r.id);return <article key={r.id} className={`record overflow-hidden rounded-lg border bg-surface ${r.code===0?"border-border":"border-danger/35"}`}><button onClick={()=>toggle(r.id)} className="grid w-full gap-3 p-4 text-left md:grid-cols-[36px_minmax(0,1fr)_auto] md:items-center"><span className="font-mono text-[11px] text-muted-foreground">#{r.id}</span><div className="min-w-0"><div className="flex items-center gap-2"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-info/12 text-[10px] font-semibold text-info">AI</span><code className="break-all font-mono text-xs leading-5 text-foreground">{r.command}</code></div><div className="mt-2 flex flex-wrap items-center gap-2 pl-8 text-[10px] text-muted-foreground"><span className="font-semibold text-primary">{r.project}</span><span>{r.ip}</span><span>·</span><span>{r.time}</span></div></div><div className="flex items-center justify-end gap-3"><span className={`flex items-center gap-1 font-mono text-[10px] ${r.code===0?"text-success":"text-danger"}`}>{r.code===0?<Check className="size-3"/>:<XCircle className="size-3"/>}EXIT {r.code}</span><span className="font-mono text-[10px] text-muted-foreground">{r.lines} 行</span><ChevronDown className={`size-4 text-muted-foreground transition-transform ${expanded?"rotate-180":""}`}/></div></button>{expanded&&<div className="border-t border-border bg-terminal px-4 py-3 font-mono text-xs leading-6 text-terminal-foreground"><div className="flex gap-3"><Terminal className="mt-1 size-3.5 shrink-0 text-primary"/><span className={r.code===0?"":"text-danger"}>{r.output}</span></div></div>}</article>})}{shown.length===0&&<div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">没有匹配的操作记录</div>}</div></section>
   </div>
 </main></ConsoleShell>;
}
