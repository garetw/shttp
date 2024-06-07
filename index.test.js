import assert from 'assert'
import App from './index.js'
import { test } from '@playwright/test'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Convert the file URL to a path
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Define a directory to store test results
const testResults = path.join(__dirname, '.', 'test-results')

// A function to take a screenshot and save it with a unique name
const screenshot = async (page, testName) => {
  try {
    const testDir = path.join(testResults, testName)
    await fs.promises.mkdir(testDir, { recursive: true })
    const screenshotPath = path.join(testDir, 'screenshot.png')
    await page.screenshot({ fullPage: true, path: screenshotPath });
    console.log(`Screenshot saved: ${screenshotPath}`);  // Log to confirm the screenshot was saved
    return screenshotPath;
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
}

test.describe('ui.server.test.js', (config) => {
  if (!config) {
    config = {
      port: 4001,
      logging: false,
    }
  }

  let server

  // init, and start the server
  test.beforeAll(async () => {
    server = App(config)
    const init = await server.init()
    assert.equal(init, true)
    const started = await server.start()
    assert.equal(started, 'running')
  })

  // stop the server
  test.afterAll(async () => {
    const stopped = await server.stop()
    assert.equal(stopped, 'stopped')
  })

  // test the status
  test('should return the status', async () => {
    const status = server.status()
    assert.equal(status, 'running')
  })

  // test the healthcheck endpoint
  test('should hit the healthcheck endpoint', async ({ page }) => {
    await page.goto(`http://localhost:${config.port}/health`)
    const text = await page.textContent('body')
    assert.equal(text, '{"status":"ok"}')
  })

  // test 404
  test('should return 404 for missing endpoint', async ({ page }) => {
    await page.goto(`http://localhost:${config.port}/missing`)
    const text = await page.textContent('body')
    assert.equal(text, 'Not Found')
  })

  // test serving index.html
  test('should serve index.html', async ({ page }) => {
    await page.goto(`http://localhost:${config.port}/index.html`)
    // screenshot the page with a name
    await screenshot(page, 'index.html')
  })
})
