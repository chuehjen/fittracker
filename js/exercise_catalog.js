// ===== Curated Exercise Catalog =====
// Non-media metadata generated from hasaneyldrm/exercises-dataset.

let catalogPromise = null;

export async function loadCuratedExerciseCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch('./data/exercise_catalog.json')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load exercise catalog: ${res.status}`);
        return res.json();
      })
      .then(payload => payload.exercises || []);
  }
  return catalogPromise;
}

export function mapCatalogExerciseToOption(item) {
  return {
    id: item.id,
    name: item.nameZh || item.nameEn,
    nameEn: item.nameEn,
    bodyPart: item.bodyPart,
    equipment: item.equipment,
    target: item.target,
    tags: [item.target, item.equipment].filter(Boolean),
    stepsZh: item.stepsZh || [],
    isExternal: true,
  };
}
