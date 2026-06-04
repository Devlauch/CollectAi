export default function StatusBadge({ status, large = false }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  };
  const size = large ? 'px-3 py-1.5 text-sm font-semibold' : 'px-2.5 py-0.5 text-xs font-medium';
  return (
    <span className={`inline-flex items-center rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'} ${size}`}>
      {status}
    </span>
  );
}
