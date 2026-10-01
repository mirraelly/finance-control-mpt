import { useId } from "react";
import Select from "../Select";
import "./Pagination.css";
import {
  HugeiconsIcon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ArrowDown01Icon,
} from "../../../assets/icons";

function getVisiblePages(pageCount, currentPage) {
  const visibleCount = Math.min(pageCount, 5);
  const firstPage = Math.min(
    Math.max(1, currentPage - Math.floor(visibleCount / 2)),
    pageCount - visibleCount + 1,
  );

  return Array.from({ length: visibleCount }, (_, index) => firstPage + index);
}

function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const pageSizeId = useId();

  if (totalItems <= 0) return null;

  const pageCount = Math.ceil(totalItems / pageSize);
  const pages = getVisiblePages(pageCount, currentPage);
  const sizeOptions = pageSizeOptions.map((size) => ({
    value: String(size),
    label: String(size),
  }));

  return (
    <nav className="table-pagination" aria-label="Paginação da tabela">
      <div className="table-pagination__pages">
        <button
          type="button"
          className="table-pagination__button"
          aria-label="Primeira página"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <HugeiconsIcon icon={ArrowLeftDoubleIcon} size={18} />
        </button>
        <button
          type="button"
          className="table-pagination__button"
          aria-label="Página anterior"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`table-pagination__button table-pagination__number ${
              page === currentPage ? "is-active" : ""
            }`}
            aria-label={`Página ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="table-pagination__button"
          aria-label="Próxima página"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
        </button>
        <button
          type="button"
          className="table-pagination__button"
          aria-label="Última página"
          onClick={() => onPageChange(pageCount)}
          disabled={currentPage === pageCount}
        >
          <HugeiconsIcon icon={ArrowRightDoubleIcon} size={18} />
        </button>
      </div>

      <Select
        id={pageSizeId}
        aria-label="Itens por página"
        options={sizeOptions}
        value={String(pageSize)}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
        dropdownPosition="top"
        width="68px"
        height="32px"
        className="table-pagination__page-size"
      />
    </nav>
  );
}

export default Pagination;
