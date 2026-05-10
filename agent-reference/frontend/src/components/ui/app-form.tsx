import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import {
	FieldValues,
	SubmitHandler,
	UseFormProps,
	UseFormReturn,
	useForm,
	type UseFormRegisterReturn,
} from 'react-hook-form';
import { type FieldError } from 'react-hook-form';
import { ZodType, z } from 'zod';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Error display
// ---------------------------------------------------------------------------

export type ErrorProps = {
	errorMessage?: string | null;
};

export const Error = ({ errorMessage }: ErrorProps) => {
	if (!errorMessage) return null;

	return (
		<div
			role="alert"
			aria-label={errorMessage}
			className="text-sm font-semibold text-destructive"
		>
			{errorMessage}
		</div>
	);
};

// ---------------------------------------------------------------------------
// FieldWrapper
// ---------------------------------------------------------------------------

type FieldWrapperProps = {
	label?: string;
	className?: string;
	children: React.ReactNode;
	error?: FieldError | undefined;
};

export type FieldWrapperPassThroughProps = Omit<
	FieldWrapperProps,
	'className' | 'children'
>;

export const FieldWrapper = (props: FieldWrapperProps) => {
	const { label, error, children } = props;
	return (
		<div>
			<Label className="grid gap-1">
				{label}
				{children}
			</Label>
			<Error errorMessage={error?.message} />
		</div>
	);
};

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
	FieldWrapperPassThroughProps & {
		className?: string;
		registration: Partial<UseFormRegisterReturn>;
	};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, label, error, registration, ...props }, ref) => {
		return (
			<FieldWrapper label={label} error={error}>
				<input
					type={type}
					className={cn(
						'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
						className,
					)}
					ref={ref}
					{...registration}
					{...props}
				/>
			</FieldWrapper>
		);
	},
);
Input.displayName = 'Input';

export { Input };

// ---------------------------------------------------------------------------
// Textarea
// ---------------------------------------------------------------------------

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
	FieldWrapperPassThroughProps & {
		className?: string;
		registration: Partial<UseFormRegisterReturn>;
	};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, label, error, registration, ...props }, ref) => {
		return (
			<FieldWrapper label={label} error={error}>
				<textarea
					className={cn(
						'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
						className,
					)}
					ref={ref}
					{...registration}
					{...props}
				/>
			</FieldWrapper>
		);
	},
);
Textarea.displayName = 'Textarea';

export { Textarea };

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

type Option = {
	label: React.ReactNode;
	value: string | number | string[];
};

type SelectFieldProps = FieldWrapperPassThroughProps & {
	options: Option[];
	className?: string;
	defaultValue?: string;
	registration: Partial<UseFormRegisterReturn>;
};

export const Select = (props: SelectFieldProps) => {
	const { label, options, error, className, defaultValue, registration } =
		props;
	return (
		<FieldWrapper label={label} error={error}>
			<select
				className={cn(
					'mt-1 block w-full rounded-md border border-input bg-transparent py-2 pl-3 pr-10 text-base focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring sm:text-sm',
					className,
				)}
				defaultValue={defaultValue}
				{...registration}
			>
				{options.map(({ label, value }) => (
					<option key={label?.toString()} value={value}>
						{label}
					</option>
				))}
			</select>
		</FieldWrapper>
	);
};

// ---------------------------------------------------------------------------
// Switch (re-export from shadcn)
// ---------------------------------------------------------------------------

export { Switch } from '@/components/ui/switch';

// ---------------------------------------------------------------------------
// Form (render-prop wrapper around react-hook-form + zod)
// ---------------------------------------------------------------------------

type FormProps<TFormValues extends FieldValues, Schema> = {
	onSubmit: SubmitHandler<TFormValues>;
	schema: Schema;
	className?: string;
	children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
	options?: UseFormProps<TFormValues>;
	id?: string;
};

const Form = <
	Schema extends ZodType<FieldValues>,
	TFormValues extends FieldValues = z.infer<Schema>,
>({
	onSubmit,
	children,
	className,
	options,
	id,
	schema,
}: FormProps<TFormValues, Schema>) => {
	const form = useForm<TFormValues>({
		...options,
		resolver: zodResolver(schema as any),
	});
	return (
		<form
			className={cn('space-y-6', className)}
			onSubmit={form.handleSubmit(onSubmit)}
			id={id}
		>
			{children(form)}
		</form>
	);
};

export { Form };
