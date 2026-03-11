# Generator System Maintenance Procedures

## Inventory Management
- Update generator-registry.json for new, updated or deprecated generators
- Ensure each entry has: id, name, description, category, type, priority, version, status, icon, owner, dependencies, docs
- Keep version increments semantic (MAJOR.MINOR.PATCH)
- Record updatedAt timestamps when modifying entries

## Documentation Workflow
1. For new generators:
   - Add entry with status `coming_soon`
   - Run docs generator to create initial Coming Soon doc
   - Fill Purpose and Technical Specifications sections
   - Set expected release date and assign reviewer
2. When implementation begins:
   - Change status to `available`
   - Regenerate docs to switch to Generator Specification template
   - Complete Inputs, Outputs, Validation and Error Handling sections
3. On release:
   - Update version and change log
   - Mark Approved with reviewer sign-off

## Automated Docs
- Run scripts/generate-generator-docs.js to refresh all generator docs
- Output files live in docs/generators/{id}.md
- Validate generated docs for placeholders before publishing

## Validation Checklist
- ID matches route/component
- Category and type set correctly
- Version follows semantic versioning
- Owner and Reviewer assigned
- Dependencies listed or set to None
- Documentation has no unresolved placeholders
- Accessibility notes included

## Quality Standards
- Documentation is clear, complete and technically accurate
- All generators are versioned and tracked in the registry
- System supports easy updates and additions through single-source registry
- Validation checks performed before each release

## Change Tracking
- Use Change Log in each doc to record updates
- Update generator-registry.json priority and version as needed

