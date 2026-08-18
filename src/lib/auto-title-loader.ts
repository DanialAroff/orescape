import { readFileSync } from "node:fs";
import type { Loader, LoaderContext } from "astro/loaders";
import { titleFromFilename, titleFromH1 } from "./title";

function deriveTitle(filePath: string): string {
  const raw = readFileSync(filePath, "utf-8");
  const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, "");
  return titleFromH1(body) ?? titleFromFilename(filePath);
}

/**
 * Wraps a Loader so any entry missing a `title` gets one derived from its
 * first H1 heading, falling back to a title-cased filename. Starlight's
 * schema requires `title` in `data`, which comes from `parseData()` — that
 * runs before remark plugins ever see the file, so this can't be done as a
 * remark plugin and has to patch the loader instead.
 */
export function withAutoTitle(loader: Loader): Loader {
  return {
    ...loader,
    load: async (context: LoaderContext) => {
      const parseData = context.parseData.bind(context);
      context.parseData = async (props) => {
        if (!props.data?.title) {
          const title =
            (props.filePath && deriveTitle(props.filePath)) ||
            titleFromFilename(props.filePath ?? props.id);
          props = { ...props, data: { ...props.data, title } };
        }
        return parseData(props);
      };
      return loader.load(context);
    },
  };
}
