import { XMLParser } from "fast-xml-parser";


export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    const res = (await fetch(feedURL, {
        headers: {
            "User-Agent": "gator"
        }
    }));

    if (!res.ok) {
    throw new Error(`failed to fetch feed: ${res.status} ${res.statusText}`);
    }

    const xml = await res.text();

    const parser = new XMLParser();
    let jObj = parser.parse(xml);

    const channel = jObj.rss?.channel;

    //Guard channel first
    if (!channel) {
    throw new Error("failed to parse channel");
    }

    //Validate the channel content
    if (!channel.title || !channel.link || !channel.description) {
        throw new Error(`parsed xml missing title, link or description`);
    }

    const items = Array.isArray(channel.item) ? channel.item : [];

    const rssItems: RSSItem[] = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const title = item.title;
        const link = item.link;
        const description = item.description;
        const pubDate = item.pubDate;

        if (!title || !link || !description || !pubDate) {
            continue;
        }

        rssItems.push({
        title,
        link,
        description,
        pubDate,
        });
        
    }

    return {
        channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: rssItems
        }
    }

}

//RSS types
type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};