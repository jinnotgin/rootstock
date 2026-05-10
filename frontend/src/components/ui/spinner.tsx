import { Loader2Icon } from 'lucide-react';

import { cn } from '@/lib/utils';

const sizes = {
	sm: 'size-4',
	md: 'size-8',
	lg: 'size-16',
	xl: 'size-24',
} as const;

function Spinner({
	className,
	size = 'md',
	...props
}: React.ComponentProps<'svg'> & {
	size?: keyof typeof sizes;
}) {
	return (
		<Loader2Icon
			data-testid="loading"
			role="status"
			aria-label="Loading"
			className={cn(
				'animate-spin text-muted-foreground',
				sizes[size],
				className,
			)}
			{...props}
		/>
	);
}

export { Spinner };
