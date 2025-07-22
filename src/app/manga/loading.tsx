export default function Loading() {
  return (
    <div className="relative min-h-screen pb-16 text-gray-900 dark:text-gray-100 bg-white dark:bg-black">
      <div className="relative w-full h-[90vh] overflow-hidden">
        <div className="object-cover w-full h-full blur-md bg-gray-300 dark:bg-gray-800 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-black/60 dark:to-black"></div>
      </div>

      <div className="relative z-10 mx-auto -mt-64 max-w-screen-xl px-4 md:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
          <div className="hidden flex-shrink-0 md:block md:w-1/3 lg:w-1/4">
            <div className="mx-auto rounded-xl shadow-xl md:mx-0 w-[260px] h-[390px] bg-gray-300 dark:bg-gray-800 animate-pulse" />
          </div>

          <div className="mt-6 md:mt-0 md:w-2/3 lg:w-3/4">
            <div className="mb-4 h-10 w-2/3 bg-gray-300 dark:bg-gray-800 rounded animate-pulse" />
            <div className="mb-4 h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="mb-4 flex flex-wrap gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-full bg-gray-300 dark:bg-gray-700 px-6 py-2 h-6 w-20 animate-pulse"
                />
              ))}
            </div>
            <div className="mb-4 flex flex-wrap gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
            <div className="mb-6 h-20 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        <div className="mb-8 mt-16">
          <div className="rounded-xl bg-white/80 dark:bg-black/60 p-4 shadow-lg border dark:border-gray-800 max-w-2xl mx-auto">
            <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4 animate-pulse mx-auto" />
            <div className="max-h-[500px] overflow-y-auto divide-y dark:divide-gray-800">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="p-3 flex flex-col gap-2 animate-pulse"
                >
                  <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
