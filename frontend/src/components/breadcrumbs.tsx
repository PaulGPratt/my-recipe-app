import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";

function BreadCrumbs() {
    const navigate = useNavigate();
    const { username } = useParams();

    const navigateToAllRecipes = async () => {
        navigate(`/recipes`);
    }

    const navigateToUsername = () => {
        navigate(`/recipes/` + username)
    }

    return (
        <div className="flex gap-2 items-center">
            <Button variant="link" className="p-0 min-h-10" onClick={navigateToAllRecipes}>recipes</Button>
            {username && (
                <>
                <div>
                /
                </div>
                     <Button variant="link" className="p-0 min-h-10" onClick={navigateToUsername}>{username}</Button>
                </>

            )}
        </div>
    )
}

export default BreadCrumbs;