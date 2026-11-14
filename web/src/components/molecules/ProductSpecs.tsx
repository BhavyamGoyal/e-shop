export interface ProductSpecsProps {
  length: number | null;
  width: number | null;
  height: number | null;
  weight: number | null;
  material: string | null;
}

interface SpecRow {
  label: string;
  value: string;
}

const buildRows = ({ length, width, height, weight, material }: ProductSpecsProps): SpecRow[] => {
  const rows: SpecRow[] = [];
  if (length != null) rows.push({ label: "Length", value: `${length} cm` });
  if (width != null) rows.push({ label: "Width", value: `${width} cm` });
  if (height != null) rows.push({ label: "Height", value: `${height} cm` });
  if (weight != null) rows.push({ label: "Weight", value: `${weight} g` });
  if (material) rows.push({ label: "Material", value: material });
  return rows;
};

export function ProductSpecs(props: ProductSpecsProps) {
  const rows: SpecRow[] = buildRows(props);
  if (rows.length === 0) return null;
  return (
    <table className="w-full overflow-hidden rounded-xl border border-(--pp-line-soft) text-sm">
      <tbody className="divide-y divide-(--pp-line-soft)">
        {rows.map((row: SpecRow) => (
          <tr key={row.label}>
            <th scope="row" className="w-2/5 bg-(--pp-bone) px-3 py-2 text-left text-xs font-medium tracking-[0.12em] text-(--pp-muted) uppercase">
              {row.label}
            </th>
            <td className="px-3 py-2 font-semibold text-(--pp-ink)">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
