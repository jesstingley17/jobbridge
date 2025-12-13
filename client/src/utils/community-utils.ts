import type { User } from "@shared/schema";

/**
 * Get the display name for a user in the community
 * Uses communityUsername if set, otherwise falls back to firstName + lastName
 */
export function getCommunityDisplayName(user: User | null | undefined): string {
  if (!user) return "Anonymous";
  
  if (user.communityUsername) {
    return user.communityUsername;
  }
  
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  
  return fullName || user.email?.split("@")[0] || "User";
}

/**
 * Get initials for avatar fallback
 */
export function getInitials(user: User | null | undefined): string {
  if (!user) return "U";
  
  if (user.communityUsername) {
    // Use first 2 characters of username
    return user.communityUsername.substring(0, 2).toUpperCase();
  }
  
  const first = user.firstName?.charAt(0) || "";
  const last = user.lastName?.charAt(0) || "";
  return (first + last).toUpperCase() || "U";
}
