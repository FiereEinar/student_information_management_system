import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import InputField from '../InputField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema } from '@/lib/validations/studentSchema';
import {
	fetchStudentByID,
	fetchStudents,
	submitStudentForm,
	submitUpdateStudentForm,
} from '@/api/student';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import Plus from '../icons/plus';
import { Student } from '@/types/student';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export type StudentFormValues = z.infer<typeof studentSchema>;

type AddStudentFormProps = {
	mode?: 'edit' | 'add';
	student?: Student;
};

export function AddStudentForm({ mode = 'add', student }: AddStudentFormProps) {
	if (student === undefined && mode === 'edit') {
		throw new Error('No student data provided while form mode is on edit');
	}

	const navigate = useNavigate();

	const { refetch } = useQuery({
		queryKey: ['students'],
		queryFn: fetchStudents,
	});

	const { data: studentData, refetch: sRefetch } = useQuery({
		queryKey: [`student_${student?.studentID}`],
		queryFn: () => fetchStudentByID(student?.studentID ?? ''),
	});

	const {
		register,
		handleSubmit,
		setValue,
		setError,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<StudentFormValues>({
		resolver: zodResolver(studentSchema),
	});

	useEffect(() => {
		if (studentData) {
			setValue('email', studentData.email);
			setValue('firstname', studentData.firstname);
			setValue('lastname', studentData.lastname);
			setValue('studentID', studentData.studentID);
		}
	}, [studentData]);

	const onSubmit = async (data: StudentFormValues) => {
		try {
			let result;

			if (mode === 'add') result = await submitStudentForm(data);
			else if (mode === 'edit')
				result = await submitUpdateStudentForm(student?.studentID ?? '', data);

			if (!result) {
				setError('root', {
					message: 'Something went wrong while trying to submit your form',
				});
				return;
			}

			if (!result.success) {
				setError('root', {
					message: `${result.message} - ${result.error ?? ''}`,
				});
				return;
			}

			mode === 'add' ? refetch() : sRefetch();
			navigate(`/student/${student?.studentID ?? ''}`);
			reset();
		} catch (err: any) {
			setError('root', { message: 'Failed to submit student form' });
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				{mode === 'add' ? (
					<Button className='flex justify-center gap-1' size='sm'>
						<Plus />
						<p>Add Student</p>
					</Button>
				) : (
					<Button className='flex gap-1' size='sm' variant='ocean'>
						<img src='/icons/edit.svg' className='size-5' alt='' />
						<p>Edit</p>
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>{mode === 'add' ? 'Add' : 'Edit'} Student</DialogTitle>
					<DialogDescription>Fill up the form</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-2'>
					<InputField<StudentFormValues>
						name='studentID'
						registerFn={register}
						errors={errors}
						label='Student ID:'
						id='studentID'
					/>
					<InputField<StudentFormValues>
						name='firstname'
						registerFn={register}
						errors={errors}
						label='Firstname:'
						id='firstname'
					/>
					<InputField<StudentFormValues>
						name='lastname'
						registerFn={register}
						errors={errors}
						label='Lastname:'
						id='lastname'
					/>
					<InputField<StudentFormValues>
						name='email'
						registerFn={register}
						errors={errors}
						label='Email(optional):'
						id='email'
					/>

					{errors.root && errors.root.message && (
						<p className='text-xs text-destructive'>
							{errors.root.message.toString()}
						</p>
					)}

					<div className='flex justify-end'>
						<Button className='' disabled={isSubmitting} type='submit'>
							Submit
						</Button>
					</div>
				</form>

				<DialogFooter></DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
