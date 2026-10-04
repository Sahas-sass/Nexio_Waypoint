import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getSupabasePublicEnv } from '@/lib/supabase/env';
import { LOGIN_PATH, canAccess, getRoleDashboard, hasPortal, isApiPath } from '@/lib/auth/roleRoutes';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getSupabasePublicEnv();

  // Supabase SSR client that refreshes the session cookie on every request
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const redirectTo = (pathname: string) => NextResponse.redirect(new URL(pathname, request.url));

  const fetchRole = async (userId: string) => {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
    return profile?.role as string | undefined;
  };

  if (path === LOGIN_PATH) {
    if (!user) return supabaseResponse;
    const role = await fetchRole(user.id);
    // Roles without a web portal (drivers) stay on the login page instead of looping
    return hasPortal(role) ? redirectTo(getRoleDashboard(role)) : supabaseResponse;
  }

  // JSON endpoints answer 401 instead of redirecting; each route still checks its own role
  if (isApiPath(path)) {
    return user ? supabaseResponse : NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  const role = await fetchRole(user.id);
  if (path === '/' || !canAccess(role, path)) {
    return redirectTo(getRoleDashboard(role));
  }

  return supabaseResponse;
}

// Run on everything except Next.js internals and static image assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
