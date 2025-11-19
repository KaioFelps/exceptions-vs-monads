type DatastoreErrorType =
    | "internal_db_error"
    | "no_rows_found"
    | "multiple_rows_found"
    | "unique_constraint";

/**
 * Um erro externo que, hipoteticamente, foge do controle desta aplicação.
 */
export class DatastoreError extends Error {
    public constructor(
        public type: DatastoreErrorType = "internal_db_error",
        message?: string,
    ) {
        super(message)
    }
}