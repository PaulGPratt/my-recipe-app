import { Metadata } from "next";
import HomeClient from "../../components/home.client";
import getRequestClient from "../../lib/get-request-client";
import { api } from "../../lib/client";

export const metadata: Metadata = {
    title: 'Home | PrattProjects.com',
};

export default async function HomePage() {
    let topProfiles: api.ProfileRecipe[];
    try {
        const client = getRequestClient(undefined);
        const response = await client.api.GetTopProfiles();
        topProfiles = response.profile_recipes;
        return (
            <HomeClient profileRecipes={topProfiles}></HomeClient>
        )
    } catch (err) {
        console.log(err);
        return (

            <HomeClient profileRecipes={undefined}></HomeClient>
        )
    }
}