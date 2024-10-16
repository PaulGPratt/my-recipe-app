import { useNavigate } from 'react-router-dom';
import { api } from '../client';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';

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
            className="justify-between pr-1 text-left text-wrap"
            onClick={handleClick}>
            {item.title}
            <div className='min-w-8 ml-4'><ChevronRight size={30} /></div>
            
        </Button>
    );
};

export default RecipeCardButton;
