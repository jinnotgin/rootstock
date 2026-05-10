import { ALL_MODELS } from '@/domain/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/lib/auth';

export function ModelsCard() {
  const user = useCurrentUser();
  const assignedModels = ALL_MODELS.filter((m) =>
    user.assignedModels.includes(m.slug),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Models</CardTitle>
      </CardHeader>
      <CardContent>
        {assignedModels.length === 0 ? (
          <p className="text-sm text-gray-500">No models assigned.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {assignedModels.map((model) => (
              <Badge key={model.slug} variant="info">
                {model.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
