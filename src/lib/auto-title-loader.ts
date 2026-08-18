import { readFileSync } from "node:fs";
import path from "node:path";
import type { Loader, LoaderContext } from "astro/loaders";

function titleFromFilename(filePath: string): string {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function titleFromH1(filePath: string): string | undefined {
  const raw = readFileSync(filePath, "utf-8");
  const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, "");
  return /^#\s+(.+)$/m.exec(body)?.[1]?.trim();
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
            (props.filePath && titleFromH1(props.filePath)) ||
            titleFromFilename(props.filePath ?? props.id);
          props = { ...props, data: { ...props.data, title } };
        }
        return parseData(props);
      };
      return loader.load(context);
    },
  };
}
