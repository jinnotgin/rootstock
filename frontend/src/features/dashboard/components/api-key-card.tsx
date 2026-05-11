import { Check, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '@/components/ui/spinner';
import { useApiKey, useRotateApiKey } from '@/lib/gateway';

type Props = { userId: string };

export const ApiKeyCard = ({ userId }: Props) => {
	const { data: apiKey, isLoading } = useApiKey(userId);
	const rotate = useRotateApiKey(userId);
	const [revealed, setRevealed] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		if (!apiKey) return;
		await navigator.clipboard.writeText(apiKey.key);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const maskedKey = '•'.repeat(30);

	return (
		<Card>
			<CardHeader>
				<CardTitle>API Key</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{isLoading ? (
					<div className="flex items-center gap-2 text-muted-foreground">
						<Spinner size="sm" />
						<span>Loading…</span>
					</div>
				) : (
					<>
						<div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
							<span className="flex-1 truncate">
								{revealed ? apiKey?.key : maskedKey}
							</span>
						</div>

						<div className="flex flex-wrap gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setRevealed((r) => !r)}
								aria-label={revealed ? 'Hide API key' : 'Show API key'}
							>
								{revealed ? (
									<><EyeOff className="mr-1 size-4" /> Hide</>
								) : (
									<><Eye className="mr-1 size-4" /> Show</>
								)}
							</Button>

							<Button
								variant="outline"
								size="sm"
								onClick={handleCopy}
								aria-label="Copy API key"
							>
								{copied ? (
									<><Check className="mr-1 size-4" /> Copied</>
								) : (
									<><Copy className="mr-1 size-4" /> Copy</>
								)}
							</Button>

							<ConfirmationDialog
								title="Rotate API key?"
								body="Your current key will stop working immediately. Any integrations using it will need to be updated."
								icon="danger"
								isDone={rotate.isSuccess}
								triggerButton={
									<Button variant="outline" size="sm" aria-label="Rotate API key">
										<RefreshCw className="mr-1 size-4" /> Rotate
									</Button>
								}
								confirmButton={
									<Button
										variant="destructive"
										size="sm"
										onClick={() => rotate.mutate()}
										disabled={rotate.isPending}
									>
										{rotate.isPending ? 'Rotating…' : 'Yes, rotate'}
									</Button>
								}
							/>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
};
