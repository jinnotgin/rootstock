import { ArchiveX } from 'lucide-react';
import * as React from 'react';

import {
	Table as TableElement,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { BaseEntity } from '@/types/api';

export type TablePaginationProps = {
	totalPages: number;
	currentPage: number;
	rootUrl: string;
};

type TableColumn<Entry> = {
	title: string;
	field: keyof Entry;
	Cell?({ entry }: { entry: Entry }): React.ReactElement;
};

export type TableProps<Entry> = {
	data: Entry[];
	columns: TableColumn<Entry>[];
	pagination?: TablePaginationProps;
};

export const Table = <Entry extends BaseEntity>({
	data,
	columns,
	pagination: _pagination,
}: TableProps<Entry>) => {
	if (!data?.length) {
		return (
			<div className="flex h-80 flex-col items-center justify-center text-muted-foreground">
				<ArchiveX className="size-16" />
				<h4>No Entries Found</h4>
			</div>
		);
	}
	return (
		<TableElement>
			<TableHeader>
				<TableRow>
					{columns.map((column, index) => (
						<TableHead key={column.title + index}>{column.title}</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((entry, entryIndex) => (
					<TableRow key={entry?.id || entryIndex}>
						{columns.map(({ Cell, field, title }, columnIndex) => (
							<TableCell key={title + columnIndex}>
								{Cell ? <Cell entry={entry} /> : `${entry[field]}`}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</TableElement>
	);
};
