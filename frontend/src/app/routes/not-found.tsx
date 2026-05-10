import { Link } from '@/components/ui/link';
import { paths } from '@/config/paths';

export default function NotFoundRoute() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4">
			<h1 className="text-4xl font-bold">404</h1>
			<p className="text-muted-foreground">Page not found.</p>
			<Link to={paths.home.getHref()}>Go home</Link>
		</div>
	);
}
