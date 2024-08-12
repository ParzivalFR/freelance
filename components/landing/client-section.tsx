import Image from "next/image";

export default function ClientSection() {
  return (
    <section
      id="clients"
      className="mx-auto max-w-7xl px-6 text-center md:px-8"
    >
      <div className="py-14">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8">
          <h2 className="text-center text-sm font-semibold text-gray-600">
            Ils nous font confiance
          </h2>
          <div className="mt-6">
            <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16 [&_path]:fill-white">
              <li>
                <Image
                  src={`https://cdn.magicui.design/companies/Google.svg`}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                  width={112}
                  height={28}
                  alt="Google"
                />
              </li>
              <li>
                <Image
                  src={`https://cdn.magicui.design/companies/Microsoft.svg`}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                  width={112}
                  height={28}
                  alt="Microsoft"
                />
              </li>
              <li>
                <Image
                  src={`https://cdn.magicui.design/companies/GitHub.svg`}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                  width={112}
                  height={28}
                  alt="GitHub"
                />
              </li>

              <li>
                <Image
                  src={`https://cdn.magicui.design/companies/Uber.svg`}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                  width={112}
                  height={28}
                  alt="Uber"
                />
              </li>
              <li>
                <Image
                  src={`https://cdn.magicui.design/companies/Notion.svg`}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                  width={112}
                  height={28}
                  alt="Notion"
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
