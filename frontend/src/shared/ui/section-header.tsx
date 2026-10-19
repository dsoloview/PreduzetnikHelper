import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  /** Optional "see all" link */
  linkTo?: string;
  linkLabel?: string;
}

export const SectionHeader = ({ title, linkTo, linkLabel }: SectionHeaderProps) => (
  <div className="flex items-center justify-between gap-2">
    <h2 className="text-base font-semibold">{title}</h2>
    {linkTo && linkLabel && (
      <Link to={linkTo} className="flex items-center gap-1 text-sm text-primary hover:underline">
        {linkLabel} <ArrowRight className="size-3.5" />
      </Link>
    )}
  </div>
);
