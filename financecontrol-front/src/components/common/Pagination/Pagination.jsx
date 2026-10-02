import { useId } from "react";
import Select from "../Select";
import {
  HugeiconsIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
} from "../../../assets/icons";
import Button from "../Button";
import "./Pagination.css";

function Pagination({
  page = 0,
  totalPages = 0,
  totalElements = 0,
  onChange,
  pageSize = 15,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 15, 30, 50],
}) {
  const pageSizeId = useId();

  if (totalPages <= 1) {
    return (
      <div className="pagination">
        <span className="pagination__info">{totalElements} registro(s)</span>
      </div>
    );
  }

  const sizeOptions = pageSizeOptions.map((size) => ({
    value: String(size),
    label: String(size),
  }));

  const lastPage = Math.max(totalPages - 1, 0);
  const isFirst = page <= 0;
  const isLast = page >= lastPage;

  return (
    <nav className="pagination" aria-label="Paginação">
      <span className="pagination__info" aria-live="polite">
        {totalElements} registro(s)
      </span>

      <div className="pagination__controls">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(0)}
          disabled={isFirst}
          aria-label="Primeira página"
          icon={<HugeiconsIcon icon={ArrowLeftDoubleIcon} size={16} />}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          aria-label="Página anterior"
          icon={<HugeiconsIcon icon={ArrowLeft01Icon} size={16} />}
        />
        <span className="pagination__page">
          Página {page + 1} de {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Próxima página"
          icon={<HugeiconsIcon icon={ArrowRight01Icon} size={16} />}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(lastPage)}
          disabled={isLast}
          aria-label="Última página"
          icon={<HugeiconsIcon icon={ArrowRightDoubleIcon} size={16} />}
        />
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
