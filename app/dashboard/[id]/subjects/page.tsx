const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">{id}</div>
    </div>
  );
};

export default page;
