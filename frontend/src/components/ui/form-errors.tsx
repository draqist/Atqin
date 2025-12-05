import { XCircle } from "lucide-react";

interface FormErrorsProps {
  id?: string;
  errors?: Record<string, string[] | undefined>;
}

export const FormErrors = ({ id, errors }: FormErrorsProps) => {
  if (!errors) {
    return null;
  }

  return (
    <div id={id} aria-live="polite" className="mt-2 text-xs text-rose-500">
      {Object.keys(errors).map((key) => (
        <div
          key={key}
          className="flex items-center font-medium p-2 border border-rose-500/10 bg-rose-500/10 rounded-sm"
        >
          <XCircle className="h-4 w-4 mr-2" />
          {errors[key]?.map((error: string) => (
            <span key={error}>{error}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

interface FormErrorMessageProps {
  message?: string;
}

export const FormErrorMessage = ({ message }: FormErrorMessageProps) => {
  if (!message) return null;

  return (
    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
      <XCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};
