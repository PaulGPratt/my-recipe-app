import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../client';
import { Button } from './ui/button';

interface RecipeCardButtonProps {
    item: api.RecipeCard;
}

const RecipeCardButton: React.FC<RecipeCardButtonProps> = ({ item }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/recipes/${item.username}/${item.slug}`);
    };

    return (
        <Button
            key={item.id}
            variant="secondary"
            className="justify-between pr-1 text-left text-wrap"
            onClick={handleClick}>
            <div className='flex flex-col'>
                {item.title}
            </div>

            <div className='min-w-8 ml-4'><ChevronRight size={30} /></div>

        </Button>
    );
};

export default RecipeCardButton;
