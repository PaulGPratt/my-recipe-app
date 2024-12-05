import { Metadata } from "next";
import RecipeListServer from "../../components/recipe-list.server";

export const generateMetadata = async (): Promise<Metadata> => {

  const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
  const ogImageUrl = `${baseurl}og-image.jpg`;
  const xImageUrl = `${baseurl}x-image.jpg`;

  const title = `All Recipes`
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
      url: `${baseurl}/recipes`,
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
};

function AllRecipes() {
  return (
    <RecipeListServer
      fetchRecipes={(client) => client.api.GetAllRecipes()}
    />
  );
}

export default AllRecipes;
