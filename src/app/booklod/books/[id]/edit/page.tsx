import { EditBookScreen } from "@/features/books/components/edit-book-screen";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lend?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const [{ id }, { lend }] = await Promise.all([params, searchParams]);
  return <EditBookScreen id={id} lend={lend === "1"} />;
}
