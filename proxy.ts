import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ["/citizen", "/authority", "/admin"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // If user is logged in, check role-based access
  if (user && isProtectedPath) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile) {
      const role = profile.role
      const path = request.nextUrl.pathname

      // Redirect if accessing wrong dashboard
      if (path.startsWith("/citizen") && role !== "citizen") {
        return NextResponse.redirect(new URL(`/${role}`, request.url))
      }
      if (path.startsWith("/authority") && role !== "authority") {
        return NextResponse.redirect(new URL(`/${role}`, request.url))
      }
      if (path.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL(`/${role}`, request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
