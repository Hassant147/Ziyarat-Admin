import { useCallback, useEffect, useMemo, useState } from "react";

const usePaginatedRecords = (records, itemsPerPage = 6) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(records.length / itemsPerPage));
  }, [itemsPerPage, records.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return records.slice(start, end);
  }, [currentPage, itemsPerPage, records]);

  const onPageChange = useCallback(
    (page) => {
      const nextPage = Math.min(Math.max(page, 1), totalPages);
      setCurrentPage(nextPage);
    },
    [totalPages]
  );

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    currentItems,
    onPageChange,
    resetPagination,
  };
};

export default usePaginatedRecords;
