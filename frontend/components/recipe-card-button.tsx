import Link from 'next/link';
import { api } from '../lib/client';
import { Button } from './ui/button';

interface RecipeCardButtonProps {
    item: api.RecipeCard;
    showUsername?: boolean;
}

const RecipeCardButton: React.FC<RecipeCardButtonProps> = ({ item, showUsername }) => {

    return (
        <Link href={`/recipes/${item.username}/${item.slug}`} passHref>
            <Button
                key={item.id}
                variant="secondary"
                className="text-left text-wrap"
                asChild>
                <div className="flex justify-between items-center w-full">
                    <div>
                        {item.title}
                        {showUsername && (
                            <div className='font-normal text-xl text-muted-foreground'>
                                {item.username}
                            </div>
                        )}
                    </div>
                </div>
            </Button>
        </Link>
    );
};

export default RecipeCardButton;
