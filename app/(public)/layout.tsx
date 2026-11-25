export const dynamic = "force-static";
export const revalidate = 300;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
