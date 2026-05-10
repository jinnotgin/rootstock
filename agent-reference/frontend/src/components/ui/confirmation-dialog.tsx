import { CircleAlert, Info } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { useDisclosure } from '@/hooks/use-disclosure';

export type ConfirmationDialogProps = {
	triggerButton: React.ReactElement;
	confirmButton: React.ReactElement;
	title: string;
	body?: string;
	cancelButtonText?: string;
	icon?: 'danger' | 'info';
	isDone?: boolean;
};

export const ConfirmationDialog = ({
	triggerButton,
	confirmButton,
	title,
	body = '',
	cancelButtonText = 'Cancel',
	icon = 'danger',
	isDone = false,
}: ConfirmationDialogProps) => {
	const { close, open, isOpen } = useDisclosure();

	React.useEffect(() => {
		if (isDone) {
			close();
		}
	}, [isDone, close]);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					close();
				} else {
					open();
				}
			}}
		>
			<DialogTrigger asChild>{triggerButton}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader className="flex">
					<DialogTitle className="flex items-center gap-2">
						{icon === 'danger' && (
							<CircleAlert className="size-6 text-red-600" aria-hidden="true" />
						)}
						{icon === 'info' && (
							<Info className="size-6 text-blue-600" aria-hidden="true" />
						)}
						{title}
					</DialogTitle>
				</DialogHeader>

				<div className="text-center sm:text-left">{body && <p>{body}</p>}</div>

				<DialogFooter>
					{confirmButton}
					<Button variant="outline" onClick={close}>
						{cancelButtonText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
