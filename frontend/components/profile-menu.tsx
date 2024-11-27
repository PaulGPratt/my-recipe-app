import { signOut } from "firebase/auth";
import { User } from "lucide-react";
import { redirect } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { api } from "../lib/client";
import { FirebaseContext } from "../lib/firebase";
import { fetchStoredProfile, removeStoredProfile } from "../lib/profile-utils";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

function ProfileMenu() {
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
          redirect("/complete-profile");
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
      removeStoredProfile();
      redirect("/");
    }
  }

  const navigateToAllRecipes = async () => {
    redirect(`/recipes`);
  }

  const navigateToMyRecipes = async () => {
    redirect(`/recipes/${profile?.username}`);
  }

  const openLogin = () => {
    redirect("/login");
  }

  const openSignUp = () => {
    redirect("/signup");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {profile?.username ? (
          <Button size="icon" variant="secondary" className="text-2xl font-bold" title="User Menu">{profile.username.slice(0, 1).toUpperCase()}</Button>
        ) : (
          <Button size="icon" variant="secondary"title="User Menu"><User /></Button>
        )}

      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {user?.uid ? (
          <>
            <DropdownMenuLabel className="text-2xl">
              {profile?.username}
            </DropdownMenuLabel>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem onClick={navigateToMyRecipes} className="text-2xl">
              My Recipes
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
            <DropdownMenuItem onClick={navigateToAllRecipes} className="text-2xl">
              All Recipes
            </DropdownMenuItem>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem onClick={openLogin} className="text-2xl">
              Log In
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openSignUp} className="text-2xl">
              Sign Up
            </DropdownMenuItem>
          </>
        )}

      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileMenu;