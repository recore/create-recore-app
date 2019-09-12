import { readFile } from 'fs-extra';
import { join } from 'path';

export default async function readPackageJson(context: string): Promise<RecoreCreate.IPackageInformation | null> {
  if (!context) { return Promise.resolve(null); }

  const file = join(context, 'package.json');
  return readFile(file, { encoding: 'utf8' })
    .then(data => {
      try {
        return JSON.parse(data);
      } catch (err) {
        return Promise.resolve(null);
      }
    })
    .catch(() => {
      return Promise.resolve(null);
    });
}