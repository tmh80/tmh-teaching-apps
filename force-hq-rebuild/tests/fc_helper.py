"""Shared helper for tests that finish a Check: press the big Finish button, pass the blank-questions warning if it appears, read the results pop-up, close it.
Use finish_check(pg) with sync playwright, or await afinish_check(pg) with async playwright.
Returns the text of the results pop-up ('' if none appeared)."""
def finish_check(pg, anyway=True):
    pg.locator('#finishCheck').scroll_into_view_if_needed(); pg.locator('#finishCheck').click(); pg.wait_for_timeout(300)
    if pg.locator('#modal #finAnyway').count() and anyway:
        pg.locator('#finAnyway').click(); pg.wait_for_timeout(300)
    txt = pg.locator('#modal .finmodal').inner_text() if pg.locator('#modal .finmodal #finTotal').count() else ''
    if txt:
        pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    return txt

async def afinish_check(pg, anyway=True):
    await pg.locator('#finishCheck').scroll_into_view_if_needed(); await pg.locator('#finishCheck').click(); await pg.wait_for_timeout(300)
    if await pg.locator('#modal #finAnyway').count() and anyway:
        await pg.locator('#finAnyway').click(); await pg.wait_for_timeout(300)
    txt = await pg.locator('#modal .finmodal').inner_text() if await pg.locator('#modal .finmodal #finTotal').count() else ''
    if txt:
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
    return txt
