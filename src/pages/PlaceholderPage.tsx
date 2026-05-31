import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <AppLayout>
      <div className="p-8 max-w-[1080px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-text tracking-[-0.01em]">{title}</h1>
            <p className="text-sm text-muted">{description}</p>
          </div>
          <Card>
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm font-medium text-text">Coming soon</p>
              <p className="text-sm text-muted">This feature is being built. Check back shortly.</p>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
