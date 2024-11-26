import Recipe from "../../../../components/recipe.server";

export default function RecipePage({ params }: { params: { username: string; slug: string } }) {
  return <Recipe params={params} />;
}
