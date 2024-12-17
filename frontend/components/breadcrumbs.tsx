import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "./ui/breadcrumb";

export default function BreadCrumbs({
    params,
}: {
    params: { username?: string};
}) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <Link href={`/recipes/${params.username}`} className="transition-colors hover:underline text-2xl">{params.username}</Link>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}