import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useModels } from '@/lib/gateway';

type Props = { userId: string };

const providerLabel: Record<string, string> = {
	anthropic: 'Anthropic',
	google: 'Google',
};

export const ModelList = ({ userId }: Props) => {
	const { data: models, isLoading } = useModels(userId);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Available Models</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex items-center gap-2 text-muted-foreground">
						<Spinner size="sm" />
						<span>Loading…</span>
					</div>
				) : !models?.length ? (
					<p className="text-sm text-muted-foreground">No models available.</p>
				) : (
					<ul className="space-y-2">
						{models.map((model) => (
							<li key={model.id} className="flex items-center justify-between rounded-md border px-3 py-2">
								<span className="font-mono text-sm">{model.name}</span>
								<Badge variant="secondary">{providerLabel[model.provider] ?? model.provider}</Badge>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
};
