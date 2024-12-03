import { signOut } from "firebase/auth";
import { User } from "lucide-react";
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
      console.log("auth:" + auth);
      if (!auth?.currentUser) {
        console.log("no current user");
        return;
      }

      try {
        console.log("fetching stored profile");
        const freshProfile = await fetchStoredProfile(auth);
        if (freshProfile.username.length === 0) {
          router.push("/complete-profile");
        } else {
          setProfile(freshProfile);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchMyProfile();
  }, [auth]);

  const logoutUser = async () => {
    if (auth) {
      try {
        await signOut(auth);
        const logoutUrl = new URL('/logout', process.env.BASE_URL || 'http://localhost:3000');
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
        {profile?.username ? (
          <Button size="icon" variant="secondary" className="text-2xl font-bold" title="User Menu">{profile.username.slice(0, 1).toUpperCase()}</Button>
        ) : (
          <Button size="icon" variant="secondary" title="User Menu"><User /></Button>
        )}

      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {user?.uid ? (
          <>
            <DropdownMenuLabel className="text-2xl">
              {profile?.username}
            </DropdownMenuLabel>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem className="text-2xl">
              <Link href={`/recipes/${profile?.username}`} className="w-full">My Recipes</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem onClick={logoutUser} className="text-2xl">
              Log Out
            </DropdownMenuItem>
          </>

        ) : (
          <>
            <DropdownMenuLabel className="text-2xl">
              Welcome Guest!
            </DropdownMenuLabel>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem className="text-2xl">
              <Link href={`/recipes/`} className="w-full">All Recipes</Link>
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