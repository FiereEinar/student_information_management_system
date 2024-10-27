import { fetchCategories } from '@/api/category';
import CategoriesTable from '@/components/CategoriesTable';
import AddCategoryForm from '@/components/forms/AddCategoryForm';
import SidebarPageLayout from '@/components/SidebarPageLayout';
import StickyHeader from '@/components/StickyHeader';
import Header from '@/components/ui/header';
import { QUERY_KEYS } from '@/constants';
import { useQuery } from '@tanstack/react-query';

export default function Category() {
	const {
		data: categories,
		isLoading: cLoading,
		error: cError,
	} = useQuery({
		queryKey: [QUERY_KEYS.CATEGORY],
		queryFn: fetchCategories,
	});

	if (cLoading) {
		return <p>Loading...</p>;
	}

	if (cError || !categories) {
		return <p>Error</p>;
	}

	console.log(categories);

	return (
		<SidebarPageLayout>
			<div className='mt-5' />
			<StickyHeader>
				<Header>Category Page</Header>
				<AddCategoryForm />
			</StickyHeader>
			<CategoriesTable categories={categories} />
		</SidebarPageLayout>
	);
}
