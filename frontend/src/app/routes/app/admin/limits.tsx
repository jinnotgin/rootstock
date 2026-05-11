import { LimitsForm } from '@/features/admin/components/limits-form';

export default function AdminLimitsRoute() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Limits</h1>
			<LimitsForm />
		</div>
	);
}
