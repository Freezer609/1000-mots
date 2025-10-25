from playwright.sync_api import sync_playwright
import os

def run(playwright):
    # Desktop screenshot
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto(f"file://{os.getcwd()}/index.html")
    page.screenshot(path="jules-scratch/verification/desktop.png")

    # Mobile screenshot
    iphone_13 = playwright.devices['iPhone 13']
    browser = playwright.webkit.launch()
    context = browser.new_context(
        **iphone_13,
    )
    page = context.new_page()
    page.goto(f"file://{os.getcwd()}/index.html")
    page.screenshot(path="jules-scratch/verification/mobile.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
