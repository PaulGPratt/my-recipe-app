import { signOut } from "firebase/auth";
import { Menu, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { api } from "../lib/client";
import { FirebaseContext } from "../lib/firebase";
import { fetchStoredProfile, removeStoredProfile } from "../lib/profile-utils";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

function ProfileMenu() {
  const router = useRouter();
  const { auth } = useContext(FirebaseContext);
  const [profile, setProfile] = useState<api.Profile>();
  const user = auth?.currentUser;

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!auth?.currentUser) {
        return;
      }

      try {
        const freshProfile = await fetchStoredProfile(auth);
        setProfile(freshProfile);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyProfile();
  }, [auth]);

  const logoutUser = async () => {
    if (auth) {
      try {
        await signOut(auth);
        const logoutUrl = new URL('/logout', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
        await fetch(logoutUrl, { method: 'DELETE' });
        removeStoredProfile();
        setProfile(undefined); // Reset the profile state
        router.push("/"); // Navigate to the homepage
      } catch (err) {
        console.error("Error logging out:", err);
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" title="User Menu"><Menu /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {user?.uid ? (
          <>
            <DropdownMenuLabel className="text-2xl">
              {profile?.username}
            </DropdownMenuLabel>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem className="text-2xl">
              <Link href={`/home`} className="w-full">Home</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-2xl">
              <Link href={`/recipes/${profile?.username}`} className="w-full">My Recipes</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-2xl">
              <Link href={`/profile`} className="w-full">My Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem onClick={logoutUser} className="text-2xl">
              Log Out
            </DropdownMenuItem>
          </>

        ) : (
          <>
            <DropdownMenuLabel className="text-2xl">
              Guest
            </DropdownMenuLabel>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem className="text-2xl">
              <Link href={`/home`} className="w-full">Home</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem className="text-2xl">
              <Link href={`/login`} className="w-full">Log in</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-2xl">
              <Link href={`/signup`} className="w-full">Sign up</Link>
            </DropdownMenuItem>
          </>
        )}

      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileMenu;