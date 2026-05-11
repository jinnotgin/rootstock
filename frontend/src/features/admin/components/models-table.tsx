import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useAdminModels } from '@/lib/admin';
import { EditModelDrawer } from './edit-model-drawer';

export const ModelsTable = () => {
	const { data: models, isLoading } = useAdminModels();

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 text-muted-foreground">
				<Spinner size="sm" />
				<span>Loading models…</span>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">Models</h2>

			<div className="rounded-md border">
				<table className="w-full text-sm">
					<thead className="border-b bg-muted/50">
						<tr>
							<th className="px-4 py-3 text-left font-medium">Name</th>
							<th className="px-4 py-3 text-left font-medium">Provider</th>
							<th className="px-4 py-3 text-left font-medium">Status</th>
							<th className="px-4 py-3 text-left font-medium">Input $/token</th>
							<th className="px-4 py-3 text-left font-medium">Output $/token</th>
							<th className="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{models?.map((model) => (
							<tr key={model.id} className="border-b last:border-0">
								<td className="px-4 py-3 font-mono">{model.name}</td>
								<td className="px-4 py-3 capitalize">{model.provider}</td>
								<td className="px-4 py-3">
									<Badge variant={model.isActive ? 'default' : 'secondary'}>
										{model.isActive ? 'Active' : 'Inactive'}
									</Badge>
								</td>
								<td className="px-4 py-3">{model.pricePerInputTokenUsd.toExponential(2)}</td>
								<td className="px-4 py-3">{model.pricePerOutputTokenUsd.toExponential(2)}</td>
								<td className="px-4 py-3">
									<div className="flex justify-end">
										<EditModelDrawer model={model} />
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
