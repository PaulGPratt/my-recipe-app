import { Metadata } from "next";
import Recipe from "../../../../components/recipe.server";
import getRequestClient from "../../../../lib/get-request-client";

type Params = Promise<{ username: string; slug: string }>

export const generateMetadata = async (props: {
  params: Params
}): Promise<Metadata> => {

  console.log("hello");
  const {username, slug} = await props.params;

  const client = getRequestClient(undefined);
  const recipe = await client.api.GetRecipe(username, slug);

  const baseurl = "https://prattprojects-recipes.vercel.app";
  const { title } = recipe;
  const description = `Check out ${title} by ${username}!`;
  const ogImageUrl = `${baseurl}/og-image.jpg`
  const xImageUrl = `${baseurl}/x-image.jpg`

  console.log(xImageUrl);

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
          height: 630,
          width: 1200,
        },
      ],
      url: `${baseurl}/recipes/${username}/${slug}`,
    },
    twitter: {
      title: title,
      description: description,
      images : [
        {
          url: xImageUrl,
          alt: `${title} - a recipe by ${username}`,
          height: 600,
          width: 1200,
        }
      ],
    }
  };
}


export default async function RecipePage(props: {
  params: Params
}) {
  const {username, slug} = await props.params;
  return <Recipe username={username} slug={slug} />;
}
