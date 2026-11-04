// Shuffle model groups before choosing cards, then vary their initial colors.
export function selectCollectionModels(models, limit = 4, random = Math.random) {
    const shuffled = models.filter(model => model.options?.length);
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const usedColors = new Set();
    return shuffled.slice(0, limit).map(model => {
        const colorKey = option => (option.colorHex || option.colorName || '').trim().toLowerCase();
        const candidates = model.options.filter(option => !usedColors.has(colorKey(option)));
        const pool = candidates.length ? candidates : model.options;
        const selected = pool[Math.floor(random() * pool.length)];
        usedColors.add(colorKey(selected));
        return { ...model, options: [selected, ...model.options.filter(option => option.id !== selected.id)] };
    });
}
