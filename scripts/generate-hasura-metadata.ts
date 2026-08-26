import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";
import { AUTH_STORAGE_INCLUDES, PUBLIC_TABLES } from "../src/lib/auth/permission-matrix.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tablesDir = path.join(root, "nhost/metadata/databases/default/tables");

function dump(value: unknown): string {
  return stringify(value, { lineWidth: 0 });
}

fs.mkdirSync(tablesDir, { recursive: true });

const includes: string[] = [...AUTH_STORAGE_INCLUDES];

for (const table of PUBLIC_TABLES) {
  const doc: Record<string, unknown> = {
    table: { name: table.name, schema: "public" },
  };

  if (table.objectRelationships?.length) {
    doc.object_relationships = table.objectRelationships.map((rel) => {
      if (rel.remote) {
        return {
          name: rel.name,
          using: {
            foreign_key_constraint_on: {
              column: rel.remote.column,
              table: { name: rel.remote.table, schema: rel.remote.schema ?? "public" },
            },
          },
        };
      }
      return {
        name: rel.name,
        using: { foreign_key_constraint_on: rel.column },
      };
    });
  }

  if (table.arrayRelationships?.length) {
    doc.array_relationships = table.arrayRelationships.map((rel) => ({
      name: rel.name,
      using: {
        foreign_key_constraint_on: {
          column: rel.column,
          table: { name: rel.table, schema: "public" },
        },
      },
    }));
  }

  for (const op of ["insert", "select", "update", "delete"] as const) {
    const entries = table.permissions.filter((p) => p.operations[op]);
    if (!entries.length) continue;
    doc[`${op}_permissions`] = entries.map((p) => {
      const spec = p.operations[op]!;
      const permission: Record<string, unknown> = {};
      if (op === "insert") {
        permission.check = spec.filter;
        if (spec.set && Object.keys(spec.set).length > 0) permission.set = spec.set;
        permission.columns = spec.columns;
      } else if (op === "select") {
        permission.columns = spec.columns;
        permission.filter = spec.filter;
        if (spec.limit) permission.limit = spec.limit;
      } else if (op === "update") {
        permission.filter = spec.filter;
        permission.check = spec.filter;
        permission.columns = spec.columns;
      } else {
        permission.filter = spec.filter;
      }
      return { role: p.role, permission };
    });
  }

  const file = `public_${table.name}.yaml`;
  fs.writeFileSync(path.join(tablesDir, file), dump(doc));
  includes.push(`!include ${file}`);
}

fs.writeFileSync(path.join(tablesDir, "tables.yaml"), dump(includes));
console.log(`Wrote ${PUBLIC_TABLES.length} public tables + tables.yaml`);
