type Props = {
  page: number;
  hasNext: boolean;
  onPageChange: (
    page: number,
  ) => void;
};


export default function Pagination({
  page,
  hasNext,
  onPageChange,
}: Props) {
  return (
    <div className="pagination-bar">
      <div>
        Page {page + 1}
      </div>

      <div className="pagination-actions">
        <button
          type="button"
          className="secondary-button"
          disabled={page === 0}
          onClick={() =>
            onPageChange(
              Math.max(
                page - 1,
                0,
              ),
            )
          }
        >
          Previous
        </button>

        <button
          type="button"
          className="secondary-button"
          disabled={!hasNext}
          onClick={() =>
            onPageChange(
              page + 1,
            )
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}