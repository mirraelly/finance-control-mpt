import {
  HugeiconsIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "../../../assets/icons";
import Button from "../Button";
import "./Pagination.css";

function Pagination({ page = 0, totalPages = 0, totalElements = 0, onChange }) {
  if (totalPages <= 1) {
    return (
      <div className="pagination">
        <span className="pagination__info">{totalElements} registro(s)</span>
      </div>
    );
  }

  return (
    <div className="pagination">
      <span className="pagination__info">{totalElements} registro(s)</span>

      <div className="pagination__controls">
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
      </div>
    </div>
  );
}

export default Pagination;
