import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. Initialize the response object
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2. Create the Supabase SSR client with explicitly typed cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Update the request cookies
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          
          // Update the response cookies so the browser stores the refreshed token
          supabaseResponse = NextResponse.next({
            request,
          });
          
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Fetch the current logged-in user securely
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // 4. Helper function to route users to their specific home pages
  const getRoleDashboard = (role: string | undefined) => {
    switch (role) {
      case 'dispatcher': return '/command-center';
      case 'loader': return '/trip-queue';
      case 'store_manager': return '/overview';
      default: return '/login';
    }
  };

  // 5. If the user is on the Login page
  if (path === '/login') {
    if (user) {
      // If already logged in, fetch their role and push them to their dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      return NextResponse.redirect(new URL(getRoleDashboard(profile?.role), request.url));
    }
    return supabaseResponse;
  }

  // 6. If no user is logged in for any other route, kick them to login
  if (!user) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 7. If user is logged in, fetch their specific role from your SQL schema
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role;

  // 8. Define the route boundaries based on our Route Groups
  const isDispatcherRoute = path.startsWith('/command-center') || path.startsWith('/allocation') || path.startsWith('/deferrals');
  const isLoaderRoute = path.startsWith('/trip-queue');
  const isManagerRoute = path.startsWith('/overview') || path.startsWith('/orders') || path.startsWith('/receiving') || path.startsWith('/alerts') || path.startsWith('/history');

  // Redirect root to dashboard
  if (path === '/') {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  // 9. Execute Role-Based Access Control (RBAC) Bouncers
  if (isDispatcherRoute && role !== 'dispatcher') {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }
  
  if (isLoaderRoute && role !== 'loader') {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }
  
  if (isManagerRoute && role !== 'store_manager') {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  // If everything checks out, allow the request to proceed
  return supabaseResponse;
}

// 10. Configure the Matcher to skip static files, images, and API routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};