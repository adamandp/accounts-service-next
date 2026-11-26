"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { User } from "@/types/accounts";

export function UserAvatar({ user }: { user: User }) {
  return <ProfileAvatar key={user.imageUrl ?? ""} user={user} />;
}

function ProfileAvatar({ user }: { user: User }) {
  const [loaded, setLoaded] = useState(false);
  const name = user.name || user.username || user.email || "User";
  const imageUrl = user.imageUrl;
  const initials = (user.name || user.username || user.email || "U")
    .slice(0, 2)
    .toUpperCase();
  const avatar = (
    <Avatar>
      <AvatarImage
        src={imageUrl ?? undefined}
        alt={name}
        onLoadingStatusChange={(status) => setLoaded(status === "loaded")}
      />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );

  if (!imageUrl) return avatar;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Preview profile image of ${name}`}
          disabled={!loaded}
          className="inline-flex shrink-0 rounded-full outline-none enabled:cursor-zoom-in enabled:hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {avatar}
        </button>
      </DialogTrigger>
      <DialogContent
        className="w-fit max-w-[calc(100vw-2rem)] sm:max-w-[min(36rem,calc(100vw-2rem))]"
        aria-describedby={undefined}
      >
        <DialogTitle className="pr-8">Profile image</DialogTitle>
        {/* External profile URLs are rendered directly, as with the avatar. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={`${name}'s profile image`}
          className="mx-auto block max-h-[75dvh] w-auto max-w-full rounded-lg object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
