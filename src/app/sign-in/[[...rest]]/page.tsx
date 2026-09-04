"use client";

import React from "react";
import { SignInButton } from "@clerk/nextjs";
import ClerkProviderWrapper from "@/components/ClerkProviderWrapper";

function AdminSignInButton(props: any) {
  const { onClick, className, children, redirectUrl, routing, mode, ...rest } = props || {};
  return (
    <button onClick={onClick} {...rest} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
      border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', width: 320,
      fontWeight: 600
    }}>
      <svg width="18" height="18" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.4h146.9c-6.3 34-25.3 62.8-54 82v67h87.2c51-47 80.4-116.1 80.4-194z"/>
        <path fill="#34A853" d="M272 544.3c73.8 0 135.8-24.5 181.1-66.6l-87.2-67c-24.2 16.3-55.2 26-93.9 26-72 0-133-48.6-154.7-114.3H28.6v71.7C73.9 485.1 166.6 544.3 272 544.3z"/>
        <path fill="#FBBC05" d="M117.3 321.7c-11.6-34.2-11.6-70.9 0-105.1V144.9H28.6c-40.9 81.8-40.9 178 0 259.8l88.7-82.9z"/>
        <path fill="#EA4335" d="M272 109.9c39 0 74.2 13.4 101.8 39.6l76.3-76.3C404.7 27.1 344.9 0 272 0 166.6 0 73.9 59.2 28.6 144.9l88.7 71.7C139 158.5 200 109.9 272 109.9z"/>
      </svg>
      Continue with Google
    </button>
  );
}

export default function SignInPage() {
  return (
    <ClerkProviderWrapper>
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <div style={{ width: 420 }}>
          <h2 style={{ marginBottom: 12 }}>Sign in to Admin</h2>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <img src="/logo.png" alt="The Bookworm" style={{ height: 56 }} />
            </div>
            <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 18, textAlign: 'center' }}>Sign in to THE BOOKWORM</h3>
            <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 18 }}>Welcome back! Please sign in to continue</p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <SignInButton mode="redirect" redirectUrl="/admin">
                <AdminSignInButton />
              </SignInButton>
            </div>

            <div style={{ marginTop: 18, textAlign: 'center', color: '#9CA3AF' }}>
              <div>Don’t have an account? <a href="/sign-up" style={{ color: '#E8B930' }}>Sign up</a></div>
            </div>
          </div>
        </div>
      </div>
    </ClerkProviderWrapper>
  );
}
