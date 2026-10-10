import { AlertMessage } from "../molecules";

interface CheckoutButtonProps {
  busy: boolean;
  disabled: boolean;
  error: string;
  onPay: () => void;
}

export function CheckoutButton({ busy, disabled, error, onPay }: CheckoutButtonProps) {
  return (
    <>
      {error && <AlertMessage tone="danger" message={error} />}
      <button
        type="button"
        onClick={onPay}
        disabled={busy || disabled}
        className="min-h-12 rounded-[14px] bg-linear-to-b from-primary to-(--pp-green-d) font-semibold text-primary-foreground shadow-md hover:brightness-110 disabled:opacity-50"
      >
        {busy ? "Processing..." : "Pay securely"}
      </button>
    </>
  );
}
