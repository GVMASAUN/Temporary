import { writeFileSync } from 'fs';
import { dedent } from 'tslint/lib/utils';
import { promisify } from 'util';
import * as child from 'child_process';
const exec = promisify(child.exec);

async function createVersionsFile(filename: string) {
  const revision = (await exec('git rev-parse --short HEAD')).stdout
    .toString()
    .trim();

  const date = new Date();

  console.log(`revision: '${revision}', date: '${date}'`);

  const content = dedent`
      // this file is automatically generated by git.version.ts script
      export const versions = {
        revision: '${revision}',
        date: '${date}'
      };`;

  writeFileSync(filename, content, { encoding: 'utf8' });
}

createVersionsFile('src/environments/versions.ts');
