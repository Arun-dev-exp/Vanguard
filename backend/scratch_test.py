import asyncio
from app.bot.nlp.analyzer import analyze_message

async def main():
    res = await analyze_message("Please check this link: http://example.com")
    print(res)

if __name__ == "__main__":
    asyncio.run(main())
