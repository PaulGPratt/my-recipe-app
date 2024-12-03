import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { api } from '../lib/client';
import { Button } from './ui/button';

interface RecipeCardButtonProps {
    item: api.RecipeCard;
}

const RecipeCardButton: React.FC<RecipeCardButtonProps> = ({ item }) => {

    return (
        <Link href={`/recipes/${item.username}/${item.slug}`} passHref>
            <Button
                key={item.id}
                variant="secondary"
                className="justify-between pr-1 text-left text-wrap"
                asChild>
                <div className="flex justify-between items-center w-full">
                    <div>
                        {item.title}
                    </div>
                    <div className='min-w-8 ml-4'><ChevronRight size={30} /></div>
                </div>
            </Button>
        </Link>
    );
};

export default RecipeCardButton;
