"use client";

import AuthButton from "./AuthButton";
import Link from "next/link";
import type { AppUser } from '@/types/user'

type Props = {
  onMenuClick: () => void
  user: AppUser | null
}

export default function Header({ onMenuClick, user }: Props) {
  return (
    <header className="w-full bg-base-100 border-b shadow-sm sticky top-0 z-50">
      <div className="w-full flex items-center justify-between px-4 py-3">
        <button
          className="btn btn-ghost btn-sm px-2 relative z-70"
          onClick={onMenuClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <Link href="/">
          <h1 className="text-2xl font-bold cursor-pointer">
            ねこあるき
          </h1>
        </Link>
        <AuthButton user={user} />
      </div>
    </header>
  );
}
