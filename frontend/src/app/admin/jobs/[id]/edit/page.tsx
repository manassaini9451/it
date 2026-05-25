import JobForm from '@/components/admin/JobForm';

export default function EditJobPage({ params }: { params: { id: string } }) {
  return <JobForm jobId={params.id} />;
}