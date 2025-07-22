interface CategoryCount {
    categoryId: string;
    count: number;
    timestamp: number;
}

interface Category {
    id: string;
    name: string;
    count?: number;
}

export const CACHE_DURATION = 2 * 60 * 60 * 1000;

export const calculateCategoryCounts = (
    channels: any[],
    categories: Category[],
    selectedCountry: string = 'all'
) => {
    const counts: { [key: string]: number } = {};


    const filteredChannels = selectedCountry === 'all'
        ? channels
        : channels.filter(channel => channel.country === selectedCountry);


    filteredChannels.forEach(channel => {
        if (channel.categories) {
            channel.categories.forEach((categoryId: string) => {
                counts[categoryId] = (counts[categoryId] || 0) + 1;
            });
        }
    });


    const totalCount = filteredChannels.length;


    const categoriesWithCounts = [
        { id: 'all', name: 'All Categories', count: totalCount },
        ...categories.map(category => ({
            ...category,
            count: counts[category.id] || 0
        }))
    ];

    return categoriesWithCounts;
};

export const getCachedCategoryCounts = (cacheKey: string, country: string): CategoryCount[] | null => {
    const fullCacheKey = `${cacheKey}-${country}`;
    const cached = localStorage.getItem(fullCacheKey);
    if (!cached) return null;

    try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(fullCacheKey);
            return null;
        }
        return data;
    } catch (error) {
        localStorage.removeItem(fullCacheKey);
        return null;
    }
};

export const setCachedCategoryCounts = (cacheKey: string, data: Category[], country: string) => {
    const fullCacheKey = `${cacheKey}${country}`;
    const dataToCache = {
        data: data.map(cat => ({
            categoryId: cat.id,
            count: cat.count || 0,
            timestamp: Date.now()
        })),
        timestamp: Date.now()
    };

    try {
        localStorage.setItem(fullCacheKey, JSON.stringify(dataToCache));
    } catch (error) {
        console.error('Error caching category counts:', error);
    }
};