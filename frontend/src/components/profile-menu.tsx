import { signOut } from "firebase/auth";
import { User } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../client";
import { FirebaseContext } from "../lib/firebase";
import getRequestClient from "../lib/get-request-client";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

function ProfileMenu() {

  const navigate = useNavigate();
  const { auth } = useContext(FirebaseContext);
  const [profile, setProfile] = useState<api.Profile>();
  const user = auth?.currentUser;

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!auth?.currentUser) {
        return;
      }

      try {
        const token = await auth?.currentUser?.getIdToken();
        const client = getRequestClient(token ?? undefined);
        const freshProfile = await client.api.GetMyProfile();
        if (freshProfile.username.length === 0) {
          navigate("/complete-profile");
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
      navigate("/");
    }
  }

  const navigateToAllRecipes = async () => {
    navigate(`/recipes`);
  }

  const navigateToMyRecipes = async () => {
    navigate(`/recipes/${profile?.username}`);
  }

  const openLogin = () => {
    navigate("/login");
  }

  const openSignUp = () => {
    navigate("/signup");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="default" className="text-2xl font-bold"><User /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {user?.uid ? (
          <>
            <DropdownMenuLabel className="text-2xl">
              {profile?.username}
            </DropdownMenuLabel>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem onClick={navigateToMyRecipes} className="text-2xl">
              My recipes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={navigateToAllRecipes} className="text-2xl">
              All recipes
            </DropdownMenuItem>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem onClick={logoutUser} className="text-2xl">
              Log out
            </DropdownMenuItem>
          </>

        ) : (
          <>
            <DropdownMenuItem onClick={navigateToAllRecipes} className="text-2xl">
              All Recipes
            </DropdownMenuItem>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem onClick={openLogin} className="text-2xl">
              Log in
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openSignUp} className="text-2xl">
              Sign up
            </DropdownMenuItem>
          </>
        )}

      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileMenu;