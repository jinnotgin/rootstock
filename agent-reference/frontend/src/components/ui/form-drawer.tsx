import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { useDisclosure } from '@/hooks/use-disclosure';

type FormDrawerProps = {
	isDone: boolean;
	triggerButton: React.ReactElement;
	submitButton: React.ReactElement;
	title: string;
	children: React.ReactNode;
};

export const FormDrawer = ({
	title,
	children,
	isDone,
	triggerButton,
	submitButton,
}: FormDrawerProps) => {
	const { close, open, isOpen } = useDisclosure();

	React.useEffect(() => {
		if (isDone) {
			close();
		}
	}, [isDone, close]);

	return (
		<Sheet
			open={isOpen}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					close();
				} else {
					open();
				}
			}}
		>
			<SheetTrigger asChild>{triggerButton}</SheetTrigger>
			<SheetContent className="flex max-w-[800px] flex-col justify-between sm:max-w-[540px]">
				<div className="flex flex-col">
					<SheetHeader>
						<SheetTitle>{title}</SheetTitle>
					</SheetHeader>
					<div className="p-4">{children}</div>
				</div>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline" type="button">
							Close
						</Button>
					</SheetClose>
					{submitButton}
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
};
