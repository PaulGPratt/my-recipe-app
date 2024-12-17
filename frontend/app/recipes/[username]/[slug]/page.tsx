import { Metadata } from "next";
import { redirect } from "next/navigation";
import RecipeClient from "../../../../components/recipe.client";
import getRequestClient from "../../../../lib/get-request-client";

type Params = Promise<{ username: string; slug: string }>

export const generateMetadata = async (props: { params: Params }): Promise<Metadata> => {
  const { username, slug } = await props.params;

  const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
  let ogImageUrl = `${baseurl}og-image.jpg`;
  let xImageUrl = `${baseurl}x-image.jpg`;

  try {
    const client = getRequestClient(undefined);
    const recipe = await client.api.GetRecipe(username, slug);
    const { title } = recipe;
    const description = `Check out ${title} by ${username}!`;

    if (recipe.image_url && recipe.image_url.trim().length > 0) {
      ogImageUrl = recipe.image_url;
      xImageUrl = recipe.image_url;
    }

    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        images: [
          {
            url: ogImageUrl,
            alt: `${title} - a recipe by ${username}`,
          },
        ],
        url: `${baseurl}recipes/${username}/${slug}`,
      },
      twitter: {
        title: title,
        description: description,
        images: [
          {
            url: xImageUrl,
            alt: `${title} - a recipe by ${username}`,
          },
        ],
      },
    };
  } catch (err) {
    const title = `Recipes at ${baseurl}`
    const description = `Check out these recipes at ${baseurl}!`;
    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        images: [
          {
            url: ogImageUrl,
            alt: title,
            height: 630,
            width: 1200,
          },
        ],
        url: `${baseurl}recipes`,
      },
      twitter: {
        title: title,
        description: description,
        images: [
          {
            url: xImageUrl,
            alt: title,
            height: 600,
            width: 1200,
          },
        ],
      },
    };
  }
};

export default async function RecipePage(props: { params: Params }) {
  const { username, slug } = await props.params;

  if (!username || !slug) {
    throw new Error("Missing required parameters.");
  }

  try {
    const client = getRequestClient(undefined);
    const recipe = await client.api.GetRecipe(username, slug);

    return <RecipeClient recipe={recipe} username={username} />;
  } catch {
    redirect("/home");
  }

}
