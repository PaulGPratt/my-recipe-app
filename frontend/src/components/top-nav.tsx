import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import React from "react";

const TopNav = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className }, ref) => {
    const navItems = [
        {
            name: "Recipes",
            href: "/recipes",
        },
        {
            name: "Plan",
            href: "/plan",
        }
    ];

    const location = useLocation();
    const { pathname } = location;

    return (
        <div
            className={cn("p-4 flex items-center text-2xl", className)}
            ref={ref}>
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
})

export default TopNav;