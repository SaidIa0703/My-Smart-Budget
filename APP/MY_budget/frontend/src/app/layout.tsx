import './globals.css';

export const metadata = {
  title: "My Smart Budget",
  description: "Simple budget manager starter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}