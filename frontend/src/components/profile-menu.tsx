import { User } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useContext, useEffect, useState } from "react";
import { FirebaseContext } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import getRequestClient from "../lib/get-request-client";
import { APIError, ErrCode, api } from "../client";

function ProfileMenu() {

    
    const navigate = useNavigate();
    const { auth } = useContext(FirebaseContext);
    const [profile, setProfile] = useState<api.Profile>();
    const user = auth?.currentUser;

    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const token = await auth?.currentUser?.getIdToken();
                const client = getRequestClient(token ?? undefined);
                setProfile(await client.api.GetMyProfile());
              } catch (err) {
                const apiErr = err as APIError;
                if(apiErr.code === ErrCode.NotFound) {
                    navigate("/profile");
                }
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
            <DropdownMenuContent className="w-56">
              {user?.uid ? (
                <DropdownMenuItem onClick={logoutUser} className="text-2xl">
                  Logout
                </DropdownMenuItem>

              ) : (
                <>
                <DropdownMenuItem onClick={openLogin} className="text-2xl">
                  Login
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