import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    '/keep-forever(.*)',
    '/api/admin(.*)',
    '/sign-in(.*)'
  ],
};
