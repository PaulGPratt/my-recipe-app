import { Metadata } from 'next';
import RecipeListServer from '../../../components/recipe-list.server';

type Params = Promise<{ username: string }>

export const generateMetadata = async (props: {
  params: Params
}): Promise<Metadata> => {

  console.log("hello");
  const {username } = await props.params;

  const baseurl = "https://prattprojects-recipes.vercel.app";
  const title = `Recipes by ${username}`;
  const description = `Check out this collection of recipes by ${username}!`;
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
          alt: title,
          height: 630,
          width: 1200,
        },
      ],
      url: `${baseurl}/recipes/${username}`,
    },
    twitter: {
      title: title,
      description: description,
      images : [
        {
          url: xImageUrl,
          alt: title,
          height: 600,
          width: 1200,
        }
      ],
    }
  };
}

export default async function UserRecipesRecipePage(props: {
  params: Params
}) {
  const {username} = await props.params

  return (
    <RecipeListServer
      username={username}
      fetchRecipes={(client) => client.api.GetRecipesByProfileId(username)}
    />
  );
}