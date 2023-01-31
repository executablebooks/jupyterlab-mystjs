import type { Root } from 'mdast';
import type { StaticNotebook } from '@jupyterlab/notebook';
import type { Image } from 'myst-spec';
import { selectAll } from 'unist-util-select';

type Options = {
  parent: StaticNotebook;
};

export async function imageUrlSourceTransform(
  tree: Root,
  opts: Options
): Promise<void> {
  const images = selectAll('image', tree) as Image[];
  await Promise.all(
    images.map(async image => {
      if (!image || !image.url) return;
      // TODO: not sure why, but the cell seems to have a private _rendermime?
      // How else to get `attachment:` to work?
      const rendermime =
        opts.parent.rendermime ??
        (opts.parent as any)._rendermime ??
        (opts.parent.parent as any).rendermime;
      if (!rendermime) return;
      const path = await rendermime.resolver?.resolveUrl(image.url);
      if (!path) return;
      const url = await rendermime.resolver?.getDownloadUrl(path);
      if (!url) return;
      image.url = url;
    })
  );
}
