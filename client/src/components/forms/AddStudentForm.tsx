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
	submitStudentForm,
	submitUpdateStudentForm,
} from '@/api/student';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import Plus from '../icons/plus';
import { Student } from '@/types/student';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ErrorText from '../ui/error-text';
import { queryClient } from '@/main';
import { QUERY_KEYS } from '@/constants';
import _ from 'lodash';

export type StudentFormValues = z.infer<typeof studentSchema>;

type AddStudentFormProps = {
	mode?: 'edit' | 'add';
	student?: Student;
};

export function AddStudentForm({ mode = 'add', student }: AddStudentFormProps) {
	if (student === undefined && mode === 'edit') {
		throw new Error(
			'No student data provided while student form mode is on edit'
		);
	}

	const navigate = useNavigate();

	const { data: studentData } = useQuery({
		queryKey: [QUERY_KEYS.STUDENT, { studentID: student?.studentID }],
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
			setValue('firstname', _.startCase(studentData.firstname));
			setValue('lastname', _.startCase(studentData.lastname));
			setValue('studentID', studentData.studentID);
			setValue('middlename', studentData.middlename);
			setValue('course', studentData.course);
			setValue('gender', studentData.gender);
			setValue('year', studentData.year?.toString());
		}
	}, [studentData, setValue]);

	const onSubmit = async (data: StudentFormValues) => {
		try {
			let result;

			if (mode === 'add') result = await submitStudentForm(data);
			if (mode === 'edit')
				result = await submitUpdateStudentForm(student?.studentID ?? '', data);

			if (!result) {
				setError('root', {
					message: 'Something went wrong while trying to submit your form',
				});
				return;
			}

			if (!result.success) {
				setError('root', {
					message: `${result.message} ${result.error ?? ''}`,
				});
				return;
			}

			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT] });
			navigate(`/student/${student?.studentID ?? ''}`, { replace: true });
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
					<div className='flex gap-2'>
						<InputField<StudentFormValues>
							name='middlename'
							registerFn={register}
							errors={errors}
							label='Middlename: (optional)'
							id='middlename'
						/>

						<InputField<StudentFormValues>
							name='course'
							registerFn={register}
							errors={errors}
							label='Course:'
							id='course'
						/>
					</div>
					<div className='flex gap-2'>
						<InputField<StudentFormValues>
							name='gender'
							registerFn={register}
							errors={errors}
							label='Gender: (M/F)'
							id='gender'
						/>
						<InputField<StudentFormValues>
							name='year'
							type='number'
							registerFn={register}
							errors={errors}
							label='Year:'
							id='year'
						/>
					</div>
					<InputField<StudentFormValues>
						name='email'
						registerFn={register}
						errors={errors}
						label='Email(optional):'
						id='email'
					/>

					{errors.root && errors.root.message && (
						<ErrorText>{errors.root.message.toString()}</ErrorText>
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
