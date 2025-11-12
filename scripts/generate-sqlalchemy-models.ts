#!/usr/bin/env tsx
/**
 * SQLALCHEMY MODEL GENERATOR FROM PRISMA SCHEMA
 *
 * Genera automaticamente modelli SQLAlchemy da schema Prisma
 * per mantenere 100% sync tra TypeScript e Python
 *
 * Usage: npm run generate:sqlalchemy
 */

import { getDMMF } from '@prisma/internals';
import fs from 'fs-extra';

const SCHEMA_PATH = 'database/prisma/schema.prisma';
const OUTPUT_PATH = 'database/python/models.py';

// Type mapping Prisma → SQLAlchemy
const TYPE_MAP: Record<string, string> = {
  'String': 'String',
  'Int': 'Integer',
  'BigInt': 'BigInteger',
  'Float': 'Float',
  'Decimal': 'Numeric',
  'Boolean': 'Boolean',
  'DateTime': 'DateTime',
  'Json': 'JSON',
  'Bytes': 'LargeBinary',
};

async function generateModels() {
  console.log('📝 Generating SQLAlchemy models from Prisma schema...\n');

  // Load Prisma schema
  const schemaContent = await fs.readFile(SCHEMA_PATH, 'utf-8');

  const dmmf = await getDMMF({
    datamodel: schemaContent,
  });

  // Generate enums
  const enumsCode = dmmf.datamodel.enums.map(generateEnum).join('\n\n');

  // Generate models
  const modelsCode = dmmf.datamodel.models.map(generateModel).join('\n\n');

  // Header
  const header = `# ==============================================================================
# AUTO-GENERATED SQLAlchemy Models from Prisma Schema
# ==============================================================================
# ⚠️  DO NOT EDIT MANUALLY!
#
# Generated on: ${new Date().toISOString()}
# Source: ${SCHEMA_PATH}
# Generator: scripts/generate-sqlalchemy-models.ts
#
# To regenerate: npm run generate:sqlalchemy
# ==============================================================================

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum, DECIMAL, BigInteger
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
from typing import Optional
import enum

# ==============================================================================
# ENUMS
# ==============================================================================

${enumsCode}

# ==============================================================================
# MODELS
# ==============================================================================

${modelsCode}
`;

  // Write file
  await fs.writeFile(OUTPUT_PATH, header);

  console.log(`✅ Generated ${dmmf.datamodel.models.length} models + ${dmmf.datamodel.enums.length} enums`);
  console.log(`📄 Output: ${OUTPUT_PATH}\n`);

  // Summary
  console.log('Models generated:');
  dmmf.datamodel.models.forEach(m => console.log(`  - ${m.name}`));
}

function generateEnum(enumDef: any): string {
  const values = enumDef.values.map((v: any) => `    ${v.name.toUpperCase()} = "${v.name}"`).join('\n');

  return `class ${enumDef.name}(str, enum.Enum):
    """${enumDef.name} enum"""
${values}`;
}

function generateModel(model: any): string {
  const tableName = model.dbName || model.name.toLowerCase();

  // Generate fields
  const fields = model.fields
    .filter((f: any) => f.kind !== 'object') // Skip relations for now
    .map(generateField)
    .join('\n    ');

  // Generate relationships
  const relationships = model.fields
    .filter((f: any) => f.kind === 'object')
    .map(generateRelationship)
    .join('\n    ');

  return `class ${model.name}(Base):
    """${model.name} model"""
    __tablename__ = "${tableName}"

    ${fields}${relationships ? '\n\n    # Relationships\n    ' + relationships : ''}

    def __repr__(self):
        return f"<${model.name}(id={self.id})>"`;
}

function generateField(field: any): string {
  const sqlType = TYPE_MAP[field.type] || field.type;
  const isPrimary = field.isId;
  const isRequired = field.isRequired;
  const isUnique = field.isUnique;
  const hasDefault = field.default !== undefined;

  let column = `${field.name} = Column(${sqlType}`;

  // Primary key
  if (isPrimary) {
    column += ', primary_key=True';
  }

  // Nullable
  if (!isRequired && !isPrimary) {
    column += ', nullable=True';
  }

  // Unique
  if (isUnique) {
    column += ', unique=True';
  }

  // Default value
  if (hasDefault && field.default.name) {
    if (field.default.name === 'now') {
      column += ', default=datetime.utcnow';
    } else if (field.default.name === 'autoincrement') {
      column += ', autoincrement=True';
    }
  }

  column += ')';

  // Add comment for optional fields
  if (!isRequired && !isPrimary) {
    column += '  # Optional';
  }

  return column;
}

function generateRelationship(field: any): string {
  // Basic relationship (many-to-one)
  return `${field.name} = relationship("${field.type}")  # TODO: Configure relationship`;
}

// Run generator
generateModels().catch(err => {
  console.error('❌ Generation failed:', err);
  process.exit(1);
});
