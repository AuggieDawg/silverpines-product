"use client";

import { useEffect, useState } from "react";

type SessionUser = {
  email?: string | null;
  image?: string | null;
  name?: string | null;
};

type SessionResponse = {
  user?: SessionUser;
  expires?: string;
} | null;

export function ProfileBadge() {
  const [session, setSession] = useState<SessionResponse>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data: SessionResponse) => setSession(data))
      .catch(() => setSession(null));
  }, []);

  const user = session?.user;

  if (!user?.email) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {user.image ? (
        // Google profile images are external and dynamic. Keeping a plain img
        // here avoids adding brittle remote image config for this small avatar.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt={user.name ? `${user.name} profile` : "Profile"}
          width={34}
          height={34}
          style={{ borderRadius: 999, border: "1px solid #ddd" }}
        />
      ) : (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            border: "1px solid #ddd",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
          }}
        >
          ?
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{ fontSize: 12, opacity: 0.7 }}>Signed in</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{user.email}</span>
      </div>
    </div>
  );
}
