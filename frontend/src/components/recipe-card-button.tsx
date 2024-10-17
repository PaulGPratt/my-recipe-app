import { useNavigate } from 'react-router-dom';
import { api } from '../client';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';

interface RecipeCardButtonProps {
    item: api.RecipeCard;
}

const RecipeCardButton: React.FC<RecipeCardButtonProps> = ({ item }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/my-recipe-app/recipes/${item.id}`);
    };

    return (
        <Button
            key={item.id}
            variant="default"
            className="justify-between pr-1 text-left text-wrap"
            onClick={handleClick}>
            <div className='flex flex-col font-semibold'>
                {item.title}
                {/* {item.tags?.length > 0 && (
                    <div className='flex pt-2'>
                        {item.tags?.map((tag, index) => (
                            <div key={tag + index} className="rounded-full border border-primary px-3 py-0.5 text-lg" >{tag}</div>
                        ))}
                    </div>
                )} */}
            </div>

            <div className='min-w-8 ml-4'><ChevronRight size={30} /></div>

        </Button>
    );
};

export default RecipeCardButton;
