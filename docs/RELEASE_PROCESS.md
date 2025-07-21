# Release Process

This document outlines the process for creating new releases of the FinTask application.

## Version Management

FinTask follows semantic versioning (SemVer) with the format `vX.Y.Z`:

- **X**: Major version (breaking changes)
- **Y**: Minor version (new features, non-breaking)
- **Z**: Patch version (bug fixes, non-breaking)

## Version Files

Versions are maintained in two places:

1. **package.json**: Contains the version without the 'v' prefix (e.g., `2.3.0`)
2. **src/constants/version.js**: Contains the version with the 'v' prefix (e.g., `v2.3.0`)

Both files must be kept in sync. The validation script will check this.

## Release Steps

### Automated Release (Recommended)

```bash
# Create a new release with version vX.Y.Z
npm run release vX.Y.Z
```

This will:
1. Run pre-release checks (tests, security audit, etc.)
2. Create a release branch
3. Update versions in both files
4. Update the CHANGELOG.md
5. Create a git tag
6. Push the branch and create a PR

### Manual Release (If needed)

1. Create a release branch:
   ```bash
   git checkout -b release/vX.Y.Z
   ```

2. Update the version in package.json:
   ```json
   {
     "name": "fintask",
     "version": "X.Y.Z",
     ...
   }
   ```

3. Update the version in src/constants/version.js:
   ```javascript
   export const APP_VERSION = 'vX.Y.Z';
   ```

4. Update CHANGELOG.md with release notes

5. Commit changes:
   ```bash
   git add package.json src/constants/version.js CHANGELOG.md
   git commit -m "Release vX.Y.Z"
   ```

6. Create a tag:
   ```bash
   git tag vX.Y.Z
   ```

7. Push branch and tag:
   ```bash
   git push -u origin release/vX.Y.Z
   git push --tags
   ```

8. Create a PR to merge into main

## Post-Release

After the PR is merged:

1. Netlify will automatically deploy the new version
2. Verify the deployment is successful
3. Check that the correct version is displayed in the app

## Version Validation

To validate that versions are in sync:

```bash
node scripts/validate-versions.js
```

This script is automatically run during pre-release checks and when committing changes to both version files.