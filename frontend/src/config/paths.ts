export const paths = {
	home: {
		path: '/',
		getHref: () => '/',
	},

	auth: {
		login: {
			path: '/auth/login',
			getHref: (redirectTo?: string | null) =>
				`/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
		},
		setPassword: {
			path: '/auth/set-password',
			getHref: (email?: string) =>
				`/auth/set-password${email ? `?email=${encodeURIComponent(email)}` : ''}`,
		},
	},

	app: {
		root: {
			path: '/app',
			getHref: () => '/app',
		},
		dashboard: {
			path: '',
			getHref: () => '/app',
		},
		admin: {
			root: {
				path: 'admin',
				getHref: () => '/app/admin',
			},
			users: {
				path: 'admin/users',
				getHref: () => '/app/admin/users',
			},
			models: {
				path: 'admin/models',
				getHref: () => '/app/admin/models',
			},
			limits: {
				path: 'admin/limits',
				getHref: () => '/app/admin/limits',
			},
		},
	},
} as const;
