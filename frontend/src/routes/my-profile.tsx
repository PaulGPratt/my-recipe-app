import { useContext, useEffect, useState } from "react";
import { FirebaseContext } from "../lib/firebase";
import getRequestClient from "../lib/get-request-client";
import { APIError, ErrCode, api } from "../client";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";


function MyProfile() {

    const navigate = useNavigate();
    const { auth } = useContext(FirebaseContext);
    const [profile, setProfile] = useState<api.Profile>();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState<string>("");
    const [duplicateCheckComplete, setDuplicateCheckComplete] = useState<boolean>();

    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const token = await auth?.currentUser?.getIdToken();
                const client = getRequestClient(token ?? undefined);
                setProfile(await client.api.GetMyProfile());
            } catch (err) {
                const apiErr = err as APIError;
                if (apiErr.code === ErrCode.NotFound) {
                    if (auth?.currentUser?.email) {
                        setEmail(auth?.currentUser?.email);
                    }
                } else {
                    navigate(`/recipes/`);
                }
            }
        };
        fetchMyProfile();
    }, [auth]);

    const saveProfile = async () => {
        try {
            const token = await auth?.currentUser?.getIdToken();
            const client = getRequestClient(token ?? undefined);
            await client.api.SaveProfile({
                id: auth?.currentUser?.uid || '',
                username: username,
                email: email,
            });
            navigate(`/recipes/`);
        } catch (err) {
            console.error(err);
        }
    }

    const handleUsernameInput = async (event: React.FocusEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
        const usernameVal = event.target.value;
        
        setUsernameError("");
        setUsername(usernameVal);
        setDuplicateCheckComplete(false);

        // Only check if the event is a blur and the slug has changed
        if (event.type === "blur") {
            const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
            let isValidSlug = slugPattern.test(usernameVal);
            if (!isValidSlug) {
                setUsernameError(`Please only use lowercase letters and numbers separated by hyphens.`)
                return;
            }

            try {
                const client = getRequestClient(undefined);
                const availableResp = await client.api.CheckIfUsernameIsAvailable({ username: usernameVal });
                if(availableResp.available) {
                    setDuplicateCheckComplete(true);
                } else {
                    setUsernameError(`${usernameVal} is already in use`);
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="h-full mx-auto max-w-4xl ">
            <form className="loginForm">
                <div className="p-4 py-6 text-center text-4xl font-semibold">
                    Complete Profile
                </div>
                <div className="p-4 pt-0 flex gap-2">
                    <div className="flex-grow">
                        <Label htmlFor="signupEmail" className="text-2xl font-semibold">Username</Label>
                        <Input
                            id="username"
                            type="username"
                            className="mt-2 h-12 text-2xl"
                            aria-describedby="username"
                            placeholder="ex. my-username"
                            value={username}
                            onChange={handleUsernameInput}
                            onBlur={handleUsernameInput}
                        />
                        {usernameError.length > 0 && (
                            <div className="flex gap-4 items-center pt-2">
                                <TriangleAlert />
                                <div className="text-xl">{usernameError}</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 pt-0 flex gap-2">
                    <Button
                        type="submit"
                        onClick={saveProfile}
                        disabled={username.length <= 0 || usernameError.length > 0 || !duplicateCheckComplete}
                    >
                        Complete
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default MyProfile;