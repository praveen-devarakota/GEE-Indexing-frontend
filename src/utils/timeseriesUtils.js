/**
 * Fills null values per index using linear interpolation.
 * Nulls at the start/end of a series are left as null (no extrapolation).
 * All N scenes from the backend are preserved — no data is removed.
 */
export function interpolateNulls(data, keys = ["NDVI", "NDWI", "NSMI"]) {
  if (!Array.isArray(data) || data.length === 0) return data;

  const result = data.map((d) => ({ ...d }));

  keys.forEach((key) => {
    // Collect indices of non-null values
    const knownIndices = [];
    result.forEach((d, i) => {
      if (d[key] !== null && d[key] !== undefined) knownIndices.push(i);
    });

    if (knownIndices.length < 2) return; // nothing to interpolate from

    for (let i = 0; i < result.length; i++) {
      if (result[i][key] !== null && result[i][key] !== undefined) continue;

      // Find surrounding known values
      const before = knownIndices.filter((ki) => ki < i).at(-1);
      const after  = knownIndices.find((ki) => ki > i);

      if (before === undefined || after === undefined) continue; // edge null — leave as null

      const t  = (i - before) / (after - before);
      result[i][key] = result[before][key] + t * (result[after][key] - result[before][key]);
      result[i][`${key}_interpolated`] = true; // flag for styling
    }
  });

  return result;
}

/**
 * Computes first and second discrete derivatives per index.
 * Output arrays are the same length as input — edge positions use one-sided differences.
 */
export function computeDerivatives(data, keys = ["NDVI", "NDWI", "NSMI"]) {
  if (!Array.isArray(data) || data.length < 2) return data;

  const result = data.map((d) => ({ ...d }));
  const n = result.length;

  keys.forEach((key) => {
    const vals = result.map((d) => d[key] ?? null);

    // First derivative (central differences, forward/backward at edges)
    const d1 = vals.map((v, i) => {
      if (v === null) return null;
      if (i === 0)   return vals[1] !== null ? vals[1] - vals[0] : null;
      if (i === n-1) return vals[n-2] !== null ? vals[n-1] - vals[n-2] : null;
      if (vals[i-1] === null || vals[i+1] === null) return null;
      return (vals[i+1] - vals[i-1]) / 2;
    });

    // Second derivative
    const d2 = d1.map((v, i) => {
      if (v === null) return null;
      if (i === 0 || i === n-1) return null;
      if (d1[i-1] === null || d1[i+1] === null) return null;
      return (d1[i+1] - d1[i-1]) / 2;
    });

    result.forEach((r, i) => {
      r[`${key}_d1`] = d1[i];
      r[`${key}_d2`] = d2[i];
    });
  });

  return result;
}