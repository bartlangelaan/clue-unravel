import { useLocalItems } from "../providers/local-items";

export function useCurrentPage() {
  return useLocalItems().currentPage;
}
