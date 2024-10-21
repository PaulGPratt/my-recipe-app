import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

export function TopNav() {

    const navItems = [
        {
            name: "Recipes",
            href: "/my-recipe-app/recipes",
        },
        {
            name: "Plan",
            href: "/my-recipe-app/plan",
        }
    ];

    const location = useLocation();
    const { pathname } = location;

    return (
        <div className="p-4 flex items-center text-2xl">
            {navItems.map((example, index) => (
                <Link
                    to={example.href}
                    key={example.href}
                    className={cn(
                        "flex h-10 items-center justify-center rounded-full px-6 text-center transition-colors hover:text-primary-foreground",
                        pathname?.startsWith(example.href) ||
                            (index === 0 && pathname === "/")
                            ? "bg-primary font-semibold text-primary-foreground"
                            : "text-muted-foreground"
                    )}
                >
                    {example.name}
                </Link>
            ))}
        </div>
    )
}

export default TopNav;