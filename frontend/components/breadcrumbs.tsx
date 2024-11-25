import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";

export default async function BreadCrumbs({
    params,
}: {
    params: { username?: string };
}) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <Link href={`/recipes`} className="transition-colors hover:underline text-2xl">recipes</Link>
                </BreadcrumbItem>
                {params.username && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <Link href={`/recipes/${params.username}`} className="transition-colors hover:underline text-2xl">{params.username}</Link>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    )
}