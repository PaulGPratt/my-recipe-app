import { useNavigate } from 'react-router-dom';
import { api } from '../client';
import { Button } from './ui/button';

interface RecipeCardButtonProps {
    item: api.Recipe;
}

const RecipeCardButton: React.FC<RecipeCardButtonProps> = ({ item }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/my-recipe-app/recipes/${item.id}`);
    };

    return (
        <Button
            key={item.id}
            size="xl"
            variant="outline"
            className="justify-start"
            onClick={handleClick}>
            {item.title}
        </Button>
    );
};

export default RecipeCardButton;
