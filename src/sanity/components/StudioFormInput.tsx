// Foundation, edit with care.
// The single global form input (registered at form.components.input in
// sanity.config.ts). Sanity allows only one input component at that slot, so we
// compose two editor aids here:
//   - At the DOCUMENT ROOT (props.id === 'root'), prepend the PageHelpBanner
//     ("what you're editing" + a link to the live page).
//   - For every other field, delegate to CharacterCountInput (a live counter on
//     capped text fields; a transparent pass-through for everything else).

import { Stack } from '@sanity/ui';
import type { InputProps } from 'sanity';
import { CharacterCountInput } from './CharacterCountInput';
import { PageHelpBanner } from './PageHelpBanner';

export function StudioFormInput(props: InputProps) {
  // The whole-document form arrives as the input with id 'root'. Prepend the
  // help banner there; PageHelpBanner renders nothing for types with no page.
  if (props.id === 'root') {
    return (
      <Stack space={4}>
        <PageHelpBanner
          schemaType={props.schemaType as { name: string; title?: string }}
          value={(props as { value?: unknown }).value}
        />
        {props.renderDefault(props)}
      </Stack>
    );
  }
  return <CharacterCountInput {...props} />;
}

export default StudioFormInput;
