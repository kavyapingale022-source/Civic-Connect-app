"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bell, Menu, User, LogOut, Settings, Home, PlusCircle, List, Users, BarChart3 } from "lucide-react"
import type { Profile, Notification } from "@/lib/types"

interface AppHeaderProps {
  user: Profile
  notifications: Notification[]
}

export function AppHeader({ user, notifications }: AppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const navItems = {
    citizen: [
      { href: "/citizen", label: "Dashboard", icon: Home },
      { href: "/citizen/report", label: "Report Issue", icon: PlusCircle },
      { href: "/citizen/issues", label: "My Issues", icon: List },
    ],
    authority: [
      { href: "/authority", label: "Dashboard", icon: Home },
      { href: "/authority/issues", label: "Assigned Issues", icon: List },
    ],
    admin: [
      { href: "/admin", label: "Dashboard", icon: Home },
      { href: "/admin/issues", label: "All Issues", icon: List },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  }

  const items = navItems[user.role]

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Civic Connect</span>
              </div>
              <nav className="space-y-2">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href={`/${user.role}`} className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline">Civic Connect</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-6">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2 font-semibold">Notifications</div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-3">
                    <span className={`text-sm ${!notif.is_read ? "font-semibold" : ""}`}>{notif.title}</span>
                    <span className="text-xs text-muted-foreground">{notif.message}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-3 py-2">
                <p className="font-medium">{user.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {user.role}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${user.role}/settings`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
