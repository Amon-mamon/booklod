import { BookDetailScreen } from "@/features/books/components/book-detail-screen";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookDetailScreen id={id} />;
}
