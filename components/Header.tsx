import NextLogo from "./NextLogo";

export default function Header() {
  return (
    <div className="flex flex-col items-center my-16">
      <div className="flex justify-center items-center">
        <span className="border-l rotate-45 h-6" />
        <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
          <NextLogo />
        </a>
      </div>
    </div>
  );
}
