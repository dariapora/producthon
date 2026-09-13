import { BrandLogo } from "@/components/layout/BrandLogo";

type FooterProps = {
  variant?: "dark" | "light";
  className?: string;
};

export function Footer({ variant = "dark", className = "" }: FooterProps) {
  return (
    <footer className={`py-8 ${className}`}>
      <div className="mx-auto flex max-w-[1320px] items-center justify-center px-4 sm:px-6">
        <BrandLogo className="text-[30px] sm:text-[36px]" variant={variant} />
      </div>
    </footer>
  );
}
