import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { libraryApi } from "@/api/endpoints";
import type { BookInput, BookRecord, LibrarySnapshot } from "@/types/booklod";

export const queryKeys = {
  library: ["library"] as const,
  digest: (year: number) => ["digest", year] as const,
  profile: ["profile"] as const,
};

export function useLibrary() {
  return useQuery({ queryKey: queryKeys.library, queryFn: libraryApi.list });
}

export function useBook(id: string | undefined) {
  const library = useLibrary();
  return { ...library, book: library.data?.books.find((b) => b.id === id) };
}

export function useSaveBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, book }: { id?: string; book: BookInput }) =>
      id ? libraryApi.update(id, book) : libraryApi.create(book),
    onSuccess: ({ book, revision }) => {
      queryClient.setQueryData<LibrarySnapshot>(queryKeys.library, (current) => {
        const books = current?.books || [];
        const exists = books.some((b) => b.id === book.id);
        return { revision, books: exists ? books.map((b) => (b.id === book.id ? book : b)) : [book, ...books] };
      });
      queryClient.invalidateQueries({ queryKey: ["digest"] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => libraryApi.remove(id),
    onSuccess: ({ revision }, id) => {
      queryClient.setQueryData<LibrarySnapshot>(queryKeys.library, (current) => ({
        revision,
        books: (current?.books || []).filter((b: BookRecord) => b.id !== id),
      }));
      queryClient.invalidateQueries({ queryKey: ["digest"] });
    },
  });
}
