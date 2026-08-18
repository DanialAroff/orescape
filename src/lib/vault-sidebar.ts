import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { titleFromFilename, titleFromH1 } from "./title";

type SidebarEntry =
  | { label: string; link: string }
  | { label: string; items: SidebarEntry[] };

function entryTitle(filePath: string, fileName: string): string {
  const raw = readFileSync(filePath, "utf-8");
  let data: Record<string, unknown> = {};
  let content = raw;
  try {
    ({ data, content } = matter(raw));
  } catch {
    // invalid frontmatter - fall through to H1/filename, same as vaultLoader
  }
  return (
    (typeof data.title === "string" ? data.title : undefined) ??
    titleFromH1(content) ??
    titleFromFilename(fileName)
  );
}

/** id must match vaultLoader's: relative path, posix separators, no extension. */
function toId(relativeDir: string, fileName: string): string {
  const withoutExt = fileName.replace(/\.md$/i, "");
  return [relativeDir, withoutExt].filter(Boolean).join("/");
}

function scanDir(absDir: string, relativeDir: string): SidebarEntry[] {
  let entries;
  try {
    entries = readdirSync(absDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const dirGroups = entries
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (e): SidebarEntry => ({
        label: e.name,
        items: scanDir(
          path.join(absDir, e.name),
          relativeDir ? `${relativeDir}/${e.name}` : e.name,
        ),
      }),
    )
    .filter((group) => "items" in group && group.items.length > 0);

  const links = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".md"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (e): SidebarEntry => ({
        label: entryTitle(path.join(absDir, e.name), e.name),
        link: `vault/${toId(relativeDir, e.name)}`,
      }),
    );
    console.log(dirGroups);
    console.log(links);
  return [...dirGroups, ...links];
}

/**
 * Mirrors a vault's folder structure into Starlight sidebar groups, e.g.
 * "Daily Notes" and "Engineering Handbook" as their own collapsible
 * sections - the same segmentation DFoundry got via `autogenerate`, which
 * only works against the built-in `docs` collection and can't target our
 * separate `vault` collection.
 */
export function vaultSidebar(vaultPath: string): SidebarEntry[] {
  return scanDir(vaultPath, "");
}
