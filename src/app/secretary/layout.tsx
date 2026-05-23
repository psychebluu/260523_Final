import { SecretaryShell } from "@/components/secretary/SecretaryShell";

export default function SecretaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SecretaryShell>{children}</SecretaryShell>;
}
