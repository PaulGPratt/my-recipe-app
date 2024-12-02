import { Metadata } from "next";
import EditRecipeServer from "../../../../../components/edit-recipe.server";

type Params = Promise<{ username: string; slug: string }>

export const metadata: Metadata = {
  title: 'Edit Recipe',
}

export default async function EditRecipePage(props: {
  params: Params
}) {
  const {username, slug} = await props.params
  return <EditRecipeServer username={username} slug={slug} />;
}
