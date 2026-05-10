import { ALL_MODELS } from '@/domain/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ModelsTab() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-900">Model Catalog</h2>
      <p className="text-sm text-gray-500">
        These are the available models in the gateway. Assign them to users from the Users tab.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ALL_MODELS.map((model) => (
          <Card key={model.slug}>
            <CardHeader>
              <CardTitle>{model.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="font-mono text-xs">
                {model.slug}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
