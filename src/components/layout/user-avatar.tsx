import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/types/accounts";
export function UserAvatar({ user }: { user: User }) {
  return (
    <Avatar>
      <AvatarImage
        src={user.imageUrl ?? undefined}
        alt={user.name || user.username || "User"}
      />
      <AvatarFallback>
        {(user.name || user.username || user.email || "U")
          .slice(0, 2)
          .toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
