export default {
	locales: ['en', 'pt-BR'],
	output: 'public/locales/$LOCALE/$NAMESPACE.json',
	input: ['src/**/*.{tsx,ts}'],
	keepRemoved: false,
	sort: true,
	defaultNamespace: 'translation',
	createOldCatalogs: false,
}
