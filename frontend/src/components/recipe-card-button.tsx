import { useNavigate } from 'react-router-dom';
import { api } from '../client';

interface RecipeCardButtonProps {
    item: api.Recipe;
}

const RecipeCardButton: React.FC<RecipeCardButtonProps> = ({ item }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/my-recipe-app/recipes/${item.id}`);
    };

    return (
        <button
            key={item.id}
            className="flex flex-col flex-grow items-start gap-2 rounded-lg border p-3 text-left text-xl transition-all hover:bg-accent"
            onClick={handleClick}
        >
            <div className="flex w-full flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="font-semibold text-2xl">{item.title}</div>
                </div>
            </div>
        </button>
    );
};

export default RecipeCardButton;
