import { TriangleAlert } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { FirebaseContext } from "../lib/firebase";
import getRequestClient from "../lib/get-request-client";
import { fetchStoredProfile, storeProfile } from "../lib/profile-utils";

function CompleteProfile() {

    const navigate = useNavigate();
    const { auth } = useContext(FirebaseContext);
    const [_, setProfile] = useState<api.Profile>();
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState<string>("");
    const [duplicateCheckComplete, setDuplicateCheckComplete] = useState<boolean>();

    useEffect(() => {
        const fetchMyProfile = async () => {
            if (auth) {
                try {
                    const freshProfile = await fetchStoredProfile(auth);
                    if (freshProfile && freshProfile.username.length > 0) {
                        navigate(`/recipes/${freshProfile.username}`);
                    }
                    setProfile(freshProfile);
                } catch (err) {
                    console.log(err);
                }
            }
        };
        fetchMyProfile();
    }, [auth]);

    const saveProfile = async () => {
        try {
            const token = await auth?.currentUser?.getIdToken();
            const client = getRequestClient(token ?? undefined);
            const freshProfile = await client.api.SaveProfile({
                id: auth?.currentUser?.uid || '',
                username: username
            });
            storeProfile(freshProfile);
            navigate(`/recipes/${freshProfile.username}`);
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
                if (availableResp.available) {
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
                    onClick={saveProfile}
                    disabled={username.length <= 0 || usernameError.length > 0 || !duplicateCheckComplete}
                >
                    Complete
                </Button>
            </div>
        </div>
    )
}

export default CompleteProfile;