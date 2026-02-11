# PR conflict resolution (Formulus-App → target branch)

Conflicts in:
- `formulus/src/components/QRScannerModal.tsx`
- `formulus/src/screens/FormManagementScreen.tsx`

## Steps (resolve PR #316 conflicts)

1. **Fetch OpenDataEnsemble’s dev and merge it into Formulus-App:**
   ```powershell
   git fetch upstream
   git checkout Formulus-App
   git merge upstream/dev
   ```
   If you don’t have `upstream` yet: `git remote add upstream https://github.com/OpenDataEnsemble/ode.git`

2. **Resolve the two files** using the rules below, then:
   ```bash
   git add formulus/src/components/QRScannerModal.tsx formulus/src/screens/FormManagementScreen.tsx
   git commit -m "chore: resolve merge conflicts with dev (keep ODE Button/Input)"
   git push origin Formulus-App
   ```

---

## QRScannerModal.tsx

- **Keep (Formulus-App / ours):**
  - `import { Button } from './common/Button';`
  - All `<Button title="..." onPress={...} variant="..." size="..." />` usage (Grant Permission, Cancel, Close, Scan Again, Confirm).
- **Remove:** Any `TouchableOpacity` + `Text` button blocks that duplicate those actions (from the other branch).
- **If the other branch added:** New props, state, or logic (e.g. new handlers, new UI), keep that logic and keep using `Button` for the actions above.
- **Styles:** Keep our file; you can remove unused `button`, `retryButton`, `confirmButton`, `cancelButton`, `buttonText`, `cancelButtonText` if still present (we use shared Button now).

---

## FormManagementScreen.tsx

- **Keep (Formulus-App / ours):**
  - `import { ObservationCard, EmptyState, Button } from '../components/common';`
  - `<Button title="Add" ... />` in the form type actions.
  - `<Button title="Reset Database" ... />` in the footer.
- **Remove:** Any `TouchableOpacity` + `Text` or `Icon` for “Add” or “Reset Database” from the other branch.
- **If the other branch added:** New state, form types, or observation logic, keep that and keep our Button usage for Add and Reset Database.
- **Styles:** Keep our version (we removed `addButton`, `buttonText`, `resetButton`); if the other branch added new styles, keep those and keep our removals.

---

## Quick rule

For both files: **keep the Formulus-App version that uses the shared `Button` component**, and merge in any **new behavior or code** from the target branch (e.g. new props, new handlers, new state) so nothing from the other branch is lost.
