import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectFile = (relativePath: string): string => resolve(process.cwd(), relativePath)

describe('Stable release automation', () => {
  it('publishes a version-matched GitHub release whenever a version tag is pushed', () => {
    const workflow = readFileSync(projectFile('.github/workflows/release.yml'), 'utf8')
    const packageJson = JSON.parse(readFileSync(projectFile('package.json'), 'utf8')) as {
      scripts?: Record<string, string>
    }

    expect(workflow).toMatch(/tags:\s*\n\s*-\s*['"]v\*['"]/) 
    expect(workflow).toContain('contents: write')
    expect(workflow).toContain('npm ci')
    expect(workflow).toContain('npm run test')
    expect(workflow).toContain('npm run typecheck')
    expect(workflow).toContain('npm run release')
    expect(workflow).toContain('github.ref_name')
    expect(packageJson.scripts?.release).toContain('electron-builder --win --publish always')
  })
})
