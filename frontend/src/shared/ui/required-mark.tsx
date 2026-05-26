/**
 * Visual asterisk marker for required form fields.
 * Hidden from assistive tech (the underlying input should use `required` / aria-required).
 */
export const RequiredMark = () => (
  <span aria-hidden="true" className="ml-0.5 text-destructive">
    *
  </span>
);
