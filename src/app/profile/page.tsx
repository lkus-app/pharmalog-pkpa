import type { Metadata } from "next"
import { ProfileView } from "@/components/profile/profile-view"

export const metadata: Metadata = {
  title: "Profil",
}

export default function ProfilePage() {
  return <ProfileView />
}
