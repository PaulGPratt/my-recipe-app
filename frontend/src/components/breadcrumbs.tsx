import { Link, useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";

function BreadCrumbs() {
    const { username } = useParams();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <Link to={`/recipes`} className="transition-colors hover:underline text-2xl">recipes</Link>
                </BreadcrumbItem>
                {username && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <Link to={`/recipes/${username}`} className="transition-colors hover:underline text-2xl">{username}</Link>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export default BreadCrumbs;