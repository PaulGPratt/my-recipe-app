import { useContext, useEffect, useState } from "react";
import { FirebaseContext } from "../lib/firebase";
import { useParams } from "react-router-dom";
import getRequestClient from "../lib/get-request-client";
import { api } from "../client";


function Profile() {

    const { id } = useParams();
    const { auth } = useContext(FirebaseContext);
    const [profile, setProfile] = useState<api.Profile>();

    useEffect(() => {
        const getDashboardData = async () => {
            if (id) {
                const token = await auth?.currentUser?.getIdToken();
                const client = getRequestClient(token ?? undefined);
                setProfile(await client.api.GetProfile(id));
            }

        };
        if (auth?.currentUser?.uid) getDashboardData();
    }, [auth?.currentUser?.uid]);

    return (
        <></>
    )
}

export default Profile;