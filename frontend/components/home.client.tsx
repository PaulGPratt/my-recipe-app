"use client"

import Link from "next/link";
import ProfileMenu from "./profile-menu";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useContext, useEffect, useState } from "react";
import { FirebaseContext } from "../lib/firebase";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { api } from "../lib/client";
import { fetchStoredProfile } from "../lib/profile-utils";

export default function HomeClient() {
    const { auth } = useContext(FirebaseContext);
    const user = auth?.currentUser;

    const [profile, setProfile] = useState<api.Profile>();
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


    return (
        <div className="h-full mx-auto max-w-4xl flex flex-col">
            <div className="flex p-4 justify-between">
                <div className="flex gap-4 items-center">
                    <ProfileMenu></ProfileMenu>
                    <div className="text-2xl">Home</div>
                </div>
                <div className="flex gap-2">
                    {user?.uid && (
                        <Link href="/add-recipe" passHref>
                            <Button size="icon" variant="ghost" title="Add Recipe">
                                <Plus />
                            </Button>
                        </Link>
                    )}

                </div>
            </div>
            <Separator></Separator>
            <ScrollArea className="h-full w-full">
                <div className="p-4 flex">
                    {profile?.username ? (
                        <div className="flex flex-row gap-4 w-full">
                            <Link href={`/recipes/${profile.username}`} passHref className="flex flex-grow">
                                <Button variant="secondary" className="flex-grow">
                                    My Recipes
                                </Button>
                            </Link>
                            <Link href={`/add-recipe`} passHref className="flex flex-grow">
                                <Button variant="secondary" className="flex-grow">
                                    <Plus></Plus> Add Recipe
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full text-xl">
                            <div className="pb-2">If you'd like to add any recipes of your own:</div>
                            <div className="flex flex-row items-center gap-2 w-full">
                                <Link href={`/login`} passHref className="flex flex-grow">
                                    <Button variant="secondary" className="flex-grow">
                                        Log in
                                    </Button>
                                </Link>
                                <div>
                                or
                                </div>
                                <Link href={`/signup`} passHref className="flex flex-grow">
                                    <Button variant="secondary" className="flex-grow">
                                        Sign up
                                    </Button>
                                </Link>
                            </div>

                        </div>

                    )}
                </div>

                <Separator></Separator>

                <div className="p-4 flex flex-row gap-2 text-2xl">Recipes by others</div>
            </ScrollArea>
        </div>
    )
}