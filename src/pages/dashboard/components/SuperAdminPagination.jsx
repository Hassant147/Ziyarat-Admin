import React from "react";
import { AppButton } from "../../../components/ui";

const buildPaginationItems = (currentPage, totalPages, windowSize = 1) => {
  const pages = new Set([1, totalPages, currentPage]);
  for (let offset = 1; offset <= windowSize; offset += 1) {
    pages.add(currentPage - offset);
    pages.add(currentPage + offset);
  }

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const items = [];
  sortedPages.forEach((page, index) => {
    items.push(page);
    const nextPage = sortedPages[index + 1];
    if (nextPage && nextPage - page > 1) {
      items.push(`ellipsis-${page}`);
    }
  });

  return items;
};

const SuperAdminPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const paginationItems = buildPaginationItems(currentPage, totalPages);

  return (
    <nav className="flex flex-wrap items-center justify-end gap-2">
      <AppButton
        size="sm"
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Prev
      </AppButton>

      {paginationItems.map((item) => {
        if (typeof item === "string") {
          return (
            <span key={item} className="px-1 text-sm font-semibold text-ink-300">
              ...
            </span>
          );
        }

        const page = item;
        return (
          <AppButton
            key={page}
            size="sm"
            variant={page === currentPage ? "primary" : "outline"}
            className="min-w-[40px] rounded-full"
            onClick={() => onPageChange(page)}
          >
            {page}
          </AppButton>
        );
      })}

      <AppButton
        size="sm"
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </AppButton>
    </nav>
  );
};

export default React.memo(SuperAdminPagination);
