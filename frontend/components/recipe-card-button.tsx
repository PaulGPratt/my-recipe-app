import { ChevronRight } from 'lucide-react';
import { redirect } from 'next/navigation';
import { api } from '../lib/client';
import { Button } from './ui/button';

interface RecipeCardButtonProps {
    item: api.RecipeCard;
}

const RecipeCardButton: React.FC<RecipeCardButtonProps> = ({ item }) => {

    const handleClick = () => {
        redirect(`/recipes/${item.username}/${item.slug}`);
    };

    return (
        <Button
            key={item.id}
            variant="secondary"
            className="justify-between pr-1 text-left text-wrap"
            onClick={handleClick}>
            <div>
                {item.title}
            </div>

            <div className='min-w-8 ml-4'><ChevronRight size={30} /></div>

        </Button>
    );
};

export default RecipeCardButton;
