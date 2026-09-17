import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, ChevronLeft, ChevronRight, FileClock, Settings2, TerminalSquare } from "lucide-react";
import { useState, type ReactNode } from "react";

export function ConsoleShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const links = [
    { label: "配置", to: "/" as const, icon: Settings2 },
    { label: "操作记录", to: "/records" as const, icon: FileClock },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-sidebar transition-[width] duration-200 md:flex md:flex-col ${collapsed ? "w-[72px]" : "w-60"}`}>
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <TerminalSquare className="size-4" aria-hidden="true" />
          </div>
          {!collapsed && <div><div className="font-display text-sm font-semibold text-sidebar-foreground">jms console</div><div className="font-mono text-[10px] text-muted-foreground">LOCAL TOOLKIT</div></div>}
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="主导航">
          {links.map(({ label, to, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} title={collapsed ? label : undefined} className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${active ? "bg-sidebar-accent text-primary" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {!collapsed && <span>{label}</span>}
                {active && !collapsed && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          {!collapsed && <div className="mb-3 rounded-md border border-border bg-surface p-3"><div className="flex items-center gap-2 text-xs font-medium text-success"><span className="status-pulse size-2 rounded-full bg-success" />本机服务运行中</div><p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">闲置 1 小时后自动关闭</p></div>}
          <button type="button" onClick={() => setCollapsed((v) => !v)} className="flex h-9 w-full items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground" aria-label={collapsed ? "展开侧栏" : "收起侧栏"}>
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>
      </aside>

      <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? "md:pl-[72px]" : "md:pl-60"}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3 md:hidden"><div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><TerminalSquare className="size-4" /></div><strong className="font-display text-sm">jms console</strong></div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 sm:flex"><Activity className="size-3.5 text-success" /><span className="text-xs text-muted-foreground">JumpServer</span><span className="text-xs font-semibold text-success">已连接</span></div>
            <span className="rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground">v1.19.10</span>
          </div>
        </header>
        <div className="border-b border-border bg-sidebar px-3 py-2 md:hidden">
          <nav className="grid grid-cols-2 gap-2" aria-label="移动端导航">
            {links.map(({ label, to, icon: Icon }) => <Link key={to} to={to} className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium ${pathname === to ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><Icon className="size-4" />{label}</Link>)}
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
