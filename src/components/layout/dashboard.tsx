"use client";
import { useEffect, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Shield,
  KeyRound,
  UserRound,
  Lock,
  MonitorSmartphone,
  LogOut,
  SunMoon,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/layout/user-avatar";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import { errorMessage } from "@/utils/format";
const management = [
  {
    title: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
    permission: null,
  },
  { title: "Users", href: "/users", icon: Users, permission: "user.read" },
  { title: "Roles", href: "/roles", icon: Shield, permission: "role.read" },
  {
    title: "Permissions",
    href: "/permissions",
    icon: KeyRound,
    permission: "permission.read",
  },
];
const account = [
  {
    title: "My Profile",
    href: "/account/profile",
    icon: UserRound,
    permission: null,
  },
  {
    title: "Password & Security",
    href: "/account/security",
    icon: Lock,
    permission: null,
  },
  {
    title: "Sessions",
    href: "/account/sessions",
    icon: MonitorSmartphone,
    permission: null,
  },
];
export function Dashboard({ children }: { children: React.ReactNode }) {
  const auth = useAuth(),
    router = useRouter(),
    path = usePathname(),
    { resolvedTheme, setTheme } = useTheme();
  useEffect(() => {
    if (auth.loading || auth.error) return;
    if (!auth.user) router.replace("/login");
    else if (auth.user.mustChangePassword) router.replace("/change-password");
    else if (
      path === "/overview" &&
      !management.slice(1).some((n) => n.permission && auth.has(n.permission))
    )
      router.replace("/account/profile");
  }, [auth, router, path]);
  if (auth.loading || auth.error || !auth.user || auth.user.mustChangePassword)
    return <>{children}</>;
  function navigateSidebar(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    const links = Array.from(
      event.currentTarget.querySelectorAll<HTMLAnchorElement>(
        "a[data-sidebar-nav]",
      ),
    );
    const index = links.indexOf(event.target as HTMLAnchorElement);
    if (index < 0) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? links.length - 1
          : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) %
            links.length;
    links[next]?.focus();
  }
  const menu = (items: typeof management) =>
    items
      .filter((n) => !n.permission || auth.has(n.permission))
      .map((n) => (
        <SidebarMenuItem key={n.href}>
          <SidebarMenuButton
            asChild
            isActive={path === n.href || path.startsWith(n.href + "/")}
            tooltip={n.title}
          >
            <Link
              href={n.href}
              data-sidebar-nav=""
              aria-current={
                path === n.href || path.startsWith(n.href + "/")
                  ? "page"
                  : undefined
              }
            >
              <n.icon />
              <span>{n.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ));
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip="Accounts Service">
                <Link
                  href="/overview"
                  aria-label="Accounts Service"
                  className="group-data-[collapsible=icon]:justify-center"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <ShieldCheck className="size-4" />
                  </span>
                  <span className="grid min-w-0 text-left group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">
                      Accounts Service
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      Identity & Access
                    </span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent onKeyDown={navigateSidebar}>
          {management
            .slice(1)
            .some((n) => n.permission && auth.has(n.permission)) && (
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarMenu>{menu(management)}</SidebarMenu>
            </SidebarGroup>
          )}
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarMenu>{menu(account)}</SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign out"
                onClick={() =>
                  auth
                    .logout()
                    .then(() => router.replace("/login"))
                    .catch((e) => toast.error(errorMessage(e)))
                }
              >
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="flex min-w-0 items-center gap-2 border-t border-sidebar-border pt-2 px-1 pb-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-0">
            <UserAvatar user={auth.user} />
            <Link
              href="/account/profile"
              className="min-w-0 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:hidden"
            >
              <p className="truncate text-sm font-medium">
                {auth.user.name ||
                  auth.user.username ||
                  auth.user.email ||
                  "Account"}
              </p>
              {auth.user.email && (
                <p className="truncate text-xs text-muted-foreground">
                  {auth.user.email}
                </p>
              )}
              <p className="truncate text-xs text-muted-foreground">
                {auth.user.role}
              </p>
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">
            {[...management, ...account].find(
              (n) => path === n.href || path.startsWith(n.href + "/"),
            )?.title || "Account"}
          </span>
          <Button
            className="ml-auto"
            size="icon"
            variant="ghost"
            aria-label="Toggle theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <SunMoon />
          </Button>
        </header>
        <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
