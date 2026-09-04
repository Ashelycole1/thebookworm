"use client";

import React, { useEffect } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import ClerkProviderWrapper from "@/components/ClerkProviderWrapper";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function AdminSignInButton(props: any) {
  const { onClick, className, children, redirectUrl, routing, mode, ...rest } = props || {};
  return (
    <button onClick={onClick} {...rest} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 14px', borderRadius: 8,
      border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', width: '100%',
      fontWeight: 700, fontSize: '1rem', color: '#111827',
      transition: 'background-color 0.2s',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    }}>
      <svg width="20" height="20" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.4h146.9c-6.3 34-25.3 62.8-54 82v67h87.2c51-47 80.4-116.1 80.4-194z"/>
        <path fill="#34A853" d="M272 544.3c73.8 0 135.8-24.5 181.1-66.6l-87.2-67c-24.2 16.3-55.2 26-93.9 26-72 0-133-48.6-154.7-114.3H28.6v71.7C73.9 485.1 166.6 544.3 272 544.3z"/>
        <path fill="#FBBC05" d="M117.3 321.7c-11.6-34.2-11.6-70.9 0-105.1V144.9H28.6c-40.9 81.8-40.9 178 0 259.8l88.7-82.9z"/>
        <path fill="#EA4335" d="M272 109.9c39 0 74.2 13.4 101.8 39.6l76.3-76.3C404.7 27.1 344.9 0 272 0 166.6 0 73.9 59.2 28.6 144.9l88.7 71.7C139 158.5 200 109.9 272 109.9z"/>
      </svg>
      Continue with Google
    </button>
  );
}

function SignInContent() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  // If the user is already signed in, immediately redirect them to the admin portal
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/keep-forever");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--color-bg)", padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 24 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              <ArrowLeft size={16} /> Back to store
            </Link>
          </div>
          
          <div style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'var(--color-yellow)', marginBottom: 16 }}>
                <img src="/logo-icon.png" alt="The Bookworm" style={{ width: 40, height: 40 }} />
              </div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: 'var(--color-ink)' }}>Admin Portal</h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>Sign in to manage your bookstore.</p>
            </div>

            <div style={{ marginTop: 32 }}>
              <SignInButton mode="modal" fallbackRedirectUrl="/keep-forever" forceRedirectUrl="/keep-forever">
                <AdminSignInButton />
              </SignInButton>
            </div>
            
            <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: '#9CA3AF' }}>
              Secure access for authorized personnel only.
            </div>
          </div>
        </div>
      </div>
  );
}

export default function SignInPage() {
  return (
    <ClerkProviderWrapper>
      <SignInContent />
    </ClerkProviderWrapper>
  );
}
