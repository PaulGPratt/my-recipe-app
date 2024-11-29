import { signOut } from "firebase/auth";
import Cookies from "js-cookie";
import { User } from "lucide-react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
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
        if (freshProfile.username.length === 0) {
          console.log("You must complete profile");
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
      await signOut(auth);
      Cookies.remove("firebaseToken");
      removeStoredProfile();
      redirect("/");
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