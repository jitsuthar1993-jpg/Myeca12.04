import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import DashboardServicesPage from './services.page';

vi.mock('@/components/admin/Layout', () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(async () => new Response(JSON.stringify({ id: 'service-1' }))),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('wouter', () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  useLocation: () => ['/dashboard/services', vi.fn()],
}));

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('DashboardServicesPage', () => {
  it('starts with a minimal rainfall selector before a service is selected', () => {
    renderWithQueryClient(<DashboardServicesPage />);

    const rainfallSelector = screen.getByRole('region', { name: 'Rainfall service selector' });

    expect(screen.getByRole('heading', { name: 'Choose a service' })).toBeInTheDocument();
    expect(within(rainfallSelector).getByText('GST Services')).toBeInTheDocument();
    expect(within(rainfallSelector).getByRole('button', { name: /GST Registration/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create service case/i })).toBeDisabled();
    expect(screen.queryByText('Marketplace')).not.toBeInTheDocument();
  });

  it('shows rich service details after choosing a rainfall row', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<DashboardServicesPage />);

    await user.click(screen.getByRole('button', { name: /GST Registration/i }));

    expect(screen.getByRole('heading', { name: 'GST Registration' })).toBeInTheDocument();
    expect(screen.getByText(/Complete GST registration assistance/i)).toBeInTheDocument();
    expect(screen.getByText('Required documents')).toBeInTheDocument();
    expect(screen.getByText('GST Calculator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create service case/i })).toBeEnabled();
  });
});
