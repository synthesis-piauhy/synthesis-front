export function FieldMessage({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return <span id={id} role="alert" className="mt-1.5 block text-xs font-medium text-danger">{children}</span>;
}
