import "./globals.css";

export const metadata = {
  title: "8bitbrains — A Creative Agency",
  description: "We build apps and websites that make sense.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
