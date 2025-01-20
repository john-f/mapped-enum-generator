#!/usr/bin/env node

import { generatorHandler, GeneratorOptions } from "@prisma/generator-helper";
import { writeFile } from "fs/promises";
import { join } from "path";
import { promises as fs } from "node:fs";

generatorHandler({
  onManifest() {
    return {
      name: "mapped-enum-generator",
      defaultOutput: "./generated",
      prettyName: "Mapped Enum Generator",
    };
  },
  async onGenerate({ dmmf, generator }: GeneratorOptions) {
    const outputDir = generator.output?.value ?? "./generated";

    // enum const values will be mapped name if it exists
    const enums = dmmf.datamodel.enums
      .map(({ name, values }) => {
        const enumValues = values
          .map(({ name, dbName }) => `  ${name} = '${dbName ?? name}'`)
          .join(",\n");

        return `export enum ${name} {\n${enumValues}\n}`;
      })
      .join("\n\n");

    await fs.mkdir(outputDir, { recursive: true });
    const outputPath = join(outputDir, "mapped.enums.ts");
    await writeFile(outputPath, enums);
  },
});
