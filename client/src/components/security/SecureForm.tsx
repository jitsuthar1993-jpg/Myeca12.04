import { FormHTMLAttributes, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

interface SecureFormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: React.ReactNode;
  onSecureSubmit?: (data: any, csrfToken: string) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function SecureForm({ children, onSecureSubmit, onSubmit, ...props }: SecureFormProps) {
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Fetch CSRF token
  const { data: tokenData } = useQuery<{ token: string }>({
    queryKey: ['/api/auth/csrf-token'],
    queryFn: getQueryFn({ on401: 'throw' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (tokenData?.token) {
      setCsrfToken(tokenData.token);
    }
  }, [tokenData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (onSecureSubmit) {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());
      onSecureSubmit(data, csrfToken);
    } else if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form {...props} onSubmit={handleSubmit}>
      <input type="hidden" name="_csrf" value={csrfToken} />
      {children}
    </form>
  );
}