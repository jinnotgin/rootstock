import { LayoutDashboard, PanelLeft, Settings, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useNavigation } from 'react-router';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { paths } from '@/config/paths';
import { useLogout, useUser } from '@/lib/auth';
import { cn } from '@/utils/cn';

type NavItem = { name: string; to: string; icon: React.ElementType };

const NavigationProgress = () => {
	const { state, location } = useNavigation();
	const [progress, setProgress] = useState(0);

	useEffect(() => { setProgress(0); }, [location?.pathname]);

	useEffect(() => {
		if (state !== 'loading') return;
		const timer = setInterval(() => {
			setProgress((p) => (p >= 100 ? 100 : p + 10));
		}, 300);
		return () => clearInterval(timer);
	}, [state]);

	if (state !== 'loading') return null;

	return (
		<div
			className="fixed left-0 top-0 h-1 bg-primary transition-all duration-200 ease-in-out"
			style={{ width: `${progress}%` }}
		/>
	);
};

const NavItems = ({ items, end = false }: { items: NavItem[]; end?: boolean }) => (
	<>
		{items.map((item) => (
			<NavLink
				key={item.name}
				to={item.to}
				end={end}
				className={({ isActive }) =>
					cn(
						'group flex w-full items-center rounded-md p-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white',
						isActive && 'bg-gray-900 text-white',
					)
				}
			>
				<item.icon className="mr-3 size-5 shrink-0 text-gray-400 group-hover:text-gray-300" aria-hidden />
				{item.name}
			</NavLink>
		))}
	</>
);

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
	const navigate = useNavigate();
	const user = useUser();
	const logout = useLogout({ onSuccess: () => navigate(paths.auth.login.getHref()) });

	const navItems: NavItem[] = [
		{ name: 'Dashboard', to: paths.app.dashboard.getHref(), icon: LayoutDashboard },
		...(user.data?.role === 'ADMIN'
			? [
					{ name: 'Users', to: paths.app.admin.users.getHref(), icon: Users },
					{ name: 'Models', to: paths.app.admin.models.getHref(), icon: Settings },
					{ name: 'Limits', to: paths.app.admin.limits.getHref(), icon: Settings },
				]
			: []),
	];

	return (
		<div className="flex min-h-screen w-full flex-col bg-muted/40">
			<aside className="fixed inset-y-0 left-0 z-10 hidden w-56 flex-col border-r bg-gray-900 sm:flex">
				<nav className="flex flex-col gap-1 px-3 py-4">
					<div className="mb-4 px-2 text-sm font-semibold text-white">API Gateway</div>
					<NavItems items={navItems} />
				</nav>
			</aside>

			<div className="flex flex-col sm:pl-56">
				<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 sm:justify-end sm:px-6">
					<NavigationProgress />
					<Sheet>
						<SheetTrigger asChild>
							<Button size="icon" variant="outline" className="sm:hidden">
								<PanelLeft className="size-5" />
								<span className="sr-only">Toggle menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="bg-gray-900 pt-10 text-white sm:max-w-56">
							<nav className="flex flex-col gap-1 px-1">
								<div className="mb-4 px-2 text-sm font-semibold">API Gateway</div>
								<NavItems items={navItems} />
							</nav>
						</SheetContent>
					</Sheet>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="gap-2">
								<span className="text-sm">{user.data?.email}</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => logout.mutate({})} className="cursor-pointer">
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</header>

				<main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-6">
					{children}
				</main>
			</div>
		</div>
	);
};
