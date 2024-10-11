import { useNavigate } from 'react-router-dom';
import { Flame, Timer } from 'lucide-react';
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
                    <div className="font-semibold">{item.title}</div>

                    <div className="flex items-center gap-2 ml-auto">
                        {item.cook_temp_deg_f.Valid && (
                            <div className="flex">
                                <Flame /> {item.cook_temp_deg_f.Int16}°F
                            </div>
                        )}
                        {item.cook_time_minutes.Valid && (
                            <div className="flex">
                                <Timer /> {item.cook_time_minutes.Int16}min
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Todo: hide these until the recipe is selected */}
            <div className="text-m text-muted-foreground">
                {item.ingredients}
            </div>
            <div className="text-m text-muted-foreground">
                {item.instructions}
            </div>
        </button>
    );
};

export default RecipeCardButton;
