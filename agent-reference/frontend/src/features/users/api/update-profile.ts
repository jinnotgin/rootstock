import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { useUser } from '@/lib/auth';
import { MutationConfig } from '@/lib/react-query';
import { useServices } from '@/services/app-services-provider';
import { defaultServices } from '@/services/bootstrap/services';

export const updateProfileInputSchema = z.object({
	email: z.string().min(1, 'Required').email('Invalid email'),
	firstName: z.string().min(1, 'Required'),
	lastName: z.string().min(1, 'Required'),
	bio: z.string(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

export const updateProfile = ({ data }: { data: UpdateProfileInput }) => {
	return defaultServices.users.updateProfile(data);
};

type UseUpdateProfileOptions = {
	mutationConfig?: MutationConfig<typeof updateProfile>;
};

export const useUpdateProfile = ({
	mutationConfig,
}: UseUpdateProfileOptions = {}) => {
	const { users } = useServices();
	const { refetch: refetchUser } = useUser();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			refetchUser();
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: ({ data }) => users.updateProfile(data),
	});
};
